import request from 'supertest'
import {
  accessTokenFor,
  bootstrapTestApp,
  createUser,
  TestContext,
} from './helpers'

describe('Analytics (e2e)', () => {
  let ctx: TestContext
  const ids: string[] = []

  beforeAll(async () => {
    ctx = await bootstrapTestApp()
  })
  afterAll(async () => {
    await ctx.prisma.user.deleteMany({ where: { id: { in: ids } } })
    await ctx.app.close()
  })

  it('members are forbidden from /analytics', async () => {
    const member = await createUser(ctx, { role: 'member' })
    ids.push(member.id)
    const token = await accessTokenFor(ctx, member)
    await request(ctx.app.getHttpServer())
      .get('/api/analytics')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  it('admin gets the analytics shape with 12 periods', async () => {
    const admin = await createUser(ctx, { role: 'admin' })
    ids.push(admin.id)
    const token = await accessTokenFor(ctx, admin)

    const res = await request(ctx.app.getHttpServer())
      .get('/api/analytics?granularity=monthly')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body.granularity).toBe('monthly')
    expect(res.body.series.periods).toHaveLength(12)
    expect(res.body.series.meetings).toHaveLength(12)
    expect(typeof res.body.kpis.totalSeats).toBe('number')
    expect(Array.isArray(res.body.members)).toBe(true)
  })

  it('rejects an invalid granularity (whitelist + IsIn)', async () => {
    const admin = await createUser(ctx, { role: 'admin' })
    ids.push(admin.id)
    const token = await accessTokenFor(ctx, admin)
    await request(ctx.app.getHttpServer())
      .get('/api/analytics?granularity=daily')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})
