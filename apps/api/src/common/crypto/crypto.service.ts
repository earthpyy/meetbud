import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

@Injectable()
export class CryptoService {
  private readonly key: Buffer

  constructor(config: ConfigService) {
    const raw = config.get<string>('SETTINGS_ENCRYPTION_KEY') ?? ''
    this.key = Buffer.from(raw, 'base64')
    if (this.key.length !== 32) {
      throw new Error(
        'SETTINGS_ENCRYPTION_KEY must be a base64-encoded 32-byte key',
      )
    }
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.key, iv)
    const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return [
      iv.toString('base64'),
      tag.toString('base64'),
      ct.toString('base64'),
    ].join(':')
  }

  decrypt(stored: string): string {
    const [ivB64, tagB64, ctB64] = stored.split(':')
    const iv = Buffer.from(ivB64, 'base64')
    const tag = Buffer.from(tagB64, 'base64')
    const ct = Buffer.from(ctB64, 'base64')
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString(
      'utf8',
    )
  }
}
