<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    points: number[]
    w?: number
    h?: number
    color?: string
    fill?: boolean
  }>(),
  { w: 132, h: 36, color: 'var(--accent)', fill: true },
)

const geo = computed(() => {
  const { points, w, h } = props
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const pts = points.map((p, i) => [
    (i / (points.length - 1)) * w,
    h - 3 - ((p - min) / range) * (h - 6),
  ])
  const line = pts
    .map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1))
    .join(' ')
  const area = line + ` L ${w} ${h} L 0 ${h} Z`
  return { line, area }
})
</script>

<template>
  <svg
    :width="w"
    :height="h"
    :viewBox="`0 0 ${w} ${h}`"
    class="overflow-visible"
    preserveAspectRatio="none"
  >
    <path v-if="fill" :d="geo.area" :fill="color" opacity="0.1" />
    <path
      :d="geo.line"
      fill="none"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>
