<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/Icon.vue'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    configured?: boolean
  }>(),
  { configured: false },
)
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const show = ref(false)
</script>

<template>
  <div>
    <div
      class="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 focus-within:border-[color:var(--accent)] focus-within:bg-base-100 transition-colors"
    >
      <Icon name="key" :size="16" class="text-base-content/40 shrink-0" />
      <input
        :type="show ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="
          configured ? 'Configured — enter a new key to replace' : placeholder
        "
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
    <div
      v-if="configured"
      class="mt-1.5 flex items-center gap-1.5 text-[12px] text-green-600"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-green-500" /> A key is stored.
      Leave blank to keep it.
    </div>
  </div>
</template>
