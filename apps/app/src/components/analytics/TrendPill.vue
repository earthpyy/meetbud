<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import Icon from '@/components/Icon.vue'

const props = defineProps<{ pct: number }>()
const up = computed(() => props.pct >= 0)
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center gap-0.5 text-[11.5px] font-bold tabular-nums',
        up ? 'text-success' : 'text-error',
      )
    "
  >
    <Icon
      :name="up ? 'trending-up' : 'trending-down'"
      :size="13"
      :stroke="2.4"
    />
    {{ up ? '+' : '' }}{{ pct.toFixed(1) }}%
  </span>
</template>
