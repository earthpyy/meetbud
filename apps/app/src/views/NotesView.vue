<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { cn } from '@/lib/cn'
import { fmtDuration, fmtTime, relativeDay } from '@/lib/format'
import { PLATFORMS } from '@/lib/constants'
import type { Meeting } from '@/lib/types'
import { useMeetingsStore } from '@/stores/meetings'
import { useUiStore } from '@/stores/ui'
import { useRecordingsStore } from '@/stores/recordings'
import Icon from '@/components/Icon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import AttendeeStack from '@/components/AttendeeStack.vue'

const router = useRouter()
const ui = useUiStore()
const recordings = useRecordingsStore()
const meetingsStore = useMeetingsStore()
const now = new Date()
const layout = computed(() => ui.notesLayout)

const FILTERS = [
  { v: 'all', label: 'All' },
  { v: 'done', label: 'Done' },
  { v: 'processing', label: 'Processing' },
  { v: 'ongoing', label: 'Live' },
  { v: 'upcoming', label: 'Upcoming' },
]

const q = ref(meetingsStore.notes.q)
const filter = ref(meetingsStore.notes.filter)

onMounted(() => meetingsStore.loadNotesPage(1))

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(q, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => meetingsStore.setNotesQuery({ q: val }), 300)
})

onUnmounted(() => clearTimeout(searchTimer))

function setFilter(v: string) {
  filter.value = v
  meetingsStore.setNotesQuery({ filter: v })
}

const list = computed(() => meetingsStore.notes.items)
const pageCount = computed(() =>
  Math.max(1, Math.ceil(meetingsStore.notes.total / meetingsStore.notes.pageSize)),
)
const currentPage = computed(() => meetingsStore.notes.page)

function goToPage(p: number) {
  if (p < 1 || p > pageCount.value) return
  meetingsStore.loadNotesPage(p)
}

function open(m: Meeting) {
  router.push({ name: 'meeting', params: { id: m.id } })
}
function hasNotes(m: Meeting) {
  return ['done', 'transcribing', 'summarizing'].includes(m.status)
}
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="max-w-[1280px] mx-auto px-6 py-6">
      <!-- controls -->
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <label
          class="flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-base-100 border border-base-content/10 focus-within:border-[color:var(--accent)] transition-colors w-full sm:w-72"
        >
          <Icon name="search" :size="17" class="text-base-content/40" />
          <input
            v-model="q"
            placeholder="Search recordings…"
            class="bg-transparent outline-none text-[14px] w-full placeholder:text-base-content/40"
          />
        </label>

        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="f in FILTERS"
            :key="f.v"
            :class="
              cn(
                'px-3 h-8 rounded-lg text-[13px] font-medium transition-colors',
                filter === f.v
                  ? 'text-white'
                  : 'bg-base-100 border border-base-content/10 text-base-content/60 hover:text-base-content',
              )
            "
            :style="
              filter === f.v ? { background: 'var(--accent)' } : undefined
            "
            @click="setFilter(f.v)"
          >
            {{ f.label }}
          </button>
        </div>

        <div class="flex-1" />

        <div class="join border border-base-content/10 rounded-lg">
          <button
            :class="
              cn(
                'join-item btn btn-sm btn-square border-0',
                layout === 'table'
                  ? 'text-white'
                  : 'btn-ghost text-base-content/50',
              )
            "
            :style="
              layout === 'table' ? { background: 'var(--accent)' } : undefined
            "
            @click="ui.setNotesLayout('table')"
          >
            <Icon name="list" :size="17" />
          </button>
          <button
            :class="
              cn(
                'join-item btn btn-sm btn-square border-0',
                layout === 'cards'
                  ? 'text-white'
                  : 'btn-ghost text-base-content/50',
              )
            "
            :style="
              layout === 'cards' ? { background: 'var(--accent)' } : undefined
            "
            @click="ui.setNotesLayout('cards')"
          >
            <Icon name="grid" :size="17" />
          </button>
        </div>
      </div>

      <div
        v-if="list.length === 0"
        class="flex flex-col items-center justify-center py-24 text-center"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-4"
        >
          <Icon name="search" :size="24" class="text-base-content/30" />
        </div>
        <p class="font-semibold">No recordings found</p>
        <p class="text-base-content/50 text-sm mt-1">
          Try a different search or filter.
        </p>
      </div>

      <!-- table -->
      <div
        v-else-if="layout === 'table'"
        class="bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden"
      >
        <table class="w-full">
          <thead>
            <tr
              class="text-left text-[11.5px] font-semibold uppercase tracking-wide text-base-content/45 border-b border-base-content/10"
            >
              <th
                :class="cn('font-semibold pl-5', ui.dense ? 'py-2.5' : 'py-3')"
              >
                Meeting
              </th>
              <th class="font-semibold hidden md:table-cell">When</th>
              <th class="font-semibold hidden lg:table-cell">Duration</th>
              <th class="font-semibold hidden xl:table-cell">Attendees</th>
              <th class="font-semibold">Status</th>
              <th class="pr-5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in list"
              :key="m.id"
              class="border-b border-base-content/5 last:border-0 hover:bg-base-content/[0.025] cursor-pointer transition-colors"
              @click="open(m)"
            >
              <td :class="cn('pl-5', ui.dense ? 'py-2.5' : 'py-3.5')">
                <div class="flex items-center gap-3">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ background: PLATFORMS[m.platform].color }"
                  />
                  <div class="min-w-0">
                    <div
                      class="font-semibold text-[14px] truncate flex items-center gap-1.5"
                    >
                      {{ m.title }}
                      <Icon
                        v-if="recordings.getRecording(m.id)"
                        name="mic"
                        :size="13"
                        class="text-base-content/35 shrink-0"
                      />
                    </div>
                    <div class="text-[12px] text-base-content/45 md:hidden">
                      {{ relativeDay(m.start, now) }} · {{ fmtTime(m.start) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="hidden md:table-cell text-[13px] text-base-content/70">
                <div class="font-medium">{{ relativeDay(m.start, now) }}</div>
                <div class="text-[11.5px] text-base-content/40">
                  {{ fmtTime(m.start) }}
                </div>
              </td>
              <td class="hidden lg:table-cell text-[13px] text-base-content/60">
                {{ fmtDuration(m.duration) }}
              </td>
              <td class="hidden xl:table-cell">
                <AttendeeStack :people="m.attendeesP" />
              </td>
              <td><StatusBadge :status="m.status" sm /></td>
              <td class="pr-5 text-right">
                <Icon
                  name="chevron-right"
                  :size="18"
                  class="text-base-content/30 inline"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <button
          v-for="m in list"
          :key="m.id"
          class="text-left bg-base-100 border border-base-content/10 rounded-2xl p-4 hover:shadow-md hover:border-base-content/20 transition-all"
          @click="open(m)"
        >
          <div class="flex items-center justify-between">
            <span
              class="inline-flex items-center gap-1.5 text-[12px] font-medium text-base-content/55 whitespace-nowrap"
            >
              <span
                class="w-2 h-2 rounded-full"
                :style="{ background: PLATFORMS[m.platform].color }"
              />{{ PLATFORMS[m.platform].label }}
            </span>
            <StatusBadge :status="m.status" sm />
          </div>
          <h3
            class="font-bold text-[15.5px] tracking-tight mt-2.5 leading-snug line-clamp-2"
          >
            {{ m.title }}
          </h3>
          <div
            class="flex items-center gap-3 mt-2 text-[12.5px] text-base-content/50"
          >
            <span class="flex items-center gap-1"
              ><Icon name="calendar" :size="13" />{{
                relativeDay(m.start, now)
              }}</span
            >
            <span class="flex items-center gap-1"
              ><Icon name="clock" :size="13" />{{
                fmtDuration(m.duration)
              }}</span
            >
            <span
              v-if="recordings.getRecording(m.id)"
              class="flex items-center gap-1"
              ><Icon name="mic" :size="13"
            /></span>
          </div>
          <div
            class="flex items-center justify-between mt-4 pt-3 border-t border-base-content/10"
          >
            <AttendeeStack :people="m.attendeesP" :max="5" :size="24" />
            <span
              class="text-[12.5px] font-semibold flex items-center gap-1"
              :style="hasNotes(m) ? { color: 'var(--accent)' } : undefined"
            >
              {{
                hasNotes(m)
                  ? m.status === 'done'
                    ? 'View notes'
                    : 'View progress'
                  : 'Details'
              }}
              <Icon name="arrow-right" :size="14" />
            </span>
          </div>
        </button>
      </div>

      <div
        v-if="pageCount > 1"
        class="flex items-center justify-center gap-1.5 mt-6"
      >
        <button
          class="btn btn-sm btn-ghost"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Prev
        </button>
        <button
          v-for="p in pageCount"
          :key="p"
          :class="
            cn(
              'btn btn-sm',
              p === currentPage ? 'text-white border-0' : 'btn-ghost',
            )
          "
          :style="p === currentPage ? { background: 'var(--accent)' } : undefined"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>
        <button
          class="btn btn-sm btn-ghost"
          :disabled="currentPage === pageCount"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
