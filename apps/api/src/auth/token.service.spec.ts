import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { TokenService } from './token.service'

const config = {
  get: (key: string) =>
    ({
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_TTL: 900,
      JWT_REFRESH_TTL: 2592000,
    })[key],
} as unknown as ConfigService

function makeRedis() {
  const store = new Map<string, string>()
  const sets = new Map<string, Set<string>>()
  return {
    store,
    sets,
    set: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    del: jest.fn(async (...keys: string[]) =>
      keys.forEach((k) => {
        store.delete(k)
        sets.delete(k)
      }),
    ),
    exists: jest.fn(async (k: string) => store.has(k)),
    expire: jest.fn(async () => undefined),
    sadd: jest.fn(async (k: string, ...members: string[]) => {
      const s = sets.get(k) ?? new Set<string>()
      members.forEach((m) => s.add(m))
      sets.set(k, s)
    }),
    srem: jest.fn(async (k: string, ...members: string[]) => {
      const s = sets.get(k)
      if (s) members.forEach((m) => s.delete(m))
    }),
    smembers: jest.fn(async (k: string) => [...(sets.get(k) ?? [])]),
  }
}

describe('TokenService', () => {
  const jwt = new JwtService({})

  it('issues an access + refresh token and stores the refresh jti', async () => {
    const redis = makeRedis()
    const prisma = { user: { findUnique: jest.fn() } } as any
    const service = new TokenService(jwt, redis as any, config, prisma)

    const pair = await service.issueTokens({ id: 'u1', role: 'member' })

    expect(pair.accessToken).toEqual(expect.any(String))
    expect(pair.refreshToken).toEqual(expect.any(String))
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^refresh:u1:/),
      '1',
      2592000,
    )
  })

  it('rotates: deletes the old jti and issues a new pair', async () => {
    const redis = makeRedis()
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1', role: 'member' }),
      },
    } as any
    const service = new TokenService(jwt, redis as any, config, prisma)
    const { refreshToken } = await service.issueTokens({
      id: 'u1',
      role: 'member',
    })
    const sizeBefore = redis.store.size

    const next = await service.rotate(refreshToken)

    expect(next.refreshToken).toEqual(expect.any(String))
    expect(next.refreshToken).not.toEqual(refreshToken)
    expect(redis.store.size).toBe(sizeBefore) // one deleted, one added
  })

  it('rejects a refresh token that is not in the allowlist', async () => {
    const redis = makeRedis()
    const prisma = { user: { findUnique: jest.fn() } } as any
    const service = new TokenService(jwt, redis as any, config, prisma)
    const { refreshToken } = await service.issueTokens({
      id: 'u1',
      role: 'member',
    })
    redis.store.clear() // simulate revocation / expiry

    await expect(service.rotate(refreshToken)).rejects.toThrow()
  })

  it('revokeAll removes every refresh key for the user', async () => {
    const redis = makeRedis()
    const prisma = { user: { findUnique: jest.fn() } } as any
    const service = new TokenService(jwt, redis as any, config, prisma)
    await service.issueTokens({ id: 'u1', role: 'member' })
    await service.issueTokens({ id: 'u1', role: 'member' })

    await service.revokeAll('u1')

    expect(
      [...redis.store.keys()].filter((k) => k.startsWith('refresh:u1:')),
    ).toHaveLength(0)
  })
})
