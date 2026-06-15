import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Meeting, Participant, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { AuthUser } from '../auth/types'
import {
  shapeMeeting,
  shapeMeetingDetail,
  ShapedMeeting,
  ShapedMeetingDetail,
  PaginatedMeetings,
} from '../common/shaping/meeting-shaping'
import { detectPlatform } from './platform'
import { ListMeetingsQueryDto } from './dto/list-meetings-query.dto'
import { ListMeetingsPageQueryDto } from './dto/list-meetings-page-query.dto'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateRecordingDto } from './dto/update-recording.dto'

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  private visibilityWhere(user: AuthUser): Prisma.MeetingWhereInput {
    if (user.role === 'admin') return {}
    return {
      OR: [
        { organizerId: user.userId },
        { participants: { some: { userId: user.userId } } },
      ],
    }
  }

  private buildWhere(
    query: {
      q?: string
      filter?: ListMeetingsQueryDto['filter']
      from?: string
      to?: string
    },
    user: AuthUser,
  ): Prisma.MeetingWhereInput {
    const where: Prisma.MeetingWhereInput = { ...this.visibilityWhere(user) }
    if (query.q) where.title = { contains: query.q, mode: 'insensitive' }
    if (query.filter && query.filter !== 'all') {
      where.status =
        query.filter === 'processing'
          ? { in: ['transcribing', 'summarizing'] }
          : query.filter
    }
    if (query.from || query.to) {
      where.startAt = {}
      if (query.from) where.startAt.gte = new Date(query.from)
      if (query.to) where.startAt.lte = new Date(query.to)
    }
    return where
  }

  async list(
    query: ListMeetingsQueryDto,
    user: AuthUser,
  ): Promise<ShapedMeeting[]> {
    const where = this.buildWhere(query, user)
    const meetings = await this.prisma.meeting.findMany({
      where,
      include: { participants: true },
      orderBy: { startAt: 'desc' },
    })
    return meetings.map((m) => shapeMeeting(m, m.participants))
  }

  async listPaginated(
    query: ListMeetingsPageQueryDto,
    user: AuthUser,
  ): Promise<PaginatedMeetings> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const where = this.buildWhere(query, user)
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.meeting.findMany({
        where,
        include: { participants: true },
        orderBy: { startAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.meeting.count({ where }),
    ])
    return {
      items: rows.map((m) => shapeMeeting(m, m.participants)),
      total,
      page,
      pageSize,
    }
  }

  async findVisibleOrThrow(
    id: string,
    user: AuthUser,
  ): Promise<Meeting & { participants: Participant[] }> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { participants: true },
    })
    if (!meeting || !this.canSee(meeting, user)) {
      throw new NotFoundException('Meeting not found')
    }
    return meeting
  }

  private canSee(
    meeting: Meeting & { participants: Participant[] },
    user: AuthUser,
  ): boolean {
    if (user.role === 'admin') return true
    if (meeting.organizerId === user.userId) return true
    return meeting.participants.some((p) => p.userId === user.userId)
  }

  async get(id: string, user: AuthUser): Promise<ShapedMeetingDetail> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: true,
        recording: true,
        summary: { select: { id: true } },
        _count: { select: { transcript: true } },
      },
    })
    if (!meeting || !this.canSee(meeting, user)) {
      throw new NotFoundException('Meeting not found')
    }
    return shapeMeetingDetail(meeting, meeting.participants, {
      recording: meeting.recording,
      hasSummary: !!meeting.summary,
      hasTranscript: meeting._count.transcript > 0,
    })
  }

  async create(
    dto: CreateMeetingDto,
    user: AuthUser,
  ): Promise<ShapedMeetingDetail> {
    const account = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.userId },
    })
    const now = new Date()
    const meeting = await this.prisma.meeting.create({
      data: {
        title: dto.title?.trim() || 'Untitled meeting',
        platform: detectPlatform(dto.joinUrl),
        status: 'upcoming',
        startAt: now,
        endAt: new Date(now.getTime() + 30 * 60000),
        joinUrl: dto.joinUrl.trim(),
        recordingEnabled: true,
        organizerId: account.id,
        participants: {
          create: {
            userId: account.id,
            name: account.name,
            email: account.email,
            title: account.title,
            isOrganizer: true,
            isExternal: false,
          },
        },
      },
      include: { participants: true },
    })
    return shapeMeetingDetail(meeting, meeting.participants, {
      recording: null,
      hasSummary: false,
      hasTranscript: false,
    })
  }

  async setRecording(
    id: string,
    dto: UpdateRecordingDto,
    user: AuthUser,
  ): Promise<ShapedMeetingDetail> {
    await this.findVisibleOrThrow(id, user)
    await this.prisma.meeting.update({
      where: { id },
      data: { recordingEnabled: dto.recordingEnabled },
    })
    return this.get(id, user)
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const meeting = await this.findVisibleOrThrow(id, user)
    if (user.role !== 'admin' && meeting.organizerId !== user.userId) {
      throw new ForbiddenException('Only the organizer or an admin can delete a meeting')
    }
    await this.prisma.meeting.delete({ where: { id } })
  }
}
