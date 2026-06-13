<script setup lang="ts">
import { computed } from 'vue'
import { ICON_PATHS } from '@/lib/icons'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    stroke?: number
  }>(),
  { size: 20, stroke: 2 },
)

const path = computed(() => ICON_PATHS[props.name] ?? '')
</script>

<template>
  <svg
    v-if="path"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="path"
  />
</template>
