import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthUser } from '../auth/types'
import { shapeTranscript } from '../common/shaping/meeting-shaping'
import { MeetingsService } from './meetings.service'

@Injectable()
export class TranscriptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetings: MeetingsService,
  ) {}

  async get(meetingId: string, user: AuthUser) {
    await this.meetings.findVisibleOrThrow(meetingId, user)
    const segments = await this.prisma.transcriptSegment.findMany({
      where: { meetingId },
      orderBy: { order: 'asc' },
    })
    return shapeTranscript(segments)
  }
}
