<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import Sparkline from './Sparkline.vue'
import TrendPill from './TrendPill.vue'

defineProps<{
  icon: string
  label: string
  value: string
  sub: string
  series?: number[]
  deltaPct?: number | null
}>()
</script>

<template>
  <div
    class="bg-base-100 border border-base-content/10 rounded-2xl p-4 flex flex-col gap-3"
  >
    <div class="flex items-center gap-2.5">
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        :style="{
          background: 'color-mix(in oklab, var(--accent) 13%, transparent)',
          color: 'var(--accent)',
        }"
      >
        <Icon :name="icon" :size="18" />
      </div>
      <span
        class="text-[12.5px] font-semibold text-base-content/55 leading-tight"
        >{{ label }}</span
      >
    </div>
    <div>
      <div
        class="text-[30px] font-extrabold tracking-tight leading-none tabular-nums"
      >
        {{ value }}
      </div>
      <div class="flex items-center gap-2 mt-2">
        <TrendPill v-if="deltaPct != null" :pct="deltaPct" />
        <span class="text-[11.5px] text-base-content/45">{{ sub }}</span>
      </div>
    </div>
    <div v-if="series" class="-mb-1">
      <Sparkline :points="series" :w="200" :h="34" />
    </div>
  </div>
</template>
