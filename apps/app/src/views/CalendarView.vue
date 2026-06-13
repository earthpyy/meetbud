<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/lib/cn'
import {
  MONTHS,
  MONTH_ABBR,
  addDays,
  fmtDateLong,
  startOfWeek,
} from '@/lib/format'
import type { Meeting } from '@/lib/types'
import { useUiStore } from '@/stores/ui'
import type { CalView } from '@/stores/ui'
import Icon from '@/components/Icon.vue'
import TimeGrid from '@/components/calendar/TimeGrid.vue'
import MonthView from '@/components/calendar/MonthView.vue'
import ListView from '@/components/calendar/ListView.vue'
import MeetingPopup from '@/components/calendar/MeetingPopup.vue'

const ui = useUiStore()
const anchor = ref(new Date())
const popup = ref<Meeting | null>(null)

const view = computed(() => ui.calView)
const views: CalView[] = ['day', 'week', 'month', 'list']

const weekDays = computed(() => {
  const weekStart = startOfWeek(anchor.value)
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
})

function setV(v: CalView) {
  ui.setCalView(v)
}
function step(dir: number) {
  const d = new Date(anchor.value)
  if (view.value === 'day') d.setDate(d.getDate() + dir)
  else if (view.value === 'week') d.setDate(d.getDate() + dir * 7)
  else d.setMonth(d.getMonth() + dir)
  anchor.value = d
}

const title = computed(() => {
  if (view.value === 'list') return 'Upcoming meetings'
  if (view.value === 'day') return fmtDateLong(anchor.value)
  if (view.value === 'week') {
    const a = weekDays.value[0]
    const b = weekDays.value[6]
    return a.getMonth() === b.getMonth()
      ? `${MONTHS[a.getMonth()]} ${a.getDate()} – ${b.getDate()}, ${a.getFullYear()}`
      : `${MONTH_ABBR[a.getMonth()]} ${a.getDate()} – ${MONTH_ABBR[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`
  }
  return `${MONTHS[anchor.value.getMonth()]} ${anchor.value.getFullYear()}`
})

const gridDays = computed(() =>
  view.value === 'day' ? [anchor.value] : weekDays.value,
)

function onDay(d: Date) {
  anchor.value = d
  setV('day')
}
</script>

<template>
  <div class="h-full flex flex-col bg-base-100">
    <!-- toolbar -->
    <div
      class="flex items-center gap-3 px-5 py-3 border-b border-base-content/10 shrink-0 flex-wrap"
    >
      <button class="btn btn-sm" @click="anchor = new Date()">Today</button>
      <div v-if="view !== 'list'" class="flex items-center">
        <button class="btn btn-ghost btn-sm btn-square" @click="step(-1)">
          <Icon name="chevron-left" :size="18" />
        </button>
        <button class="btn btn-ghost btn-sm btn-square" @click="step(1)">
          <Icon name="chevron-right" :size="18" />
        </button>
      </div>
      <h2 class="text-[18px] font-bold tracking-tight min-w-0 truncate">
        {{ title }}
      </h2>

      <div class="flex-1" />

      <div
        class="hidden sm:flex items-center gap-2 px-2.5 h-8 rounded-lg bg-base-200/70 text-[12px] font-medium whitespace-nowrap"
      >
        <span class="w-2 h-2 rounded-full bg-green-500" />
        Google Calendar
        <span class="text-base-content/40">· synced 2m ago</span>
      </div>

      <div class="join border border-base-content/10 rounded-lg">
        <button
          v-for="v in views"
          :key="v"
          :class="
            cn(
              'join-item btn btn-sm capitalize border-0',
              view === v ? 'text-white' : 'btn-ghost text-base-content/60',
            )
          "
          :style="view === v ? { background: 'var(--accent)' } : undefined"
          @click="setV(v)"
        >
          {{ v }}
        </button>
      </div>
    </div>

    <!-- body -->
    <div class="flex-1 min-h-0">
      <ListView v-if="view === 'list'" @event="popup = $event" />
      <MonthView
        v-else-if="view === 'month'"
        :anchor="anchor"
        @event="popup = $event"
        @day="onDay"
      />
      <TimeGrid v-else :days="gridDays" @event="popup = $event" />
    </div>

    <MeetingPopup v-if="popup" :meeting="popup" @close="popup = null" />
  </div>
</template>
