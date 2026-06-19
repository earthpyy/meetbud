import { apiGet, apiPatch } from './api'

export type AutoRecord = 'all' | 'organized' | 'off'

export interface ApiPreferences {
  autoRecord: AutoRecord
  joinEarly: boolean
  notifyOnSummary: boolean
  customPromptEnabled: boolean
  customPrompt: string | null
  weeklyDigest: boolean
  slackSummaries: boolean
}

export interface ApiProfile {
  id: string
  name: string
  email: string
  title: string | null
  timezone: string | null
  role: 'admin' | 'member'
  initials: string
  color: string
  preferences: ApiPreferences
}

export const fetchMe = () => apiGet<ApiProfile>('/me')

export const updateProfile = (dto: {
  name?: string
  title?: string
  timezone?: string
}) => apiPatch<ApiProfile>('/me', dto)

export const updatePreferences = (dto: Partial<ApiPreferences>) =>
  apiPatch<ApiProfile>('/me/preferences', dto)
