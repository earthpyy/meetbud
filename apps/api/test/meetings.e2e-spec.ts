import request from 'supertest'
import {
  accessTokenFor,
  bootstrapTestApp,
  createMeeting,
  createUser,
  TestContext,
} from './helpers'

describe('Meetings (e2e)', () => {
  let ctx: TestContext
  const userIds: string[] = []
  const meetingIds: string[] = []

  beforeAll(async () => {
    ctx = await bootstrapTestApp()
  })
  afterAll(async () => {
    await ctx.prisma.meeting.deleteMany({ where: { id: { in: meetingIds } } })
    await ctx.prisma.user.deleteMany({ where: { id: { in: userIds } } })
    await ctx.app.close()
  })

  it('lists, creates, fetches, toggles and deletes a meeting for its organizer', async () => {
    const owner = await createUser(ctx, { role: 'member' })
    userIds.push(owner.id)
    const token = await accessTokenFor(ctx, owner)

    const created = await request(ctx.app.getHttpServer())
      .post('/api/meetings')
      .set('Authorization', `Bearer ${token}`)
      .send({ joinUrl: 'https://zoom.us/j/123', title: 'Vendor demo' })
      .expect(201)
    expect(created.body.platform).toBe('zoom')
    expect(created.body.organizer.userId).toBe(owner.id)
    const id = created.body.id
    meetingIds.push(id)

    const list = await request(ctx.app.getHttpServer())
      .get('/api/meetings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(list.body.some((m: { id: string }) => m.id === id)).toBe(true)

    const detail = await request(ctx.app.getHttpServer())
      .get(`/api/meetings/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(detail.body).toMatchObject({ id, hasSummary: false, hasTranscript: false })

    await request(ctx.app.getHttpServer())
      .patch(`/api/meetings/${id}/recording`)
      .set('Authorization', `Bearer ${token}`)
      .send({ recordingEnabled: false })
      .expect(200)
      .expect((r) => expect(r.body.recording).toBe(false))

    await request(ctx.app.getHttpServer())
      .delete(`/api/meetings/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  it('hides meetings from non-attendees (404) but shows them to admins', async () => {
    const owner = await createUser(ctx, { role: 'member' })
    const stranger = await createUser(ctx, { role: 'member' })
    const admin = await createUser(ctx, { role: 'admin' })
    userIds.push(owner.id, stranger.id, admin.id)

    const meeting = await createMeeting(ctx, owner)
    meetingIds.push(meeting.id)

    const strangerToken = await accessTokenFor(ctx, stranger)
    await request(ctx.app.getHttpServer())
      .get(`/api/meetings/${meeting.id}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .expect(404)

    const strangerList = await request(ctx.app.getHttpServer())
      .get('/api/meetings')
      .set('Authorization', `Bearer ${strangerToken}`)
      .expect(200)
    expect(strangerList.body.some((m: { id: string }) => m.id === meeting.id)).toBe(false)

    const adminToken = await accessTokenFor(ctx, admin)
    await request(ctx.app.getHttpServer())
      .get(`/api/meetings/${meeting.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
  })

  it('paginates and filters via /meetings/list', async () => {
    const owner = await createUser(ctx, { role: 'member' })
    const stranger = await createUser(ctx, { role: 'member' })
    userIds.push(owner.id, stranger.id)

    const a = await createMeeting(ctx, owner, { title: 'List A', status: 'done' })
    const b = await createMeeting(ctx, owner, { title: 'List B', status: 'done' })
    const c = await createMeeting(ctx, owner, { title: 'List C', status: 'upcoming' })
    meetingIds.push(a.id, b.id, c.id)

    const token = await accessTokenFor(ctx, owner)

    const page1 = await request(ctx.app.getHttpServer())
      .get('/api/meetings/list?page=1&pageSize=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(page1.body).toMatchObject({ page: 1, pageSize: 2, total: 3 })
    expect(page1.body.items).toHaveLength(2)

    const page2 = await request(ctx.app.getHttpServer())
      .get('/api/meetings/list?page=2&pageSize=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(page2.body.items).toHaveLength(1)

    const doneOnly = await request(ctx.app.getHttpServer())
      .get('/api/meetings/list?filter=done')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(doneOnly.body.total).toBe(2)
    expect(
      doneOnly.body.items.every((m: { status: string }) => m.status === 'done'),
    ).toBe(true)

    const strangerToken = await accessTokenFor(ctx, stranger)
    const strangerList = await request(ctx.app.getHttpServer())
      .get('/api/meetings/list')
      .set('Authorization', `Bearer ${strangerToken}`)
      .expect(200)
    expect(
      strangerList.body.items.some((m: { id: string }) =>
        [a.id, b.id, c.id].includes(m.id),
      ),
    ).toBe(false)
  })

  it('returns 404 for a summary that does not exist', async () => {
    const owner = await createUser(ctx, { role: 'member' })
    userIds.push(owner.id)
    const meeting = await createMeeting(ctx, owner)
    meetingIds.push(meeting.id)
    const token = await accessTokenFor(ctx, owner)
    await request(ctx.app.getHttpServer())
      .get(`/api/meetings/${meeting.id}/summary`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
    await request(ctx.app.getHttpServer())
      .get(`/api/meetings/${meeting.id}/transcript`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((r) => expect(r.body).toEqual([]))
  })
})
