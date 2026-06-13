<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import type { Meeting } from '@/lib/types'
import Icon from '@/components/Icon.vue'

const props = defineProps<{ meeting: Meeting }>()

const steps = [
  { key: 'recorded', label: 'Recorded', icon: 'record' },
  { key: 'transcribing', label: 'Transcribing', icon: 'wave' },
  { key: 'summarizing', label: 'Summarizing', icon: 'sparkles' },
  { key: 'done', label: 'Ready', icon: 'check-circle' },
]
const order = ['recorded', 'transcribing', 'summarizing', 'done']

const activeIdx = computed(() => {
  const activeKey =
    props.meeting.status === 'transcribing' ? 'transcribing' : 'summarizing'
  return order.indexOf(activeKey)
})

function stateOf(i: number) {
  return i < activeIdx.value
    ? 'done'
    : i === activeIdx.value
      ? 'active'
      : 'todo'
}
</script>

<template>
  <div class="max-w-xl mx-auto text-center py-10">
    <div
      class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5"
      :style="{
        background: 'color-mix(in oklab, var(--accent) 12%, transparent)',
        color: 'var(--accent)',
      }"
    >
      <Icon name="sparkles" :size="30" />
    </div>
    <h2 class="text-xl font-bold tracking-tight">
      {{
        meeting.status === 'transcribing'
          ? 'Transcribing your recording…'
          : 'Summarizing with AI…'
      }}
    </h2>
    <p class="text-base-content/55 mt-2 text-[14px]">
      This usually takes a few minutes. We'll notify you when the notes are
      ready.
    </p>

    <div class="flex items-center justify-center gap-0 mt-9">
      <template v-for="(s, i) in steps" :key="s.key">
        <div class="flex flex-col items-center gap-2 w-24">
          <div
            :class="
              cn(
                'w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors',
                stateOf(i) === 'todo'
                  ? 'border-base-content/15 text-base-content/30'
                  : 'text-white',
              )
            "
            :style="
              stateOf(i) !== 'todo'
                ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                : {}
            "
          >
            <Icon v-if="stateOf(i) === 'done'" name="check" :size="20" />
            <Icon
              v-else
              :name="s.icon"
              :size="18"
              :class="stateOf(i) === 'active' ? 'animate-pulse' : ''"
            />
          </div>
          <span
            :class="
              cn(
                'text-[12px] font-medium',
                stateOf(i) === 'todo'
                  ? 'text-base-content/35'
                  : 'text-base-content/70',
              )
            "
            >{{ s.label }}</span
          >
        </div>
        <div
          v-if="i < steps.length - 1"
          :class="
            cn(
              'h-0.5 w-8 -mt-6 rounded-full',
              i < activeIdx ? '' : 'bg-base-content/15',
            )
          "
          :style="i < activeIdx ? { background: 'var(--accent)' } : {}"
        />
      </template>
    </div>
  </div>
</template>
