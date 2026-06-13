<script setup lang="ts">
defineProps<{ title: string; desc?: string }>()
</script>

<template>
  <div class="bg-base-100 border border-base-content/10 rounded-2xl p-5">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 class="font-bold text-[15.5px] tracking-tight">{{ title }}</h3>
        <p v-if="desc" class="text-[12.5px] text-base-content/50 mt-0.5">
          {{ desc }}
        </p>
      </div>
      <slot name="action" />
    </div>
    <slot />
  </div>
</template>
