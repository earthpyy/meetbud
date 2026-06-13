<script setup lang="ts">
import { cn } from '@/lib/cn'

withDefaults(defineProps<{ label: string; value: string; mono?: boolean }>(), {
  mono: false,
})
</script>

<template>
  <div>
    <label class="text-[12px] font-semibold text-base-content/55">{{
      label
    }}</label>
    <div
      :class="
        cn(
          'mt-1 h-10 px-3.5 flex items-center rounded-xl bg-base-200/60 border border-base-content/10 text-[14px]',
          mono && 'font-mono text-[13px]',
        )
      "
    >
      {{ value }}
    </div>
  </div>
</template>
