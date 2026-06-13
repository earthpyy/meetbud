<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/lib/cn'
import { fmtCompact } from '@/lib/format'

interface Datum {
  label: string
  value: number
}

const props = defineProps<{
  data: Datum[]
  format: (v: number) => string
}>()

const hi = ref<number | null>(null)
const max = computed(
  () => Math.max(...props.data.map((d) => d.value)) * 1.12 || 1,
)
const gridLines = [0, 0.25, 0.5, 0.75, 1]
</script>

<template>
  <div>
    <div class="relative" style="height: 232px">
      <div
        v-for="f in gridLines"
        :key="f"
        class="absolute left-0 right-0 border-t border-base-content/[0.07]"
        :style="{ bottom: `${f * 100}%` }"
      >
        <span
          class="absolute -left-0.5 -top-2 text-[9.5px] text-base-content/30 tabular-nums -translate-x-full pr-2"
          >{{ fmtCompact(max * f) }}</span
        >
      </div>
      <div class="absolute inset-0 flex items-end gap-1.5">
        <div
          v-for="(d, i) in data"
          :key="i"
          class="flex-1 h-full flex items-end justify-center relative"
          @mouseenter="hi = i"
          @mouseleave="hi = null"
        >
          <div
            class="w-full max-w-[34px] rounded-t-[5px] transition-[background,height] duration-200"
            :style="{
              height: `${(d.value / max) * 100}%`,
              background:
                hi === i
                  ? 'var(--accent)'
                  : 'color-mix(in oklab, var(--accent) 30%, transparent)',
            }"
          />
          <div
            v-if="hi === i"
            class="absolute left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-1 rounded-lg bg-base-content text-base-100 text-[11px] font-semibold shadow-lg pointer-events-none"
            :style="{ bottom: `calc(${(d.value / max) * 100}% + 6px)` }"
          >
            {{ format(d.value) }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-1.5 mt-2">
      <div
        v-for="(d, i) in data"
        :key="i"
        :class="
          cn(
            'flex-1 text-center text-[10px] tabular-nums transition-colors',
            hi === i
              ? 'text-base-content font-semibold'
              : 'text-base-content/40',
          )
        "
      >
        {{ d.label }}
      </div>
    </div>
  </div>
</template>
