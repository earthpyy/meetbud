import { Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { shapePerson, ShapedPerson } from '../common/shaping/person-shaping'
import { AnalyticsQueryDto } from './dto/analytics-query.dto'

const BUCKETS = 12
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export interface AnalyticsPeriod {
  label: string
  start: string
  end: string
}

export interface AnalyticsMember extends ShapedPerson {
  role: Role
  meetings: number
  hours: number
  tokens: number
  avgMin: number
  sparkline: number[]
  lastActive: Date | null
}

export interface AnalyticsResponse {
  granularity: 'weekly' | 'monthly'
  kpis: {
    meetings: number
    hoursTranscribed: number
    aiTokens: number
    activeUsers: number
    totalSeats: number
  }
  series: {
    periods: AnalyticsPeriod[]
    meetings: number[]
    minutes: number[]
    tokens: number[]
  }
  platformSplit: { platform: string; count: number }[]
  members: AnalyticsMember[]
}

interface Bucket {
  start: Date
  end: Date
  label: string
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (x.getDay() + 6) % 7 // Monday = 0
  x.setDate(x.getDate() - dow)
  return x
}
function addWeeks(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n * 7)
  return x
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildBuckets(granularity: 'weekly' | 'monthly'): Bucket[] {
    const now = new Date()
    const buckets: Bucket[] = []
    if (granularity === 'weekly') {
      const thisWeek = startOfWeek(now)
      for (let i = BUCKETS - 1; i >= 0; i--) {
        const start = addWeeks(thisWeek, -i)
        const end = addWeeks(start, 1)
        buckets.push({
          start,
          end,
          label: `${start.getMonth() + 1}/${start.getDate()}`,
        })
      }
    } else {
      const thisMonth = startOfMonth(now)
      for (let i = BUCKETS - 1; i >= 0; i--) {
        const start = addMonths(thisMonth, -i)
        const end = addMonths(start, 1)
        buckets.push({ start, end, label: MONTHS[start.getMonth()] })
      }
    }
    return buckets
  }

  async get(query: AnalyticsQueryDto): Promise<AnalyticsResponse> {
    const granularity = query.granularity ?? 'monthly'
    const buckets = this.buildBuckets(granularity)
    const rangeStart = buckets[0].start

    const meetings = await this.prisma.meeting.findMany({
      where: { recording: { isNot: null }, startAt: { gte: rangeStart } },
      select: {
        startAt: true,
        platform: true,
        organizerId: true,
        recording: { select: { durationSec: true } },
        summary: { select: { inputTokens: true, outputTokens: true } },
      },
    })

    const bucketOf = (d: Date): number => {
      for (let i = 0; i < buckets.length; i++) {
        if (d >= buckets[i].start && d < buckets[i].end) return i
      }
      return -1
    }

    const meetingsSeries = new Array<number>(BUCKETS).fill(0)
    const minutesSeries = new Array<number>(BUCKETS).fill(0)
    const tokensSeries = new Array<number>(BUCKETS).fill(0)
    const platformCounts: Record<string, number> = {}
    const byOrganizer = new Map<
      string,
      { meetings: number; seconds: number; tokens: number; spark: number[] }
    >()

    for (const m of meetings) {
      const b = bucketOf(m.startAt)
      if (b < 0) continue
      const secs = m.recording?.durationSec ?? 0
      const toks =
        (m.summary?.inputTokens ?? 0) + (m.summary?.outputTokens ?? 0)
      meetingsSeries[b] += 1
      minutesSeries[b] += Math.round(secs / 60)
      tokensSeries[b] += toks
      platformCounts[m.platform] = (platformCounts[m.platform] ?? 0) + 1
      let agg = byOrganizer.get(m.organizerId)
      if (!agg) {
        agg = {
          meetings: 0,
          seconds: 0,
          tokens: 0,
          spark: new Array<number>(BUCKETS).fill(0),
        }
        byOrganizer.set(m.organizerId, agg)
      }
      agg.meetings += 1
      agg.seconds += secs
      agg.tokens += toks
      agg.spark[b] += 1
    }

    const [activeUsers, totalSeats] = await Promise.all([
      this.prisma.user.count({ where: { status: 'active' } }),
      this.prisma.user.count(),
    ])

    const organizerIds = [...byOrganizer.keys()]
    const users = organizerIds.length
      ? await this.prisma.user.findMany({ where: { id: { in: organizerIds } } })
      : []
    const members: AnalyticsMember[] = users.map((u) => {
      const agg = byOrganizer.get(u.id)!
      const minutes = Math.round(agg.seconds / 60)
      return {
        ...shapePerson(u),
        role: u.role,
        meetings: agg.meetings,
        hours: Math.round(agg.seconds / 3600),
        tokens: agg.tokens,
        avgMin: agg.meetings ? Math.round(minutes / agg.meetings) : 0,
        sparkline: agg.spark,
        lastActive: u.lastLoginAt,
      }
    })

    const totalSeconds = [...byOrganizer.values()].reduce(
      (a, o) => a + o.seconds,
      0,
    )

    return {
      granularity,
      kpis: {
        meetings: meetingsSeries.reduce((a, b) => a + b, 0),
        hoursTranscribed: Math.round(totalSeconds / 3600),
        aiTokens: tokensSeries.reduce((a, b) => a + b, 0),
        activeUsers,
        totalSeats,
      },
      series: {
        periods: buckets.map((b) => ({
          label: b.label,
          start: b.start.toISOString(),
          end: b.end.toISOString(),
        })),
        meetings: meetingsSeries,
        minutes: minutesSeries,
        tokens: tokensSeries,
      },
      platformSplit: Object.entries(platformCounts).map(
        ([platform, count]) => ({ platform, count }),
      ),
      members,
    }
  }
}
