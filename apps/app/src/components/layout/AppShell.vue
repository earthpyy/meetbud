<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
</script>

<template>
  <div class="h-screen flex bg-base-200 text-base-content overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <Topbar />
      <main class="flex-1 min-h-0 overflow-hidden relative">
        <RouterView />
      </main>
    </div>
  </div>
</template>
