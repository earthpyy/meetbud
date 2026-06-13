<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import { STATUS } from '@/lib/constants'
import type { MeetingStatus } from '@/lib/types'
import Icon from './Icon.vue'

const props = withDefaults(
  defineProps<{
    status: MeetingStatus
    sm?: boolean
  }>(),
  { sm: false },
)

const st = computed(() => STATUS[props.status])
</script>

<template>
  <span
    :class="
      cn('badge gap-1.5 border-0 font-medium', sm ? 'badge-sm' : '', st.badge)
    "
  >
    <span
      v-if="st.pulse"
      class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
    />
    <Icon v-else-if="st.spin" name="refresh" :size="11" class="animate-spin" />
    <span
      v-else
      class="w-1.5 h-1.5 rounded-full"
      :style="{ background: st.dot }"
    />
    {{ st.label }}
  </span>
</template>
