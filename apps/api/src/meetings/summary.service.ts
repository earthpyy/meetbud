import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthUser } from '../auth/types'
import { shapeSummary } from '../common/shaping/meeting-shaping'
import { MeetingsService } from './meetings.service'

@Injectable()
export class SummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetings: MeetingsService,
  ) {}

  async get(meetingId: string, user: AuthUser) {
    await this.meetings.findVisibleOrThrow(meetingId, user)
    const summary = await this.prisma.summary.findUnique({ where: { meetingId } })
    if (!summary) throw new NotFoundException('Summary not available')
    return shapeSummary(summary)
  }
}
