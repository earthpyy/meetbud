import request from 'supertest'
import {
  accessTokenFor,
  bootstrapTestApp,
  createUser,
  TestContext,
  uniqueEmail,
} from './helpers'

describe('Users (e2e)', () => {
  let ctx: TestContext
  const ids: string[] = []
  const emails: string[] = []

  beforeAll(async () => {
    ctx = await bootstrapTestApp()
  })
  afterAll(async () => {
    await ctx.prisma.user.deleteMany({ where: { id: { in: ids } } })
    await ctx.prisma.user.deleteMany({ where: { email: { in: emails } } })
    await ctx.app.close()
  })

  it('members are forbidden from /users', async () => {
    const member = await createUser(ctx, { role: 'member' })
    ids.push(member.id)
    const token = await accessTokenFor(ctx, member)
    await request(ctx.app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  it('admin can invite, list, change role, and is blocked from self-actions', async () => {
    const admin = await createUser(ctx, { role: 'admin' })
    ids.push(admin.id)
    const token = await accessTokenFor(ctx, admin)
    const inviteEmail = uniqueEmail('invite')
    emails.push(inviteEmail)

    const inviteRes = await request(ctx.app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: inviteEmail, role: 'member' })
      .expect(201)
    expect(inviteRes.body.status).toBe('invited')
    expect(ctx.mail.invites).toContain(inviteEmail)
    const invitedId = inviteRes.body.id

    await request(ctx.app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: inviteEmail, role: 'member' })
      .expect(409)

    const listRes = await request(ctx.app.getHttpServer())
      .get('/api/users?filter=invited')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(listRes.body.some((u: { id: string }) => u.id === invitedId)).toBe(
      true,
    )

    await request(ctx.app.getHttpServer())
      .patch(`/api/users/${invitedId}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'admin' })
      .expect(200)

    await request(ctx.app.getHttpServer())
      .post(`/api/users/${invitedId}/resend`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    await request(ctx.app.getHttpServer())
      .patch(`/api/users/${admin.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'member' })
      .expect(403)
    await request(ctx.app.getHttpServer())
      .delete(`/api/users/${admin.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    await request(ctx.app.getHttpServer())
      .delete(`/api/users/${invitedId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})
