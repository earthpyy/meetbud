<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/Icon.vue'

defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const show = ref(false)
</script>

<template>
  <div
    class="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 focus-within:border-[color:var(--accent)] focus-within:bg-base-100 transition-colors"
  >
    <Icon name="key" :size="16" class="text-base-content/40 shrink-0" />
    <input
      :type="show ? 'text' : 'password'"
      :value="modelValue"
      :placeholder="placeholder"
      class="bg-transparent outline-none text-[13.5px] font-mono w-full"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <button
      class="text-base-content/40 hover:text-base-content"
      @click="show = !show"
    >
      <Icon :name="show ? 'eye-off' : 'eye'" :size="16" />
    </button>
  </div>
</template>
