import { IsIn, IsOptional } from 'class-validator'

export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(['weekly', 'monthly'])
  granularity?: 'weekly' | 'monthly'
}
