import { apiGet } from './api'
import type { PlatformKey } from './types'

export interface AnalyticsMember {
  id: string
  name: string
  role: 'admin' | 'member'
  email: string | null
  title: string | null
  initials: string
  color: string
  meetings: number
  hours: number
  tokens: number
  avgMin: number
  sparkline: number[]
  lastActive: string | null
}

export interface ApiAnalytics {
  granularity: 'weekly' | 'monthly'
  kpis: {
    meetings: number
    hoursTranscribed: number
    aiTokens: number
    activeUsers: number
    totalSeats: number
  }
  series: {
    periods: { label: string; start: string; end: string }[]
    meetings: number[]
    minutes: number[]
    tokens: number[]
  }
  platformSplit: { platform: PlatformKey; count: number }[]
  members: AnalyticsMember[]
}

export const fetchAnalytics = (granularity: 'weekly' | 'monthly') =>
  apiGet<ApiAnalytics>(`/analytics?granularity=${granularity}`)
