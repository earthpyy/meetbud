import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator'

export type MeetingFilter =
  | 'all'
  | 'done'
  | 'processing'
  | 'ongoing'
  | 'upcoming'

export class ListMeetingsQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsIn(['all', 'done', 'processing', 'ongoing', 'upcoming'])
  filter?: MeetingFilter

  @IsOptional()
  @IsISO8601()
  from?: string

  @IsOptional()
  @IsISO8601()
  to?: string
}
