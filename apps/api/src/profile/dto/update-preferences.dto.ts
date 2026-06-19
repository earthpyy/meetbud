import { AutoRecord } from '@prisma/client'
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
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
  @ValidateIf((o) => o.customPrompt !== null)
  @IsString()
  @MaxLength(2000)
  customPrompt?: string | null

  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean

  @IsOptional()
  @IsBoolean()
  slackSummaries?: boolean
}
