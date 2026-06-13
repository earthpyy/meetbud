<script setup lang="ts">
import Icon from '@/components/Icon.vue'

defineProps<{ role: 'admin' | 'member' }>()
</script>

<template>
  <span
    v-if="role === 'admin'"
    class="badge badge-sm gap-1 border-0"
    :style="{
      background: 'color-mix(in oklab, var(--accent) 14%, transparent)',
      color: 'var(--accent)',
    }"
  >
    <Icon name="shield" :size="11" /> Admin
  </span>
  <span v-else class="badge badge-sm badge-ghost">Member</span>
</template>
