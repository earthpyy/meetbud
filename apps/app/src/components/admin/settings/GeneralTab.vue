<script setup lang="ts">
import Icon from '@/components/Icon.vue'
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center py-20">
    <div
      class="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-4"
    >
      <Icon name="settings" :size="28" class="text-base-content/30" />
    </div>
    <h3 class="font-bold text-[16px]">General settings</h3>
    <p class="text-base-content/50 text-[13.5px] mt-1.5 max-w-sm">
      Workspace name, branding and defaults will live here. Nothing to configure
      yet.
    </p>
    <span class="mt-4 badge badge-ghost">Coming soon</span>
  </div>
</template>
