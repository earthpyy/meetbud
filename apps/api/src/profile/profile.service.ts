import { Injectable } from '@nestjs/common'
import { UserPreference } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { shapeUser, ShapedUser } from '../common/shaping/user-shaping'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdatePreferencesDto } from './dto/update-preferences.dto'

export interface ProfileResponse extends ShapedUser {
  preferences: Omit<UserPreference, 'id' | 'userId'>
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensurePreferences(
    userId: string,
    data: UpdatePreferencesDto = {},
  ): Promise<UserPreference> {
    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
    })
  }

  private toResponse(
    user: Parameters<typeof shapeUser>[0],
    prefs: UserPreference,
  ): ProfileResponse {
    const { id: _id, userId: _userId, ...preferences } = prefs
    return { ...shapeUser(user), preferences }
  }

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    })
    const prefs = await this.ensurePreferences(userId)
    return this.toResponse(user, prefs)
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    })
    const prefs = await this.ensurePreferences(userId)
    return this.toResponse(user, prefs)
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    })
    const prefs = await this.ensurePreferences(userId, dto)
    return this.toResponse(user, prefs)
  }
}
