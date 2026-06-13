<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/lib/cn'
import Icon from '@/components/Icon.vue'
import GeneralTab from '@/components/admin/settings/GeneralTab.vue'
import AITab from '@/components/admin/settings/AITab.vue'
import RecordingTab from '@/components/admin/settings/RecordingTab.vue'
import IntegrationsTab from '@/components/admin/settings/IntegrationsTab.vue'

const TABS = [
  { v: 'general', label: 'General', icon: 'settings' },
  { v: 'ai', label: 'AI & Summarization', icon: 'sparkles' },
  { v: 'recording', label: 'Recording', icon: 'record' },
  { v: 'integrations', label: 'Integrations', icon: 'link' },
]

const tab = ref('ai')
const saved = ref(false)

function save() {
  saved.value = true
  setTimeout(() => (saved.value = false), 2200)
}
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="max-w-[1080px] mx-auto px-6 py-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- tabs -->
        <nav class="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto">
          <button
            v-for="tb in TABS"
            :key="tb.v"
            :class="
              cn(
                'flex items-center gap-2.5 px-3 h-10 rounded-xl text-[13.5px] font-medium whitespace-nowrap transition-colors',
                tab === tb.v
                  ? 'font-semibold'
                  : 'text-base-content/60 hover:bg-base-content/5',
              )
            "
            :style="
              tab === tb.v
                ? {
                    background:
                      'color-mix(in oklab, var(--accent) 12%, transparent)',
                    color: 'var(--accent)',
                  }
                : {}
            "
            @click="tab = tb.v"
          >
            <Icon :name="tb.icon" :size="17" /> {{ tb.label }}
          </button>
        </nav>

        <!-- panel -->
        <div class="flex-1 min-w-0">
          <div
            class="bg-base-100 border border-base-content/10 rounded-2xl p-6"
          >
            <GeneralTab v-if="tab === 'general'" />
            <AITab v-else-if="tab === 'ai'" />
            <RecordingTab v-else-if="tab === 'recording'" />
            <IntegrationsTab v-else-if="tab === 'integrations'" />
          </div>
          <div
            v-if="tab !== 'general' && tab !== 'integrations'"
            class="flex items-center justify-end gap-3 mt-4"
          >
            <span
              v-if="saved"
              class="text-[13px] text-green-600 flex items-center gap-1.5"
              ><Icon name="check-circle" :size="16" /> Settings saved</span
            >
            <button class="btn btn-ghost btn-sm">Cancel</button>
            <button
              class="btn btn-sm text-white border-0"
              :style="{ background: 'var(--accent)' }"
              @click="save"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
