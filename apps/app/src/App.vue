<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

onMounted(() => ui.applyTheme())
watch(
  () => ui.theme,
  () => ui.applyTheme(),
)
</script>

<template>
  <RouterView />
</template>
