<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '@/lib/types'
import Avatar from './Avatar.vue'

const props = withDefaults(
  defineProps<{
    people: Person[]
    max?: number
    size?: number
  }>(),
  { max: 4, size: 26 },
)

const shown = computed(() => props.people.slice(0, props.max))
const extra = computed(() => props.people.length - shown.value.length)
</script>

<template>
  <div class="flex items-center -space-x-2">
    <Avatar v-for="p in shown" :key="p.id" :person="p" :size="size" ring />
    <div
      v-if="extra > 0"
      class="inline-flex items-center justify-center rounded-full bg-base-300 text-base-content/60 font-semibold ring-2 ring-base-100"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.36}px`,
      }"
    >
      +{{ extra }}
    </div>
  </div>
</template>
