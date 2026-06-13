import { plainToInstance } from 'class-transformer'
import { IsInt, IsOptional, IsString, validateSync } from 'class-validator'

class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string

  @IsString()
  REDIS_URL!: string

  @IsString()
  JWT_ACCESS_SECRET!: string

  @IsString()
  JWT_REFRESH_SECRET!: string

  // TTLs are expressed in seconds (integers) so they work for both JWT expiresIn and Redis EX.
  @IsInt()
  JWT_ACCESS_TTL!: number

  @IsInt()
  JWT_REFRESH_TTL!: number

  @IsInt()
  OTP_TTL!: number

  @IsOptional()
  @IsString()
  SMTP_HOST?: string

  @IsOptional()
  @IsString()
  SMTP_PORT?: string

  @IsOptional()
  @IsString()
  SMTP_USER?: string

  @IsOptional()
  @IsString()
  SMTP_PASS?: string

  @IsOptional()
  @IsString()
  SMTP_FROM?: string
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validated, { skipMissingProperties: false })
  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`)
  }
  return validated
}
