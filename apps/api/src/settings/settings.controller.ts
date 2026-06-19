import { Body, Controller, Get, Patch } from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@Roles('admin')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get()
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto)
  }
}
