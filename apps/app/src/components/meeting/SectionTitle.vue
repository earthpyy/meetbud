<script setup lang="ts">
import Icon from '@/components/Icon.vue'

defineProps<{ icon: string }>()
</script>

<template>
  <div class="flex items-center gap-2 mb-3">
    <Icon :name="icon" :size="17" :style="{ color: 'var(--accent)' }" />
    <h3 class="font-bold text-[15px] tracking-tight whitespace-nowrap">
      <slot />
    </h3>
  </div>
</template>
