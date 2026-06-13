<script setup lang="ts">
import { computed } from 'vue'
import type { Meeting } from '@/lib/types'
import { useRecordingsStore } from '@/stores/recordings'
import Icon from '@/components/Icon.vue'

const props = defineProps<{ meeting: Meeting }>()
const recordings = useRecordingsStore()
const rec = computed(() => recordings.getRecording(props.meeting.id))
</script>

<template>
  <div class="max-w-lg mx-auto py-10">
    <div
      class="rounded-2xl border border-base-content/10 bg-base-100 p-6 text-center"
    >
      <div
        class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-base-200"
      >
        <Icon name="calendar-days" :size="26" class="text-base-content/50" />
      </div>
      <h2 class="text-lg font-bold tracking-tight">
        This meeting hasn't happened yet
      </h2>
      <p class="text-base-content/55 mt-1.5 text-[14px]">
        Notes, transcript and recording will appear here once it's done.
      </p>
      <div
        class="mt-5 flex items-center justify-between rounded-xl border p-3.5 text-left"
        :style="
          rec
            ? {
                borderColor:
                  'color-mix(in oklab, var(--accent) 45%, transparent)',
                background:
                  'color-mix(in oklab, var(--accent) 8%, transparent)',
              }
            : { borderColor: 'color-mix(in oklab, var(--bc) 12%, transparent)' }
        "
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center"
            :style="
              rec
                ? { background: 'var(--accent)', color: '#fff' }
                : {
                    background: 'color-mix(in oklab,var(--bc) 8%, transparent)',
                  }
            "
          >
            <Icon name="record" :size="18" />
          </div>
          <div>
            <div class="text-[13.5px] font-semibold">Record this meeting</div>
            <div class="text-[11.5px] text-base-content/55">
              {{ rec ? 'meetbud will join and capture it.' : 'Currently off.' }}
            </div>
          </div>
        </div>
        <input
          type="checkbox"
          class="toggle toggle-sm"
          :checked="rec"
          :style="
            rec
              ? {
                  backgroundColor: 'var(--accent)',
                  borderColor: 'var(--accent)',
                }
              : {}
          "
          @change="
            recordings.setRecording(
              meeting.id,
              ($event.target as HTMLInputElement).checked,
            )
          "
        />
      </div>
    </div>
  </div>
</template>
