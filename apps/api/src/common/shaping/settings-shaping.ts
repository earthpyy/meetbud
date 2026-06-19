import { WorkspaceSettings } from '@prisma/client'

export interface ShapedSettings {
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
  updatedAt: Date
}

export function shapeSettings(s: WorkspaceSettings): ShapedSettings {
  return {
    aiBaseUrl: s.aiBaseUrl,
    aiModel: s.aiModel,
    aiTemperature: s.aiTemperature,
    aiSystemPrompt: s.aiSystemPrompt,
    aiApiKeySet: !!s.aiApiKey,
    recallBotName: s.recallBotName,
    recallRegion: s.recallRegion,
    recordingRetentionDays: s.recordingRetentionDays,
    recallAutoLeave: s.recallAutoLeave,
    recallApiKeySet: !!s.recallApiKey,
    updatedAt: s.updatedAt,
  }
}
