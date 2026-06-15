<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { cn } from '@/lib/cn'
import { DAY_ABBR, fmtHour, sameDay } from '@/lib/format'
import type { Meeting } from '@/lib/types'
import { storeToRefs } from 'pinia'
import { useMeetingsStore } from '@/stores/meetings'
import { useUiStore } from '@/stores/ui'
import EventBlock from './EventBlock.vue'

type LaidMeeting = Meeting & { _col: number; _cols: number }

const props = defineProps<{ days: Date[] }>()
const emit = defineEmits<{ event: [ev: Meeting] }>()

const { meetings: MEETINGS } = storeToRefs(useMeetingsStore())
const ui = useUiStore()

const GRID_START = 7
const GRID_END = 21
const GRID_OFFSET = 10

const rowH = computed(() => (ui.dense ? 46 : 56))
const hours = computed(() => {
  const out: number[] = []
  for (let h = GRID_START; h <= GRID_END; h++) out.push(h)
  return out
})
const gridH = computed(
  () => (GRID_END - GRID_START) * rowH.value + GRID_OFFSET + 12,
)
const now = new Date()

const scrollRef = ref<HTMLElement | null>(null)
onMounted(() => {
  if (scrollRef.value) scrollRef.value.scrollTop = (9 - GRID_START) * rowH.value
})

function posFor(d: Date) {
  const mins = d.getHours() * 60 + d.getMinutes()
  return ((mins - GRID_START * 60) / 60) * rowH.value + GRID_OFFSET
}

// overlap layout: assign each event a column within its overlap cluster.
function layoutDay(evs: Meeting[]): LaidMeeting[] {
  const sorted = [...evs].sort(
    (a, b) => +a.start - +b.start || +b.end - +a.end,
  ) as LaidMeeting[]
  let cluster: LaidMeeting[] = []
  let clusterEnd: Date | null = null
  const flush = () => {
    const colEnds: Date[] = []
    cluster.forEach((ev) => {
      let placed = false
      for (let c = 0; c < colEnds.length; c++) {
        if (colEnds[c] <= ev.start) {
          ev._col = c
          colEnds[c] = ev.end
          placed = true
          break
        }
      }
      if (!placed) {
        ev._col = colEnds.length
        colEnds.push(ev.end)
      }
    })
    cluster.forEach((ev) => (ev._cols = colEnds.length))
    cluster = []
  }
  sorted.forEach((ev) => {
    if (cluster.length === 0) {
      cluster = [ev]
      clusterEnd = ev.end
      return
    }
    if (clusterEnd && ev.start < clusterEnd) {
      cluster.push(ev)
      if (ev.end > clusterEnd) clusterEnd = ev.end
    } else {
      flush()
      cluster = [ev]
      clusterEnd = ev.end
    }
  })
  if (cluster.length) flush()
  return sorted
}

interface Column {
  day: Date
  today: boolean
  showNow: boolean
  nowTop: number
  events: {
    ev: LaidMeeting
    top: number
    height: number
    left: string
    width: string
  }[]
  lines: number[]
}

const columns = computed<Column[]>(() =>
  props.days.map((d) => {
    const evs = MEETINGS.value.filter((m) => sameDay(m.start, d)).map((m) => ({
      ...m,
    }))
    const laid = layoutDay(evs)
    const today = sameDay(d, now)
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const showNow =
      today && nowMin >= GRID_START * 60 && nowMin <= GRID_END * 60
    return {
      day: d,
      today,
      showNow,
      nowTop: posFor(now),
      lines: hours.value.map((_, i) => i * rowH.value + GRID_OFFSET),
      events: laid.map((ev) => {
        const top = posFor(ev.start)
        const height = Math.max(22, posFor(ev.end) - top - 2)
        const w = 100 / ev._cols
        return {
          ev,
          top,
          height,
          left: `calc(${ev._col * w}% + 2px)`,
          width: `calc(${w}% - 4px)`,
        }
      }),
    }
  }),
)
</script>

<template>
  <div class="flex flex-col h-full bg-base-100">
    <!-- day header -->
    <div
      class="flex border-b border-base-content/10 shrink-0 pr-[10px] cal-line"
    >
      <div :style="{ width: '58px' }" class="shrink-0" />
      <div
        v-for="(d, i) in days"
        :key="i"
        class="flex-1 text-center py-2.5 border-l border-base-content/5 cal-vline"
      >
        <div
          class="text-[11px] font-semibold uppercase tracking-wide text-base-content/45"
        >
          {{ DAY_ABBR[d.getDay()] }}
        </div>
        <div
          :class="
            cn(
              'mt-1 inline-flex items-center justify-center rounded-full font-bold transition-colors',
              days.length === 1
                ? 'h-8 px-3 text-[15px]'
                : 'w-9 h-9 text-[16px]',
              sameDay(d, now) ? 'text-white' : 'text-base-content/80',
            )
          "
          :style="sameDay(d, now) ? { background: 'var(--accent)' } : undefined"
        >
          {{ d.getDate() }}
        </div>
      </div>
    </div>

    <!-- grid -->
    <div ref="scrollRef" class="flex-1 overflow-auto">
      <div class="flex relative" :style="{ height: `${gridH}px` }">
        <!-- gutter -->
        <div :style="{ width: '58px' }" class="shrink-0 relative">
          <div
            v-for="(h, i) in hours"
            :key="h"
            class="absolute right-2.5 text-[11px] text-base-content/40 font-medium -translate-y-1/2"
            :style="{ top: `${i * rowH + GRID_OFFSET}px` }"
          >
            {{ fmtHour(h) }}
          </div>
        </div>
        <!-- columns -->
        <div
          v-for="(col, di) in columns"
          :key="di"
          class="flex-1 relative border-l border-base-content/10 min-w-0 cal-vline"
        >
          <div
            v-for="(top, i) in col.lines"
            :key="i"
            class="absolute left-0 right-0 border-t border-base-content/[0.06] cal-hline"
            :style="{ top: `${top}px` }"
          />
          <div
            v-if="col.today"
            class="absolute inset-0"
            :style="{
              background: 'color-mix(in oklab, var(--accent) 4%, transparent)',
            }"
          />
          <EventBlock
            v-for="item in col.events"
            :key="item.ev.id"
            :ev="item.ev"
            :top="item.top"
            :height="item.height"
            :left="item.left"
            :width="item.width"
            @click="emit('event', $event)"
          />
          <div
            v-if="col.showNow"
            class="absolute left-0 right-0 z-20 pointer-events-none"
            :style="{ top: `${col.nowTop}px` }"
          >
            <div class="relative border-t-2 border-red-500">
              <span
                class="absolute -left-1 -top-[5px] w-2.5 h-2.5 rounded-full bg-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
