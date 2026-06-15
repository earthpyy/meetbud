<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtClock } from '@/lib/format'
import Icon from '@/components/Icon.vue'

const props = defineProps<{ currentTime: number; playing: boolean; duration: number }>()
const emit = defineEmits<{
  'update:time': [v: number]
  'update:playing': [v: boolean]
}>()

// deterministic faux waveform heights
const WAVE = Array.from(
  { length: 96 },
  (_, i) =>
    0.28 +
    0.72 *
      Math.abs(
        Math.sin(i * 0.7) * 0.6 +
          Math.sin(i * 0.23) * 0.4 +
          Math.sin(i * 1.9) * 0.25,
      ),
)

const rates = [1, 1.25, 1.5, 2]
const rate = ref(1)
const trackRef = ref<HTMLElement | null>(null)
const pct = computed(() => props.duration > 0 ? Math.min(1, props.currentTime / props.duration) : 0)

function seekFromEvent(e: MouseEvent) {
  if (!trackRef.value) return
  const r = trackRef.value.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  emit('update:time', Math.max(0, Math.min(1, x)) * props.duration)
}
function setRate(r: number) {
  rate.value = r
  if (document.activeElement instanceof HTMLElement)
    document.activeElement.blur()
}
</script>

<template>
  <div
    class="shrink-0 border-t border-base-content/10 bg-base-100/95 backdrop-blur px-5 py-3"
  >
    <div class="max-w-[1180px] mx-auto flex items-center gap-3 sm:gap-4">
      <div class="flex items-center gap-1">
        <button
          class="btn btn-ghost btn-sm btn-square"
          title="Back 10s"
          @click="emit('update:time', Math.max(0, currentTime - 10))"
        >
          <Icon name="skip-back" :size="16" />
        </button>
        <button
          class="btn btn-sm btn-circle text-white border-0 shadow"
          :style="{ background: 'var(--accent)' }"
          @click="emit('update:playing', !playing)"
        >
          <Icon :name="playing ? 'pause' : 'play'" :size="18" />
        </button>
        <button
          class="btn btn-ghost btn-sm btn-square"
          title="Forward 10s"
          @click="emit('update:time', Math.min(props.duration, currentTime + 10))"
        >
          <Icon name="skip-fwd" :size="16" />
        </button>
      </div>

      <span
        class="text-[12px] font-mono text-base-content/55 tabular-nums w-10 text-right"
        >{{ fmtClock(currentTime) }}</span
      >

      <!-- waveform -->
      <div
        ref="trackRef"
        class="flex-1 h-9 flex items-center gap-[2px] cursor-pointer min-w-0"
        @click="seekFromEvent"
      >
        <span
          v-for="(hgt, i) in WAVE"
          :key="i"
          class="flex-1 rounded-full transition-colors"
          :style="{
            height: `${hgt * 100}%`,
            background:
              i / WAVE.length <= pct
                ? 'var(--accent)'
                : 'color-mix(in oklab, var(--bc) 18%, transparent)',
          }"
        />
      </div>

      <span
        class="text-[12px] font-mono text-base-content/40 tabular-nums w-10"
        >{{ fmtClock(props.duration) }}</span
      >

      <div class="dropdown dropdown-top dropdown-end hidden sm:block">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-sm w-14 font-mono text-[12px]"
        >
          {{ rate }}×
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu menu-sm bg-base-100 rounded-xl shadow-xl border border-base-content/10 mb-1 w-20"
        >
          <li v-for="r in rates" :key="r">
            <a :class="r === rate ? 'active' : ''" @click="setRate(r)"
              >{{ r }}×</a
            >
          </li>
        </ul>
      </div>
      <button
        class="btn btn-ghost btn-sm btn-square hidden md:flex text-base-content/60"
      >
        <Icon name="volume" :size="17" />
      </button>
      <button
        class="btn btn-ghost btn-sm btn-square hidden md:flex text-base-content/60"
        title="Download audio"
      >
        <Icon name="download" :size="17" />
      </button>
    </div>
  </div>
</template>
