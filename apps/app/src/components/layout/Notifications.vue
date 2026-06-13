<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import Icon from '@/components/Icon.vue'

interface Notif {
  icon: string
  title: string
  body: string
  time: string
  unread: boolean
}

const NOTIFS: Notif[] = [
  {
    icon: 'sparkles',
    title: 'Summary ready',
    body: 'Pricing Workshop summary is ready to review.',
    time: '8m',
    unread: true,
  },
  {
    icon: 'record',
    title: 'Recording started',
    body: 'meetbud joined Weekly Team Sync.',
    time: '1h',
    unread: true,
  },
  {
    icon: 'check-circle',
    title: 'Invite accepted',
    body: 'Daniel Kim joined your workspace.',
    time: '3h',
    unread: false,
  },
  {
    icon: 'mail',
    title: 'Transcript shared',
    body: 'Emma shared Customer Discovery — Northwind.',
    time: '1d',
    unread: false,
  },
]

const unread = computed(() => NOTIFS.filter((n) => n.unread).length)
</script>

<template>
  <div class="dropdown dropdown-end">
    <div
      tabindex="0"
      role="button"
      class="btn btn-ghost btn-sm btn-square text-base-content/70 relative"
      title="Notifications"
    >
      <Icon name="bell" :size="19" />
      <span
        v-if="unread > 0"
        class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-base-100"
        :style="{ background: 'var(--accent)' }"
      />
    </div>
    <div
      tabindex="0"
      class="dropdown-content z-[60] mt-2 w-80 card card-compact bg-base-100 shadow-xl border border-base-content/10"
    >
      <div class="card-body p-0">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-base-content/10"
        >
          <span class="font-semibold text-sm">Notifications</span>
          <span
            class="text-xs text-[color:var(--accent)] font-medium cursor-pointer"
            >Mark all read</span
          >
        </div>
        <ul class="max-h-80 overflow-auto">
          <li
            v-for="(n, i) in NOTIFS"
            :key="i"
            :class="
              cn(
                'flex gap-3 px-4 py-3 hover:bg-base-content/5 cursor-pointer border-b border-base-content/5',
                n.unread && 'bg-base-content/[0.025]',
              )
            "
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :style="{
                background:
                  'color-mix(in oklab, var(--accent) 14%, transparent)',
                color: 'var(--accent)',
              }"
            >
              <Icon :name="n.icon" :size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[13px] font-semibold truncate">{{
                  n.title
                }}</span>
                <span class="text-[11px] text-base-content/40 shrink-0">{{
                  n.time
                }}</span>
              </div>
              <p class="text-[12px] text-base-content/60 leading-snug mt-0.5">
                {{ n.body }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
