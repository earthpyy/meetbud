import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { pad2, startOfWeek, addDays } from '@/lib/format'
import type { Meeting } from '@/lib/types'
import { fetchMeetingsRange, fetchMeetingsPage } from '@/lib/meetingApi'
import { useRecordingsStore } from '@/stores/recordings'

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

export const useMeetingsStore = defineStore('meetings', () => {
  const recordings = useRecordingsStore()

  // --- shared identity cache: every loaded meeting lands here ---
  const all = ref<Meeting[]>([])
  const loadedMonths = ref<Set<string>>(new Set())
  const monthLoading = new Set<string>()

  function absorb(list: Meeting[]) {
    const map = new Map(all.value.map((m) => [m.id, m]))
    for (const m of list) {
      map.set(m.id, m)
      recordings.prime(m.id, m.recording)
    }
    all.value = [...map.values()]
  }

  function byId(id: string): Meeting | undefined {
    return all.value.find((m) => m.id === id)
  }

  function remember(meeting: Meeting) {
    absorb([meeting])
  }

  // --- calendar: month cache ---
  async function loadMonth(date: Date) {
    const key = monthKey(date)
    if (loadedMonths.value.has(key) || monthLoading.has(key)) return
    monthLoading.add(key)
    try {
      const first = new Date(date.getFullYear(), date.getMonth(), 1)
      const from = startOfWeek(first)
      const to = addDays(from, 42)
      const list = await fetchMeetingsRange(from.toISOString(), to.toISOString())
      absorb(list)
      loadedMonths.value = new Set(loadedMonths.value).add(key)
    } finally {
      monthLoading.delete(key)
    }
  }

  function meetingsInRange(from: Date, to: Date): Meeting[] {
    return all.value.filter((m) => m.start >= from && m.start <= to)
  }

  function invalidateCalendar() {
    loadedMonths.value = new Set()
    monthLoading.clear()
  }

  // --- notes: paginated list ---
  const notes = reactive({
    items: [] as Meeting[],
    total: 0,
    page: 1,
    pageSize: 20,
    q: '',
    filter: 'all',
    loading: false,
  })

  async function loadNotesPage(page: number) {
    notes.loading = true
    try {
      const res = await fetchMeetingsPage({
        page,
        pageSize: notes.pageSize,
        q: notes.q,
        filter: notes.filter,
      })
      notes.items = res.items
      notes.total = res.total
      notes.page = res.page
      notes.pageSize = res.pageSize
      absorb(res.items)
    } finally {
      notes.loading = false
    }
  }

  async function setNotesQuery(patch: { q?: string; filter?: string }) {
    if (patch.q !== undefined) notes.q = patch.q
    if (patch.filter !== undefined) notes.filter = patch.filter
    await loadNotesPage(1)
  }

  return {
    all,
    byId,
    remember,
    loadMonth,
    meetingsInRange,
    invalidateCalendar,
    notes,
    loadNotesPage,
    setNotesQuery,
  }
})
