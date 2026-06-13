import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Role } from '@prisma/client'
import { randomUUID } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../common/redis/redis.service'
import { RefreshTokenPayload, TokenPair } from './types'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private refreshKey(userId: string, jti: string): string {
    return `refresh:${userId}:${jti}`
  }

  // Set of currently-valid jtis for a user — lets us revoke without scanning the keyspace.
  private refreshSetKey(userId: string): string {
    return `refresh-set:${userId}`
  }

  async issueTokens(user: { id: string; role: Role }): Promise<TokenPair> {
    const jti = randomUUID()
    const accessTtl = Number(this.config.get('JWT_ACCESS_TTL'))
    const refreshTtl = Number(this.config.get('JWT_REFRESH_TTL'))

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl,
      },
    )
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    )
    const setKey = this.refreshSetKey(user.id)
    await this.redis.set(this.refreshKey(user.id, jti), '1', refreshTtl)
    await this.redis.sadd(setKey, jti)
    await this.redis.expire(setKey, refreshTtl)
    return { accessToken, refreshToken }
  }

  async rotate(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshTokenPayload
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
    const key = this.refreshKey(payload.sub, payload.jti)
    if (!(await this.redis.exists(key))) {
      throw new UnauthorizedException('Refresh token revoked')
    }
    await this.redis.del(key)
    await this.redis.srem(this.refreshSetKey(payload.sub), payload.jti)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    })
    if (!user) throw new UnauthorizedException('User not found')
    return this.issueTokens({ id: user.id, role: user.role })
  }

  async revokeAll(userId: string): Promise<void> {
    const setKey = this.refreshSetKey(userId)
    const jtis = await this.redis.smembers(setKey)
    const keys = jtis.map((jti) => this.refreshKey(userId, jti))
    await this.redis.del(...keys, setKey)
  }
}
