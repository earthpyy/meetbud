import request from 'supertest'
import {
  bootstrapTestApp,
  createUser,
  TestContext,
  uniqueEmail,
} from './helpers'

describe('Auth (e2e)', () => {
  let ctx: TestContext
  const createdEmails: string[] = []

  beforeAll(async () => {
    ctx = await bootstrapTestApp()
  })
  afterAll(async () => {
    await ctx.prisma.user.deleteMany({
      where: { email: { in: createdEmails } },
    })
    await ctx.app.close()
  })

  it('request-code → verify → authenticated request → refresh → logout', async () => {
    const email = uniqueEmail()
    createdEmails.push(email)
    await createUser(ctx, { email, status: 'invited' })

    await request(ctx.app.getHttpServer())
      .post('/api/auth/request-code')
      .send({ email })
      .expect(200)

    const code = ctx.mail.loginCodes.get(email)
    expect(code).toMatch(/^\d{6}$/)

    const verifyRes = await request(ctx.app.getHttpServer())
      .post('/api/auth/verify')
      .send({ email, code })
      .expect(200)
    expect(verifyRes.body.accessToken).toEqual(expect.any(String))
    expect(verifyRes.body.refreshToken).toEqual(expect.any(String))
    expect(verifyRes.body.user.status).toBe('active')

    await request(ctx.app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${verifyRes.body.accessToken}`)
      .expect(200)

    const refreshRes = await request(ctx.app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: verifyRes.body.refreshToken })
      .expect(200)
    expect(refreshRes.body.accessToken).toEqual(expect.any(String))

    await request(ctx.app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: verifyRes.body.refreshToken })
      .expect(401)

    await request(ctx.app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${refreshRes.body.accessToken}`)
      .expect(200)
    await request(ctx.app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: refreshRes.body.refreshToken })
      .expect(401)
  })

  it('returns 200 for an unknown email without sending a code', async () => {
    const email = uniqueEmail('ghost')
    await request(ctx.app.getHttpServer())
      .post('/api/auth/request-code')
      .send({ email })
      .expect(200)
    expect(ctx.mail.loginCodes.has(email)).toBe(false)
  })

  it('rejects a bad code', async () => {
    const email = uniqueEmail()
    createdEmails.push(email)
    await createUser(ctx, { email })
    await request(ctx.app.getHttpServer())
      .post('/api/auth/request-code')
      .send({ email })
      .expect(200)
    await request(ctx.app.getHttpServer())
      .post('/api/auth/verify')
      .send({ email, code: '000000' })
      .expect(401)
  })
})
