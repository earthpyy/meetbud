import { MeetingsService } from './meetings.service'
import { AuthUser } from '../auth/types'

function makeService() {
  const prisma = {
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    meeting: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  }
  const service = new MeetingsService(prisma as never)
  return { service, prisma }
}

describe('MeetingsService.list visibility', () => {
  it('does not restrict meetings for admins', async () => {
    const { service, prisma } = makeService()
    const admin: AuthUser = { userId: 'a1', role: 'admin' }
    await service.list({}, admin)
    const where = prisma.meeting.findMany.mock.calls[0][0].where
    expect(where.OR).toBeUndefined()
  })

  it('restricts to organizer or participant for members', async () => {
    const { service, prisma } = makeService()
    const member: AuthUser = { userId: 'u1', role: 'member' }
    await service.list({}, member)
    const where = prisma.meeting.findMany.mock.calls[0][0].where
    expect(where.OR).toEqual([
      { organizerId: 'u1' },
      { participants: { some: { userId: 'u1' } } },
    ])
  })

  it('applies the processing filter as transcribing + summarizing', async () => {
    const { service, prisma } = makeService()
    const admin: AuthUser = { userId: 'a1', role: 'admin' }
    await service.list({ filter: 'processing' }, admin)
    const where = prisma.meeting.findMany.mock.calls[0][0].where
    expect(where.status).toEqual({ in: ['transcribing', 'summarizing'] })
  })
})

describe('MeetingsService.listPaginated', () => {
  it('computes skip/take from page+pageSize and returns the envelope', async () => {
    const { service, prisma } = makeService()
    prisma.meeting.count = jest.fn().mockResolvedValue(7)
    const admin: AuthUser = { userId: 'a1', role: 'admin' }
    const res = await service.listPaginated({ page: 2, pageSize: 3 }, admin)
    const findManyArg = prisma.meeting.findMany.mock.calls[0][0]
    expect(findManyArg.skip).toBe(3)
    expect(findManyArg.take).toBe(3)
    expect(findManyArg.orderBy).toEqual({ startAt: 'desc' })
    expect(res).toEqual({ items: [], total: 7, page: 2, pageSize: 3 })
  })

  it('defaults to page 1 / pageSize 20', async () => {
    const { service, prisma } = makeService()
    const admin: AuthUser = { userId: 'a1', role: 'admin' }
    const res = await service.listPaginated({}, admin)
    const findManyArg = prisma.meeting.findMany.mock.calls[0][0]
    expect(findManyArg.skip).toBe(0)
    expect(findManyArg.take).toBe(20)
    expect(res.page).toBe(1)
    expect(res.pageSize).toBe(20)
  })

  it('applies the processing filter and uses the same where for count', async () => {
    const { service, prisma } = makeService()
    const admin: AuthUser = { userId: 'a1', role: 'admin' }
    await service.listPaginated({ filter: 'processing' }, admin)
    const findManyWhere = prisma.meeting.findMany.mock.calls[0][0].where
    const countWhere = prisma.meeting.count.mock.calls[0][0].where
    expect(findManyWhere.status).toEqual({ in: ['transcribing', 'summarizing'] })
    expect(countWhere).toEqual(findManyWhere)
  })
})
