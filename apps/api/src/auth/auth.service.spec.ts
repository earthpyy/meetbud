import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'

const config = {
  get: (k: string) => ({ OTP_TTL: 600 })[k],
} as unknown as ConfigService

function deps() {
  const redisStore = new Map<string, string>()
  const counters = new Map<string, number>()
  const redis = {
    get: jest.fn(async (k: string) => redisStore.get(k) ?? null),
    set: jest.fn(async (k: string, v: string) => void redisStore.set(k, v)),
    del: jest.fn(async (...keys: string[]) =>
      keys.forEach((k) => {
        redisStore.delete(k)
        counters.delete(k)
      }),
    ),
    exists: jest.fn(async (k: string) => redisStore.has(k)),
    incr: jest.fn(async (k: string) => {
      const n = (counters.get(k) ?? 0) + 1
      counters.set(k, n)
      return n
    }),
    expire: jest.fn(async () => undefined),
    keys: jest.fn(async () => []),
  }
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }
  const mail = {
    sendLoginCode: jest.fn(async (_email: string, _code: string) => undefined),
  }
  const tokens = {
    issueTokens: jest.fn(async () => ({ accessToken: 'a', refreshToken: 'r' })),
  }
  return { redis, prisma, mail, tokens, redisStore, counters }
}

describe('AuthService', () => {
  describe('requestCode', () => {
    it('sends a code for a known active user', async () => {
      const d = deps()
      d.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        status: 'active',
      })
      const service = new AuthService(
        d.prisma as any,
        d.redis as any,
        d.mail as any,
        d.tokens as any,
        config,
      )

      await service.requestCode('a@b.com')

      expect(d.mail.sendLoginCode).toHaveBeenCalledWith(
        'a@b.com',
        expect.stringMatching(/^\d{6}$/),
      )
      expect(d.redis.set).toHaveBeenCalledWith(
        'otp:a@b.com',
        expect.any(String),
        600,
      )
    })

    it('is a silent no-op for an unknown email (anti-enumeration)', async () => {
      const d = deps()
      d.prisma.user.findUnique.mockResolvedValue(null)
      const service = new AuthService(
        d.prisma as any,
        d.redis as any,
        d.mail as any,
        d.tokens as any,
        config,
      )

      await service.requestCode('nobody@b.com')

      expect(d.mail.sendLoginCode).not.toHaveBeenCalled()
    })

    it('does not resend while a cooldown key exists', async () => {
      const d = deps()
      d.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        status: 'active',
      })
      d.redisStore.set('otp-cooldown:a@b.com', '1')
      const service = new AuthService(
        d.prisma as any,
        d.redis as any,
        d.mail as any,
        d.tokens as any,
        config,
      )

      await service.requestCode('a@b.com')

      expect(d.mail.sendLoginCode).not.toHaveBeenCalled()
    })
  })

  describe('verify', () => {
    it('throws when there is no stored code', async () => {
      const d = deps()
      const service = new AuthService(
        d.prisma as any,
        d.redis as any,
        d.mail as any,
        d.tokens as any,
        config,
      )
      await expect(service.verify('a@b.com', '123456')).rejects.toBeInstanceOf(
        UnauthorizedException,
      )
    })

    it('rejects a wrong code', async () => {
      const d = deps()
      const service = new AuthService(
        d.prisma as any,
        d.redis as any,
        d.mail as any,
        d.tokens as any,
        config,
      )
      d.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        status: 'active',
      })
      await service.requestCode('a@b.com')
      await expect(service.verify('a@b.com', '000000')).rejects.toBeInstanceOf(
        UnauthorizedException,
      )
    })

    it('locks out after 5 attempts', async () => {
      const d = deps()
      const service = new AuthService(
        d.prisma as any,
        d.redis as any,
        d.mail as any,
        d.tokens as any,
        config,
      )
      d.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        status: 'active',
      })
      await service.requestCode('a@b.com')
      // 5 wrong attempts are allowed and rejected as invalid
      for (let i = 0; i < 5; i++) {
        await expect(service.verify('a@b.com', '000000')).rejects.toThrow(
          'Invalid code',
        )
      }
      // 6th attempt exceeds the limit and invalidates the OTP
      await expect(service.verify('a@b.com', '000000')).rejects.toThrow(
        'Too many attempts',
      )
      // subsequent attempts find no stored code
      await expect(service.verify('a@b.com', '000000')).rejects.toThrow(
        'Code expired or not found',
      )
    })

    it('verifies the right code, activates the user and issues tokens', async () => {
      const d = deps()
      const service = new AuthService(
        d.prisma as any,
        d.redis as any,
        d.mail as any,
        d.tokens as any,
        config,
      )
      d.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        status: 'invited',
      })
      // capture the generated code
      let sentCode = ''
      d.mail.sendLoginCode.mockImplementation(
        async (_e: string, code: string) => {
          sentCode = code
        },
      )
      await service.requestCode('a@b.com')

      d.prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'A B',
        title: null,
        timezone: null,
        role: 'member',
        status: 'active',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await service.verify('a@b.com', sentCode)

      expect(d.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'a@b.com' },
          data: expect.objectContaining({ status: 'active' }),
        }),
      )
      expect(result.accessToken).toBe('a')
      expect(result.refreshToken).toBe('r')
      expect(result.user.id).toBe('u1')
    })
  })
})
