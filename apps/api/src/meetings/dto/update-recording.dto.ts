import { IsBoolean } from 'class-validator'

export class UpdateRecordingDto {
  @IsBoolean()
  recordingEnabled!: boolean
}
