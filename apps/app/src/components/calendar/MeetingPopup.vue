<script setup lang="ts">
// popupLayout is hardcoded to "standard" in this build (Tweaks panel dropped),
// so only the standard (non-compact) layout is rendered.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cn } from '@/lib/cn'
import {
  fmtDateMed,
  fmtDuration,
  fmtTimeRange,
  relativeDay,
} from '@/lib/format'
import { PLATFORMS, STATUS } from '@/lib/constants'
import type { Meeting } from '@/lib/types'
import { useRecordingsStore } from '@/stores/recordings'
import Icon from '@/components/Icon.vue'
import Avatar from '@/components/Avatar.vue'

const props = defineProps<{ meeting: Meeting }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const recordings = useRecordingsStore()

const m = computed(() => props.meeting)
const rec = computed(() => recordings.getRecording(m.value.id))
const plat = computed(() => PLATFORMS[m.value.platform])
const st = computed(() => STATUS[m.value.status])
const hasNotes = computed(() =>
  ['done', 'transcribing', 'summarizing'].includes(m.value.status),
)

const shown = ref(false)
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => {
  shown.value = true
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function viewNotes() {
  emit('close')
  router.push({ name: 'meeting', params: { id: m.value.id } })
}
</script>

<template>
  <div
    class="fixed inset-0 z-[80] flex items-center justify-center p-4"
    @click="emit('close')"
  >
    <div
      :class="
        cn(
          'absolute inset-0 bg-black/40 transition-opacity',
          shown ? 'opacity-100' : 'opacity-0',
        )
      "
    />
    <div
      :class="
        cn(
          'relative bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 w-full overflow-hidden transition-all duration-200 max-w-lg',
          shown ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        )
      "
      @click.stop
    >
      <!-- color header -->
      <div class="h-1.5" :style="{ background: plat.color }" />
      <div class="p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span :class="cn('badge badge-sm gap-1 border-0', st.badge)">
                <span
                  v-if="st.pulse"
                  class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                />{{ st.label }}
              </span>
              <span
                class="text-[12px] font-medium text-base-content/50 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :style="{ background: plat.color }"
                />{{ plat.label }}
              </span>
            </div>
            <h2 class="font-extrabold tracking-tight leading-tight text-xl">
              {{ m.title }}
            </h2>
          </div>
          <button
            class="btn btn-ghost btn-sm btn-square shrink-0 -mr-1 -mt-1"
            @click="emit('close')"
          >
            <Icon name="x" :size="18" />
          </button>
        </div>

        <!-- date / time -->
        <div class="mt-4 flex flex-col gap-2.5">
          <div class="flex items-center gap-3 text-[13.5px]">
            <Icon
              name="calendar"
              :size="17"
              class="text-base-content/40 shrink-0"
            />
            <span class="font-medium whitespace-nowrap"
              >{{ relativeDay(m.start, new Date()) }} ·
              {{ fmtDateMed(m.start) }}</span
            >
          </div>
          <div class="flex items-center gap-3 text-[13.5px]">
            <Icon
              name="clock"
              :size="17"
              class="text-base-content/40 shrink-0"
            />
            <span class="whitespace-nowrap"
              >{{ fmtTimeRange(m.start, m.end) }}
              <span class="text-base-content/45"
                >· {{ fmtDuration(m.duration) }}</span
              ></span
            >
          </div>
          <div class="flex items-center gap-3 text-[13.5px]">
            <Icon
              name="video"
              :size="17"
              class="text-base-content/40 shrink-0"
            />
            <a
              class="link link-hover font-mono text-[12.5px] truncate"
              :style="{ color: 'var(--accent)' }"
              >{{ m.link }}</a
            >
          </div>
        </div>

        <p class="mt-4 text-[13.5px] text-base-content/65 leading-relaxed">
          {{ m.desc }}
        </p>

        <!-- attendees -->
        <div class="mt-4">
          <div
            class="text-[11.5px] font-semibold uppercase tracking-wide text-base-content/40 mb-2"
          >
            {{ m.attendeesP.length }} attendees
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="p in m.attendeesP"
              :key="p.id"
              class="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-base-200/70"
            >
              <Avatar :person="p" :size="24" />
              <span class="text-[12.5px] font-medium"
                >{{ p.name
                }}<span
                  v-if="p.id === m.organizer"
                  class="text-base-content/40"
                >
                  · host</span
                ></span
              >
            </div>
          </div>
        </div>

        <!-- recording toggle -->
        <div
          class="mt-5 rounded-xl border p-3.5 transition-colors"
          :style="
            rec
              ? {
                  borderColor:
                    'color-mix(in oklab, var(--accent) 45%, transparent)',
                  background:
                    'color-mix(in oklab, var(--accent) 8%, transparent)',
                }
              : {
                  borderColor:
                    'color-mix(in oklab, var(--bc) 12%, transparent)',
                }
          "
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              :style="
                rec
                  ? { background: 'var(--accent)', color: '#fff' }
                  : {
                      background:
                        'color-mix(in oklab, var(--bc) 8%, transparent)',
                      color: 'var(--bc)',
                    }
              "
            >
              <Icon name="record" :size="18" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[13.5px] font-semibold">Record this meeting</div>
              <div class="text-[11.5px] text-base-content/55 leading-snug">
                {{
                  rec
                    ? 'A meetbud notetaker will join and record.'
                    : 'Turn on to capture audio, transcript & summary.'
                }}
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
                  m.id,
                  ($event.target as HTMLInputElement).checked,
                )
              "
            />
          </div>
          <div
            v-if="rec"
            class="mt-2.5 pt-2.5 border-t border-base-content/10 flex items-center gap-1.5 text-[11.5px] text-base-content/55"
          >
            <Icon name="info" :size="13" /> Recorded &amp; transcribed via
            Recall.ai. The bot appears as “meetbud Notetaker”.
          </div>
        </div>

        <!-- footer -->
        <div class="mt-5 flex items-center gap-2">
          <button
            v-if="hasNotes"
            class="btn btn-sm flex-1 text-white border-0"
            :style="{ background: 'var(--accent)' }"
            @click="viewNotes"
          >
            <Icon name="notes" :size="16" />
            {{ m.status === 'done' ? 'View notes' : 'View progress' }}
          </button>
          <button class="btn btn-sm btn-ghost gap-1.5 text-base-content/70">
            <Icon name="external" :size="15" /> Open in Google Calendar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
