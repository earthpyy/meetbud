<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { cn } from '@/lib/cn'
import { fmtDateLong, fmtDuration, fmtTimeRange } from '@/lib/format'
import { PLATFORMS } from '@/lib/constants'
import { fetchMeeting, fetchTranscript, fetchSummary, toMeeting } from '@/lib/meetingApi'
import type { ApiMeetingDetail, Meeting, Summary, TranscriptLine, Person } from '@/lib/types'
import Icon from '@/components/Icon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import AttendeeStack from '@/components/AttendeeStack.vue'
import AudioPlayer from '@/components/meeting/AudioPlayer.vue'
import SummaryTab from '@/components/meeting/SummaryTab.vue'
import TranscriptTab from '@/components/meeting/TranscriptTab.vue'
import ProcessingPanel from '@/components/meeting/ProcessingPanel.vue'
import UpcomingPanel from '@/components/meeting/UpcomingPanel.vue'

const route = useRoute()

const detail = ref<ApiMeetingDetail | null>(null)
const m = ref<Meeting | null>(null)
const transcript = ref<TranscriptLine[]>([])
const summary = ref<Summary | null>(null)
const recDuration = computed(() => detail.value?.media?.durationSec ?? 0)
const peopleById = reactive<Record<string, Person>>({})

async function loadDetail(id: string) {
  detail.value = null
  m.value = null
  transcript.value = []
  summary.value = null
  for (const k of Object.keys(peopleById)) delete peopleById[k]
  const d = await fetchMeeting(id)
  detail.value = d
  m.value = toMeeting(d)
  for (const p of m.value.attendeesP) peopleById[p.id] = p
  if (d.hasTranscript) transcript.value = await fetchTranscript(id)
  if (d.hasSummary) summary.value = await fetchSummary(id)
}
watch(() => route.params.id as string, (id) => loadDetail(id), { immediate: true })

const tab = ref<'summary' | 'transcript'>('summary')
const currentTime = ref(0)
const playing = ref(false)

let timer: ReturnType<typeof setInterval> | undefined
watch(playing, (on) => {
  clearInterval(timer)
  if (!on) return
  timer = setInterval(() => {
    const n = currentTime.value + 0.25
    if (n >= recDuration.value) {
      playing.value = false
      currentTime.value = recDuration.value
      return
    }
    currentTime.value = n
  }, 250)
})
onBeforeUnmount(() => clearInterval(timer))

function seekTo(sec: number) {
  currentTime.value = sec
  tab.value = 'transcript'
  playing.value = true
}
function seekOnly(sec: number) {
  currentTime.value = sec
}

const plat = computed(() => (m.value ? PLATFORMS[m.value.platform] : null))
const isDone = computed(() => m.value?.status === 'done')
const isProcessing = computed(
  () => m.value?.status === 'transcribing' || m.value?.status === 'summarizing',
)
const isUpcoming = computed(
  () => m.value?.status === 'upcoming' || m.value?.status === 'ongoing',
)

const tabs: ['summary' | 'transcript', string, string][] = [
  ['summary', 'Summary', 'sparkles'],
  ['transcript', 'Transcript', 'notes'],
]
</script>

<template>
  <div v-if="!m" class="p-10">Meeting not found.</div>
  <div v-else class="h-full flex flex-col bg-base-200/40">
    <div class="flex-1 min-h-0 overflow-auto">
      <div class="max-w-[1180px] mx-auto px-6 py-6">
        <!-- header -->
        <div class="bg-base-100 border border-base-content/10 rounded-2xl p-5">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <StatusBadge :status="m.status" sm />
                <span
                  class="text-[12.5px] font-medium text-base-content/55 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{ background: plat!.color }"
                  />{{ plat!.label }}
                </span>
              </div>
              <h1
                class="text-[24px] font-extrabold tracking-tight leading-tight"
              >
                {{ m.title }}
              </h1>
              <div
                class="flex items-center gap-4 mt-3 text-[13px] text-base-content/60 flex-wrap"
              >
                <span class="flex items-center gap-1.5 whitespace-nowrap"
                  ><Icon name="calendar" :size="15" />{{
                    fmtDateLong(m.start)
                  }}</span
                >
                <span class="flex items-center gap-1.5 whitespace-nowrap"
                  ><Icon name="clock" :size="15" />{{
                    fmtTimeRange(m.start, m.end)
                  }}</span
                >
                <span class="flex items-center gap-1.5 whitespace-nowrap"
                  ><Icon name="gauge" :size="15" />{{
                    fmtDuration(m.duration)
                  }}</span
                >
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="hidden sm:flex items-center mr-1">
                <AttendeeStack :people="m.attendeesP" :max="5" :size="30" />
              </div>
              <button class="btn btn-sm btn-ghost gap-1.5 text-base-content/70">
                <Icon name="share" :size="15" /> Share
              </button>
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-sm gap-1.5">
                  <Icon name="download" :size="15" /> Export
                </div>
                <ul
                  tabindex="0"
                  class="dropdown-content menu menu-sm bg-base-100 rounded-xl shadow-xl border border-base-content/10 mt-1 w-48 z-50"
                >
                  <li>
                    <a><Icon name="volume" :size="15" /> Audio (.mp3)</a>
                  </li>
                  <li>
                    <a><Icon name="notes" :size="15" /> Transcript (.txt)</a>
                  </li>
                  <li>
                    <a><Icon name="sparkles" :size="15" /> Summary (.pdf)</a>
                  </li>
                </ul>
              </div>
              <button
                class="btn btn-sm btn-ghost btn-square text-base-content/60"
              >
                <Icon name="more-vertical" :size="18" />
              </button>
            </div>
          </div>
        </div>

        <!-- body -->
        <div class="mt-6">
          <UpcomingPanel v-if="isUpcoming" :meeting="m" />
          <ProcessingPanel v-if="isProcessing" :meeting="m" />
          <template v-if="isDone">
            <div
              class="flex items-center gap-1 border-b border-base-content/10 mb-6"
            >
              <button
                v-for="[k, label, icon] in tabs"
                :key="k"
                :class="
                  cn(
                    'flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px transition-colors',
                    tab === k
                      ? 'border-current'
                      : 'border-transparent text-base-content/50 hover:text-base-content',
                  )
                "
                :style="
                  tab === k
                    ? { color: 'var(--accent)', borderColor: 'var(--accent)' }
                    : {}
                "
                @click="tab = k"
              >
                <Icon :name="icon" :size="16" /> {{ label }}
              </button>
            </div>
            <div :key="tab" class="tab-anim">
              <SummaryTab v-if="tab === 'summary'" :summary="summary" :people="peopleById" @seek="seekTo" />
              <TranscriptTab
                v-else
                :current-time="currentTime"
                :transcript="transcript"
                :people="peopleById"
                @seek="seekOnly"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <AudioPlayer
      v-if="isDone"
      :current-time="currentTime"
      :playing="playing"
      :duration="recDuration"
      @update:time="currentTime = $event"
      @update:playing="playing = $event"
    />
  </div>
</template>
