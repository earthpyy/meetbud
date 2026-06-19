import { Controller, Get, Query } from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'
import { AnalyticsService } from './analytics.service'
import { AnalyticsQueryDto } from './dto/analytics-query.dto'

@Roles('admin')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get()
  get(@Query() query: AnalyticsQueryDto) {
    return this.analytics.get(query)
  }
}
