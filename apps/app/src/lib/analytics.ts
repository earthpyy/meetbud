// analytics.ts — deterministic mock-data helpers for the Analytics view.
// All figures are illustrative sample data (no API yet); the RNG is seeded so
// values stay stable across renders and reloads. Ported from analytics.jsx.

import type { AdminUser } from './types'
import { TODAY } from '@/data/meetings'
import { MONTH_ABBR, startOfWeek, addDays } from './format'

export type Granularity = 'weekly' | 'monthly'

export interface Period {
  d: Date
  label: string
}

export interface PeriodSeries {
  periods: Period[]
  meetings: number[]
  minutes: number[]
  tokens: number[]
}

export interface MemberStat extends AdminUser {
  mtgs: number
  avg: number
  mins: number
  hours: number
  tokens: number
  spark: number[]
}

// ── deterministic RNG (stable across renders/reloads) ──
function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ── build the weekly / monthly period buckets + series ──
export function buildPeriods(gran: Granularity): PeriodSeries {
  const N = 12
  let periods: Period[]
  if (gran === 'weekly') {
    periods = Array.from({ length: N }, (_, i) => {
      const d = addDays(startOfWeek(TODAY), -(N - 1 - i) * 7)
      return { d, label: `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}` }
    })
  } else {
    periods = Array.from({ length: N }, (_, i) => {
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - (N - 1 - i), 1)
      return {
        d,
        label:
          MONTH_ABBR[d.getMonth()] +
          (d.getMonth() === 0 ? ` ’${String(d.getFullYear()).slice(2)}` : ''),
      }
    })
  }
  const rM = mulberry32(seed(gran + '_meet'))
  const rD = mulberry32(seed(gran + '_dur'))
  const rT = mulberry32(seed(gran + '_tok'))
  const base = gran === 'weekly' ? 34 : 142
  const meetings: number[] = []
  const minutes: number[] = []
  const tokens: number[] = []
  for (let i = 0; i < N; i++) {
    const trend = base * (1 + 0.55 * (i / (N - 1))) // gentle growth
    const m = Math.round(trend * (0.82 + rM() * 0.36))
    const avg = 36 + rD() * 16 // avg meeting length (min)
    const mins = Math.round(m * avg)
    const tok = Math.round(mins * (1650 + rT() * 520)) // transcription + summary tokens / min
    meetings.push(m)
    minutes.push(mins)
    tokens.push(tok)
  }
  return { periods, meetings, minutes, tokens }
}

// ── per-member leaderboard stats (all-time, seeded by user id) ──
export function buildMemberStats(users: AdminUser[]): MemberStat[] {
  return users.map((u) => {
    const r = mulberry32(seed('u_' + u.id))
    const avg = Math.round(30 + r() * 28)
    const mins = u.meetings * avg
    const tok = Math.round(mins * (1600 + r() * 620))
    const spark = Array.from({ length: 10 }, () => 0.32 + r() * 0.68)
    return {
      ...u,
      mtgs: u.meetings,
      avg,
      mins,
      hours: mins / 60,
      tokens: tok,
      spark,
    }
  })
}
