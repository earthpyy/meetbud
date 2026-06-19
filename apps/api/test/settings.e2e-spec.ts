import request from 'supertest'
import {
  accessTokenFor,
  bootstrapTestApp,
  createUser,
  TestContext,
} from './helpers'

describe('Settings (e2e)', () => {
  let ctx: TestContext
  const ids: string[] = []

  beforeAll(async () => {
    ctx = await bootstrapTestApp()
  })
  afterAll(async () => {
    await ctx.prisma.user.deleteMany({ where: { id: { in: ids } } })
    await ctx.prisma.workspaceSettings.deleteMany({})
    await ctx.app.close()
  })

  it('members are forbidden from /settings', async () => {
    const member = await createUser(ctx, { role: 'member' })
    ids.push(member.id)
    const token = await accessTokenFor(ctx, member)
    await request(ctx.app.getHttpServer())
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  it('admin GET masks secrets; PATCH stores then preserves a key', async () => {
    const admin = await createUser(ctx, { role: 'admin' })
    ids.push(admin.id)
    const token = await accessTokenFor(ctx, admin)

    const get1 = await request(ctx.app.getHttpServer())
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(get1.body.aiApiKeySet).toBe(false)
    expect(get1.body).not.toHaveProperty('aiApiKey')

    await request(ctx.app.getHttpServer())
      .patch('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ aiApiKey: 'sk-ant-real', aiModel: 'claude-sonnet-4-6' })
      .expect(200)

    const get2 = await request(ctx.app.getHttpServer())
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(get2.body.aiApiKeySet).toBe(true)
    expect(get2.body.aiModel).toBe('claude-sonnet-4-6')

    // Saving without a key must not wipe the stored one.
    await request(ctx.app.getHttpServer())
      .patch('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ recallBotName: 'Bot X' })
      .expect(200)
    const get3 = await request(ctx.app.getHttpServer())
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(get3.body.aiApiKeySet).toBe(true)
    expect(get3.body.recallBotName).toBe('Bot X')
  })

  it('rejects unknown fields (whitelist)', async () => {
    const admin = await createUser(ctx, { role: 'admin' })
    ids.push(admin.id)
    const token = await accessTokenFor(ctx, admin)
    await request(ctx.app.getHttpServer())
      .patch('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ bogus: true })
      .expect(400)
  })
})
