<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import { DAY_ABBR, addDays, pad2, sameDay, startOfWeek } from '@/lib/format'
import { PLATFORMS } from '@/lib/constants'
import type { Meeting } from '@/lib/types'
import { storeToRefs } from 'pinia'
import { useMeetingsStore } from '@/stores/meetings'
import { useUiStore } from '@/stores/ui'

const props = defineProps<{ anchor: Date }>()
const emit = defineEmits<{ event: [ev: Meeting]; day: [d: Date] }>()

const { meetings: MEETINGS } = storeToRefs(useMeetingsStore())
const ui = useUiStore()
const now = new Date()
const maxChips = computed(() => (ui.dense ? 2 : 3))

const cells = computed(() => {
  const first = new Date(props.anchor.getFullYear(), props.anchor.getMonth(), 1)
  const gridStart = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
})

function shortTime(d: Date) {
  let h = d.getHours() % 12
  if (h === 0) h = 12
  const m = d.getMinutes()
  return m === 0 ? `${h}` : `${h}:${pad2(m)}`
}
function eventsFor(d: Date) {
  return MEETINGS.value.filter((m) => sameDay(m.start, d)).sort(
    (a, b) => +a.start - +b.start,
  )
}
function chipStyle(platform: Meeting['platform']) {
  return {
    background: `color-mix(in oklab, ${PLATFORMS[platform].color} 13%, var(--b1))`,
  }
}
function chipTextStyle(platform: Meeting['platform']) {
  return {
    color: `color-mix(in oklab, ${PLATFORMS[platform].color} 80%, var(--bc))`,
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-base-100">
    <div
      class="grid grid-cols-7 border-b border-base-content/10 shrink-0 cal-line"
    >
      <div
        v-for="d in DAY_ABBR"
        :key="d"
        class="text-center py-2 text-[11px] font-semibold uppercase tracking-wide text-base-content/45"
      >
        {{ d }}
      </div>
    </div>
    <div class="flex-1 grid grid-cols-7 grid-rows-6 overflow-auto">
      <div
        v-for="(d, i) in cells"
        :key="i"
        :class="
          cn(
            'border-b border-r border-base-content/10 p-1.5 flex flex-col gap-1 min-h-0 cursor-pointer hover:bg-base-content/[0.02] transition-colors cal-line',
            d.getMonth() !== anchor.getMonth() && 'bg-base-200/40',
            i % 7 === 0 && 'border-l-0',
          )
        "
        @click="emit('day', d)"
      >
        <div class="flex justify-center">
          <span
            :class="
              cn(
                'inline-flex items-center justify-center w-6 h-6 rounded-full text-[12.5px] font-semibold',
                sameDay(d, now)
                  ? 'text-white'
                  : d.getMonth() === anchor.getMonth()
                    ? 'text-base-content/75'
                    : 'text-base-content/35',
              )
            "
            :style="
              sameDay(d, now) ? { background: 'var(--accent)' } : undefined
            "
          >
            {{ d.getDate() }}
          </span>
        </div>
        <div class="flex flex-col gap-1 overflow-hidden">
          <button
            v-for="ev in eventsFor(d).slice(0, maxChips)"
            :key="ev.id"
            class="flex items-center gap-1.5 px-1.5 py-1 rounded-md text-left hover:shadow-sm transition-shadow"
            :style="chipStyle(ev.platform)"
            @click.stop="emit('event', ev)"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :style="{ background: PLATFORMS[ev.platform].color }"
            />
            <span
              class="text-[11px] font-medium truncate"
              :style="chipTextStyle(ev.platform)"
            >
              {{ shortTime(ev.start) }} {{ ev.title }}
            </span>
            <span
              v-if="ev.status === 'ongoing'"
              class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto shrink-0"
            />
          </button>
          <span
            v-if="eventsFor(d).length > maxChips"
            class="text-[10.5px] text-base-content/45 font-medium pl-1.5"
          >
            +{{ eventsFor(d).length - maxChips }} more
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
