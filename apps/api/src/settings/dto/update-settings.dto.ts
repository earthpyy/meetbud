import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  aiApiKey?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  aiBaseUrl?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  aiModel?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  aiTemperature?: number

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  aiSystemPrompt?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  recallApiKey?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  recallBotName?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  recallRegion?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  recordingRetentionDays?: number

  @IsOptional()
  @IsBoolean()
  recallAutoLeave?: boolean
}
