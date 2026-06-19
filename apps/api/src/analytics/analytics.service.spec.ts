import { AnalyticsService } from './analytics.service'

function makeService(meetings: any[]) {
  const prisma = {
    meeting: { findMany: jest.fn().mockResolvedValue(meetings) },
    user: {
      count: jest
        .fn()
        .mockResolvedValueOnce(3) // active users
        .mockResolvedValueOnce(5), // total seats
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'u1',
          name: 'Alex Rivera',
          email: 'a@b.com',
          title: 'PM',
          lastLoginAt: null,
        },
      ]),
    },
  }
  return { svc: new AnalyticsService(prisma as any), prisma }
}

describe('AnalyticsService', () => {
  it('queries only meetings that have a recording', async () => {
    const { svc, prisma } = makeService([])
    await svc.get({ granularity: 'monthly' })
    const where = prisma.meeting.findMany.mock.calls[0][0].where
    expect(where.recording).toEqual({ isNot: null })
  })

  it('defaults to monthly and returns 12 periods', async () => {
    const { svc } = makeService([])
    const res = await svc.get({})
    expect(res.granularity).toBe('monthly')
    expect(res.series.periods).toHaveLength(12)
  })

  it('buckets current meetings into the latest period and attributes by organizer', async () => {
    const now = new Date()
    const { svc } = makeService([
      {
        startAt: now,
        platform: 'meet',
        organizerId: 'u1',
        recording: { durationSec: 3600 },
        summary: { inputTokens: 100, outputTokens: 50 },
      },
      {
        startAt: now,
        platform: 'zoom',
        organizerId: 'u1',
        recording: { durationSec: 3600 },
        summary: null,
      },
    ])
    const res = await svc.get({ granularity: 'monthly' })
    const last = res.series.meetings.length - 1
    expect(res.series.meetings[last]).toBe(2)
    expect(res.kpis.meetings).toBe(2)
    expect(res.kpis.aiTokens).toBe(150)
    expect(res.kpis.hoursTranscribed).toBe(2)
    expect(res.kpis.activeUsers).toBe(3)
    expect(res.kpis.totalSeats).toBe(5)
    const m = res.members.find((x) => x.id === 'u1')!
    expect(m.meetings).toBe(2)
    expect(m.tokens).toBe(150)
    expect(res.platformSplit.find((p) => p.platform === 'meet')!.count).toBe(1)
    expect(res.platformSplit.find((p) => p.platform === 'zoom')!.count).toBe(1)
  })
})
