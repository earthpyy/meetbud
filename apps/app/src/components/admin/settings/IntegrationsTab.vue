<script setup lang="ts">
import { cn } from '@/lib/cn'
import Icon from '@/components/Icon.vue'

interface Integration {
  name: string
  desc: string
  icon: string
  color: string
  connected: boolean
}

const items: Integration[] = [
  {
    name: 'Google Calendar',
    desc: 'Org-wide calendar sync via OAuth.',
    icon: 'calendar-days',
    color: '#4285F4',
    connected: true,
  },
  {
    name: 'Slack',
    desc: 'Post summaries to channels automatically.',
    icon: 'send',
    color: '#611f69',
    connected: false,
  },
  {
    name: 'Webhooks',
    desc: 'Send events to your own endpoint.',
    icon: 'plug',
    color: '#64748b',
    connected: true,
  },
  {
    name: 'Notion',
    desc: 'Sync notes into a Notion database.',
    icon: 'notes',
    color: '#111',
    connected: false,
  },
]
</script>

<template>
  <div>
    <div class="flex items-center gap-2.5 mb-4">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        :style="{
          background: 'color-mix(in oklab, var(--accent) 13%, transparent)',
          color: 'var(--accent)',
        }"
      >
        <Icon name="link" :size="18" />
      </div>
      <div>
        <h3 class="font-bold text-[15.5px] tracking-tight">Integrations</h3>
        <p class="text-[12.5px] text-base-content/50">
          Connect meetbud to the rest of your stack.
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        v-for="it in items"
        :key="it.name"
        class="rounded-xl border border-base-content/10 p-4 flex items-start gap-3"
      >
        <div
          class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center shrink-0"
        >
          <Icon :name="it.icon" :size="19" :style="{ color: it.color }" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-[14px]">{{ it.name }}</span>
            <span
              v-if="it.connected"
              class="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-500" />Connected
            </span>
          </div>
          <p class="text-[12px] text-base-content/55 mt-0.5 leading-snug">
            {{ it.desc }}
          </p>
          <button
            :class="
              cn(
                'btn btn-xs mt-2.5',
                it.connected ? 'btn-ghost text-base-content/60' : 'btn-outline',
              )
            "
          >
            {{ it.connected ? 'Manage' : 'Connect' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
