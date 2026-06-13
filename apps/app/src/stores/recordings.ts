import { ref } from 'vue'
import { defineStore } from 'pinia'
import { byId } from '@/data/meetings'

export const useRecordingsStore = defineStore(
  'recordings',
  () => {
    const recordingMap = ref<Record<string, boolean>>({})

    function getRecording(id: string): boolean {
      if (id in recordingMap.value) return recordingMap.value[id]
      return byId(id)?.recording ?? false
    }
    function setRecording(id: string, on: boolean) {
      recordingMap.value = { ...recordingMap.value, [id]: on }
    }

    return { recordingMap, getRecording, setRecording }
  },
  { persist: true },
)
