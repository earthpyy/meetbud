<script setup lang="ts">
import { cn } from '@/lib/cn'

withDefaults(
  defineProps<{ label: string; hint?: string; stacked?: boolean }>(),
  { stacked: false },
)
</script>

<template>
  <div
    :class="
      cn(
        'grid gap-2 py-4 border-b border-base-content/8 last:border-0',
        stacked
          ? 'grid-cols-1'
          : 'sm:grid-cols-[260px_1fr] grid-cols-1 sm:items-start',
      )
    "
  >
    <div>
      <label class="text-[13.5px] font-semibold">{{ label }}</label>
      <p
        v-if="hint"
        class="text-[12px] text-base-content/50 mt-0.5 leading-snug max-w-xs"
      >
        {{ hint }}
      </p>
    </div>
    <div class="min-w-0"><slot /></div>
  </div>
</template>
