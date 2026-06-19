import request from 'supertest'
import {
  accessTokenFor,
  bootstrapTestApp,
  createUser,
  TestContext,
} from './helpers'

describe('Profile (e2e)', () => {
  let ctx: TestContext
  const ids: string[] = []

  beforeAll(async () => {
    ctx = await bootstrapTestApp()
  })
  afterAll(async () => {
    await ctx.prisma.user.deleteMany({ where: { id: { in: ids } } })
    await ctx.app.close()
  })

  it('GET /me returns account + default preferences', async () => {
    const user = await createUser(ctx, { name: 'Pat Profile' })
    ids.push(user.id)
    const token = await accessTokenFor(ctx, user)

    const res = await request(ctx.app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body.id).toBe(user.id)
    expect(res.body.initials).toBe('PP')
    expect(res.body.preferences.autoRecord).toBe('organized')
  })

  it('PATCH /me updates account fields', async () => {
    const user = await createUser(ctx)
    ids.push(user.id)
    const token = await accessTokenFor(ctx, user)

    const res = await request(ctx.app.getHttpServer())
      .patch('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Head of Testing', timezone: 'America/Los_Angeles' })
      .expect(200)

    expect(res.body.title).toBe('Head of Testing')
    expect(res.body.timezone).toBe('America/Los_Angeles')
  })

  it('PATCH /me/preferences updates a preference', async () => {
    const user = await createUser(ctx)
    ids.push(user.id)
    const token = await accessTokenFor(ctx, user)

    const res = await request(ctx.app.getHttpServer())
      .patch('/api/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ slackSummaries: true, autoRecord: 'all' })
      .expect(200)

    expect(res.body.preferences.slackSummaries).toBe(true)
    expect(res.body.preferences.autoRecord).toBe('all')
  })

  it('rejects unknown fields (whitelist)', async () => {
    const user = await createUser(ctx)
    ids.push(user.id)
    const token = await accessTokenFor(ctx, user)
    await request(ctx.app.getHttpServer())
      .patch('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'admin' })
      .expect(400)
  })

  it('PATCH /me/preferences accepts null customPrompt to clear it', async () => {
    const user = await createUser(ctx)
    ids.push(user.id)
    const token = await accessTokenFor(ctx, user)

    const res = await request(ctx.app.getHttpServer())
      .patch('/api/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ customPromptEnabled: false, customPrompt: null })
      .expect(200)

    expect(res.body.preferences.customPrompt).toBeNull()
  })
})
