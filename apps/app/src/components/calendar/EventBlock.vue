<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import { pad2 } from '@/lib/format'
import { PLATFORMS } from '@/lib/constants'
import type { Meeting } from '@/lib/types'
import { useRecordingsStore } from '@/stores/recordings'
import Icon from '@/components/Icon.vue'

const props = defineProps<{
  ev: Meeting
  top: number
  height: number
  left: string
  width: string
}>()

const emit = defineEmits<{ click: [ev: Meeting] }>()

const recordings = useRecordingsStore()

// eventStyle is hardcoded to "solid" in this build (Tweaks panel dropped).
const plat = computed(() => PLATFORMS[props.ev.platform])
const rec = computed(() => recordings.getRecording(props.ev.id))
const live = computed(() => props.ev.status === 'ongoing')
const tiny = computed(() => props.height < 34)

function shortTime(d: Date) {
  let h = d.getHours() % 12
  if (h === 0) h = 12
  const m = d.getMinutes()
  return m === 0 ? `${h}` : `${h}:${pad2(m)}`
}

const style = computed(() => ({
  top: `${props.top}px`,
  height: `${props.height}px`,
  left: props.left,
  width: props.width,
  background: plat.value.color,
  color: '#fff',
  borderLeft: `3px solid ${plat.value.color}`,
}))
</script>

<template>
  <button
    class="absolute rounded-md px-1.5 py-1 text-left overflow-hidden hover:z-30 hover:shadow-lg transition-shadow group"
    :style="style"
    @click.stop="emit('click', ev)"
  >
    <div class="flex items-start gap-1">
      <div class="min-w-0 flex-1">
        <div
          :class="
            cn(
              'font-semibold leading-tight truncate',
              tiny ? 'text-[10.5px]' : 'text-[11.5px]',
            )
          "
        >
          {{ ev.title }}
        </div>
        <div
          v-if="!tiny"
          class="text-[10.5px] truncate leading-tight mt-0.5 text-white/85"
        >
          {{ shortTime(ev.start) }} · {{ plat.short }}
        </div>
      </div>
      <span
        v-if="live"
        class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse"
      />
      <Icon
        v-else-if="rec"
        name="record"
        :size="tiny ? 10 : 12"
        class="mt-0.5 shrink-0 text-white/90"
      />
    </div>
  </button>
</template>
