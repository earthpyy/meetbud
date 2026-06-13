import { Body, Controller, Get, Patch } from '@nestjs/common'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthUser } from '../auth/types'
import { ProfileService } from './profile.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdatePreferencesDto } from './dto/update-preferences.dto'

@Controller('me')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.profile.getProfile(user.userId)
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.profile.updateProfile(user.userId, dto)
  }

  @Patch('preferences')
  updatePreferences(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.profile.updatePreferences(user.userId, dto)
  }
}
