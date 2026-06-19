import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchSettings,
  updateSettings,
  type ApiSettings,
  type UpdateSettingsPayload,
} from '@/lib/settingsApi'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<ApiSettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const savedAt = ref(0)

  // Editable working copy. Secret fields start blank (never hydrated from
  // the server, which only returns masked *Set flags).
  const draft = reactive<UpdateSettingsPayload>({})

  function hydrateDraft(s: ApiSettings) {
    draft.aiApiKey = ''
    draft.aiBaseUrl = s.aiBaseUrl
    draft.aiModel = s.aiModel
    draft.aiTemperature = s.aiTemperature
    draft.aiSystemPrompt = s.aiSystemPrompt
    draft.recallApiKey = ''
    draft.recallBotName = s.recallBotName
    draft.recallRegion = s.recallRegion
    draft.recordingRetentionDays = s.recordingRetentionDays
    draft.recallAutoLeave = s.recallAutoLeave
  }

  async function load() {
    loading.value = true
    try {
      const s = await fetchSettings()
      settings.value = s
      hydrateDraft(s)
    } finally {
      loading.value = false
    }
  }

  async function save() {
    saving.value = true
    try {
      const payload: UpdateSettingsPayload = { ...draft }
      // Drop empty secret fields so we never overwrite a stored key with ''.
      if (!payload.aiApiKey) delete payload.aiApiKey
      if (!payload.recallApiKey) delete payload.recallApiKey
      const s = await updateSettings(payload)
      settings.value = s
      hydrateDraft(s)
      savedAt.value = Date.now()
    } finally {
      saving.value = false
    }
  }

  return { settings, draft, loading, saving, savedAt, load, save }
})
