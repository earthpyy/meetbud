import { MeetingsService } from './meetings.service'
import { AuthUser } from '../auth/types'

function makeService() {
  const prisma = {
    meeting: { findMany: jest.fn().mockResolvedValue([]) },
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
