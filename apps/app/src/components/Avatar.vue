<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'

interface AvatarPerson {
  name: string
  initials: string
  color: string
}

const props = withDefaults(
  defineProps<{
    person: AvatarPerson
    size?: number
    ring?: boolean
  }>(),
  { size: 32, ring: false },
)

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  background: props.person.color,
  fontSize: `${props.size * 0.4}px`,
}))
</script>

<template>
  <div
    :class="
      cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        ring && 'ring-2 ring-base-100',
      )
    "
    :style="style"
    :title="person.name"
  >
    {{ person.initials }}
  </div>
</template>
