<script setup lang="ts">
import { computed } from 'vue'
import { fmtDateMed, fmtDuration, fmtTime, relativeDay } from '@/lib/format'
import { PLATFORMS } from '@/lib/constants'
import type { Meeting } from '@/lib/types'
import { MEETINGS } from '@/data/meetings'
import { useRecordingsStore } from '@/stores/recordings'
import Icon from '@/components/Icon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import AttendeeStack from '@/components/AttendeeStack.vue'

const emit = defineEmits<{ event: [ev: Meeting] }>()
const recordings = useRecordingsStore()
const now = new Date()

interface Group {
  key: string
  date: Date
  items: Meeting[]
}

const groups = computed<Group[]>(() => {
  const upcoming = MEETINGS.filter(
    (m) => m.end >= now || m.status === 'ongoing',
  ).sort((a, b) => +a.start - +b.start)
  const out: Group[] = []
  upcoming.forEach((m) => {
    const key = m.start.toDateString()
    let g = out.find((x) => x.key === key)
    if (!g) {
      g = { key, date: m.start, items: [] }
      out.push(g)
    }
    g.items.push(m)
  })
  return out
})
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="max-w-[860px] mx-auto px-6 py-6">
      <div
        v-if="groups.length === 0"
        class="flex flex-col items-center justify-center py-24 text-center"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-4"
        >
          <Icon name="calendar-days" :size="24" class="text-base-content/30" />
        </div>
        <p class="font-semibold">No upcoming meetings</p>
        <p class="text-base-content/50 text-sm mt-1">You're all caught up.</p>
      </div>
      <div v-for="g in groups" :key="g.key" class="mb-7 last:mb-0">
        <div class="flex items-baseline gap-2 mb-2.5">
          <h3 class="text-[14px] font-bold tracking-tight">
            {{ relativeDay(g.date, now) }}
          </h3>
          <span class="text-[12.5px] text-base-content/45">{{
            fmtDateMed(g.date)
          }}</span>
          <span class="ml-auto text-[12px] text-base-content/40"
            >{{ g.items.length }} meeting{{
              g.items.length > 1 ? 's' : ''
            }}</span
          >
        </div>
        <div
          class="rounded-2xl border border-base-content/10 overflow-hidden divide-y divide-base-content/8 bg-base-100"
        >
          <button
            v-for="m in g.items"
            :key="m.id"
            class="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-base-content/[0.025] text-left transition-colors"
            @click="emit('event', m)"
          >
            <div class="w-16 shrink-0 text-right">
              <div
                class="text-[13px] font-semibold tabular-nums whitespace-nowrap"
              >
                {{ fmtTime(m.start) }}
              </div>
              <div class="text-[11px] text-base-content/40">
                {{ fmtDuration(m.duration) }}
              </div>
            </div>
            <div
              class="w-1 self-stretch rounded-full shrink-0"
              :style="{ background: PLATFORMS[m.platform].color }"
            />
            <div class="min-w-0 flex-1">
              <div
                class="font-semibold text-[14px] truncate flex items-center gap-1.5"
              >
                {{ m.title }}
                <Icon
                  v-if="recordings.getRecording(m.id)"
                  name="mic"
                  :size="13"
                  class="text-base-content/35 shrink-0"
                />
              </div>
              <div
                class="text-[12px] text-base-content/50 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :style="{ background: PLATFORMS[m.platform].color }"
                />{{ PLATFORMS[m.platform].label }}
              </div>
            </div>
            <div class="hidden sm:block">
              <AttendeeStack :people="m.attendeesP" :max="4" :size="26" />
            </div>
            <StatusBadge :status="m.status" sm />
            <Icon
              name="chevron-right"
              :size="18"
              class="text-base-content/30 shrink-0"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
