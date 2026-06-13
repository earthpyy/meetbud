<script setup lang="ts">
import { computed } from 'vue'
import { fmtInt } from '@/lib/format'

interface Segment {
  value: number
  color: string
}

const props = defineProps<{ segments: Segment[] }>()

const C = 2 * Math.PI * 56
const total = computed(
  () => props.segments.reduce((s, x) => s + x.value, 0) || 1,
)
const arcs = computed(() => {
  let acc = 0
  return props.segments.map((s) => {
    const len = (s.value / total.value) * C
    const arc = {
      color: s.color,
      dasharray: `${len} ${C - len}`,
      dashoffset: -acc,
    }
    acc += len
    return arc
  })
})
</script>

<template>
  <div class="relative w-[150px] h-[150px] shrink-0">
    <svg width="150" height="150" viewBox="0 0 150 150">
      <g transform="rotate(-90 75 75)">
        <circle
          cx="75"
          cy="75"
          r="56"
          fill="none"
          stroke="currentColor"
          class="text-base-content/[0.08]"
          stroke-width="15"
        />
        <circle
          v-for="(a, i) in arcs"
          :key="i"
          cx="75"
          cy="75"
          r="56"
          fill="none"
          :stroke="a.color"
          stroke-width="15"
          :stroke-dasharray="a.dasharray"
          :stroke-dashoffset="a.dashoffset"
          stroke-linecap="butt"
        />
      </g>
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div class="text-[24px] font-extrabold leading-none tabular-nums">
        {{ fmtInt(total) }}
      </div>
      <div class="text-[10.5px] font-medium text-base-content/45 mt-0.5">
        meetings
      </div>
    </div>
  </div>
</template>
