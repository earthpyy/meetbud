import { Injectable } from '@nestjs/common'
import { Prisma, WorkspaceSettings } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CryptoService } from '../common/crypto/crypto.service'
import {
  shapeSettings,
  ShapedSettings,
} from '../common/shaping/settings-shaping'
import { UpdateSettingsDto } from './dto/update-settings.dto'

const SINGLETON_ID = 'default'

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  private getOrCreate(): Promise<WorkspaceSettings> {
    return this.prisma.workspaceSettings.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID },
      update: {},
    })
  }

  async get(): Promise<ShapedSettings> {
    return shapeSettings(await this.getOrCreate())
  }

  async update(dto: UpdateSettingsDto): Promise<ShapedSettings> {
    await this.getOrCreate()
    const { aiApiKey, recallApiKey, ...rest } = dto
    // Prisma treats `undefined` as "leave unchanged", so spreading optional
    // (absent) fields is safe.
    const data: Prisma.WorkspaceSettingsUpdateInput = { ...rest }
    if (aiApiKey) data.aiApiKey = this.crypto.encrypt(aiApiKey)
    if (recallApiKey) data.recallApiKey = this.crypto.encrypt(recallApiKey)
    const updated = await this.prisma.workspaceSettings.update({
      where: { id: SINGLETON_ID },
      data,
    })
    return shapeSettings(updated)
  }
}
