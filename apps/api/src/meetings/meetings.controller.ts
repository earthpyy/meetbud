import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthUser } from '../auth/types'
import { MeetingsService } from './meetings.service'
import { TranscriptService } from './transcript.service'
import { SummaryService } from './summary.service'
import { ListMeetingsQueryDto } from './dto/list-meetings-query.dto'
import { ListMeetingsPageQueryDto } from './dto/list-meetings-page-query.dto'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateRecordingDto } from './dto/update-recording.dto'

@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly meetings: MeetingsService,
    private readonly transcript: TranscriptService,
    private readonly summary: SummaryService,
  ) {}

  @Get()
  list(@Query() query: ListMeetingsQueryDto, @CurrentUser() user: AuthUser) {
    return this.meetings.list(query, user)
  }

  @Post()
  create(@Body() dto: CreateMeetingDto, @CurrentUser() user: AuthUser) {
    return this.meetings.create(dto, user)
  }

  @Get('list')
  listPaginated(
    @Query() query: ListMeetingsPageQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.meetings.listPaginated(query, user)
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.meetings.get(id, user)
  }

  @Get(':id/transcript')
  getTranscript(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.transcript.get(id, user)
  }

  @Get(':id/summary')
  getSummary(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.summary.get(id, user)
  }

  @Patch(':id/recording')
  setRecording(
    @Param('id') id: string,
    @Body() dto: UpdateRecordingDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.meetings.setRecording(id, dto, user)
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.meetings.remove(id, user)
    return { ok: true }
  }
}
