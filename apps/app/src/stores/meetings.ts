import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Meeting } from '@/lib/types'
import { fetchMeetings } from '@/lib/meetingApi'

export const useMeetingsStore = defineStore('meetings', () => {
  const meetings = ref<Meeting[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      meetings.value = await fetchMeetings()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function byId(id: string): Meeting | undefined {
    return meetings.value.find((m) => m.id === id)
  }

  return { meetings, loaded, loading, load, byId }
})
