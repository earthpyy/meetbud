<script setup lang="ts">
defineProps<{ title: string; desc?: string; on: boolean }>()
const emit = defineEmits<{ change: [value: boolean] }>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-2.5">
    <div class="min-w-0">
      <div class="text-[13.5px] font-medium">{{ title }}</div>
      <div v-if="desc" class="text-[12px] text-base-content/50 leading-snug">
        {{ desc }}
      </div>
    </div>
    <input
      type="checkbox"
      class="toggle toggle-sm shrink-0"
      :checked="on"
      :style="
        on
          ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }
          : {}
      "
      @change="emit('change', ($event.target as HTMLInputElement).checked)"
    />
  </div>
</template>
