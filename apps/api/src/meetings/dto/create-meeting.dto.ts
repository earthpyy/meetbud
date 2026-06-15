import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateMeetingDto {
  @IsString()
  @MinLength(7)
  joinUrl!: string

  @IsOptional()
  @IsString()
  title?: string
}
