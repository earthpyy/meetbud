import { ref } from 'vue'
import { defineStore } from 'pinia'
import { setRecording as apiSetRecording } from '@/lib/meetingApi'

export const useRecordingsStore = defineStore('recordings', () => {
  // meetingId → recording-enabled override (seeded from the meeting list).
  const recordingMap = ref<Record<string, boolean>>({})

  function prime(id: string, on: boolean) {
    if (!(id in recordingMap.value)) {
      recordingMap.value = { ...recordingMap.value, [id]: on }
    }
  }
  function getRecording(id: string): boolean {
    return recordingMap.value[id] ?? false
  }
  async function setRecording(id: string, on: boolean) {
    recordingMap.value = { ...recordingMap.value, [id]: on }
    await apiSetRecording(id, on)
  }

  return { recordingMap, prime, getRecording, setRecording }
})
