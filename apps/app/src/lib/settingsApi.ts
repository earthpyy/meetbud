import { apiGet, apiPatch } from './api'

export interface ApiSettings {
  aiBaseUrl: string
  aiModel: string
  aiTemperature: number
  aiSystemPrompt: string
  aiApiKeySet: boolean
  recallBotName: string
  recallRegion: string
  recordingRetentionDays: number
  recallAutoLeave: boolean
  recallApiKeySet: boolean
  updatedAt: string
}

export interface UpdateSettingsPayload {
  aiApiKey?: string
  aiBaseUrl?: string
  aiModel?: string
  aiTemperature?: number
  aiSystemPrompt?: string
  recallApiKey?: string
  recallBotName?: string
  recallRegion?: string
  recordingRetentionDays?: number
  recallAutoLeave?: boolean
}

export const fetchSettings = () => apiGet<ApiSettings>('/settings')
export const updateSettings = (dto: UpdateSettingsPayload) =>
  apiPatch<ApiSettings>('/settings', dto)
