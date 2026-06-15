import { Module } from '@nestjs/common'
import { MeetingsController } from './meetings.controller'
import { MeetingsService } from './meetings.service'
import { TranscriptService } from './transcript.service'
import { SummaryService } from './summary.service'

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, TranscriptService, SummaryService],
})
export class MeetingsModule {}
