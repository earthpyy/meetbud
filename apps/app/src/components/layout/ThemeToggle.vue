<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import Icon from '@/components/Icon.vue'

const ui = useUiStore()
const dark = computed(() => ui.theme === 'dark')
</script>

<template>
  <button
    class="btn btn-ghost btn-sm btn-square text-base-content/70"
    title="Toggle theme"
    @click="ui.toggleTheme()"
  >
    <Icon :name="dark ? 'sun' : 'moon'" :size="19" />
  </button>
</template>
