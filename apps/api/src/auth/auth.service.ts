import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomInt } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../common/redis/redis.service'
import { MailService } from '../common/mail/mail.service'
import { TokenService } from './token.service'
import { shapeUser } from '../common/shaping/user-shaping'
import { AuthResult } from './types'

const MAX_OTP_TRIES = 5
const RESEND_COOLDOWN_SECONDS = 30

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
    private readonly tokens: TokenService,
    private readonly config: ConfigService,
  ) {}

  private otpKey(email: string) {
    return `otp:${email}`
  }
  private triesKey(email: string) {
    return `otp-tries:${email}`
  }
  private cooldownKey(email: string) {
    return `otp-cooldown:${email}`
  }
  private hash(email: string, code: string) {
    return createHash('sha256').update(`${email}:${code}`).digest('hex')
  }

  async requestCode(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return // anti-enumeration: silently no-op for unknown emails
    if (user.status !== 'active' && user.status !== 'invited') return
    if (await this.redis.exists(this.cooldownKey(email))) return

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
    const ttl = Number(this.config.get('OTP_TTL'))
    await this.redis.set(this.otpKey(email), this.hash(email, code), ttl)
    await this.redis.del(this.triesKey(email))
    await this.redis.set(this.cooldownKey(email), '1', RESEND_COOLDOWN_SECONDS)
    await this.mail.sendLoginCode(email, code)
  }

  async verify(email: string, code: string): Promise<AuthResult> {
    const stored = await this.redis.get(this.otpKey(email))
    if (!stored) throw new UnauthorizedException('Code expired or not found')

    const tries = await this.redis.incr(this.triesKey(email))
    if (tries === 1) {
      await this.redis.expire(
        this.triesKey(email),
        Number(this.config.get('OTP_TTL')),
      )
    }
    if (tries > MAX_OTP_TRIES) {
      await this.redis.del(this.otpKey(email), this.triesKey(email))
      throw new UnauthorizedException('Too many attempts')
    }
    if (stored !== this.hash(email, code)) {
      throw new UnauthorizedException('Invalid code')
    }

    await this.redis.del(
      this.otpKey(email),
      this.triesKey(email),
      this.cooldownKey(email),
    )
    const user = await this.prisma.user.update({
      where: { email },
      data: { status: 'active', lastLoginAt: new Date() },
    })
    const tokens = await this.tokens.issueTokens({
      id: user.id,
      role: user.role,
    })
    return { ...tokens, user: shapeUser(user) }
  }
}
