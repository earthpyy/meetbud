import { AutoRecord } from '@prisma/client'
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(AutoRecord)
  autoRecord?: AutoRecord

  @IsOptional()
  @IsBoolean()
  joinEarly?: boolean

  @IsOptional()
  @IsBoolean()
  notifyOnSummary?: boolean

  @IsOptional()
  @IsBoolean()
  customPromptEnabled?: boolean

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  customPrompt?: string

  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean

  @IsOptional()
  @IsBoolean()
  slackSummaries?: boolean
}
