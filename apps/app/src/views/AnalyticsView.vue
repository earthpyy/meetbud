<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/lib/cn'
import { fmtInt, fmtCompact, fmtDuration } from '@/lib/format'
import { PLATFORMS } from '@/lib/constants'
import type { PlatformKey } from '@/lib/types'
import { buildPeriods, buildMemberStats } from '@/lib/analytics'
import { ADMIN_USERS } from '@/data/adminUsers'
import { useUiStore } from '@/stores/ui'
import Icon from '@/components/Icon.vue'
import Avatar from '@/components/Avatar.vue'
import KpiCard from '@/components/analytics/KpiCard.vue'
import BarChart from '@/components/analytics/BarChart.vue'
import Donut from '@/components/analytics/Donut.vue'
import Sparkline from '@/components/analytics/Sparkline.vue'

type Metric = 'meetings' | 'minutes' | 'tokens'
type SortKey = 'meetings' | 'hours' | 'tokens'

const ui = useUiStore()

const metric = ref<Metric>('meetings')
const sort = ref<SortKey>('meetings')

const gran = computed(() => ui.analyticsGran)
const perLabel = computed(() => (gran.value === 'weekly' ? 'week' : 'month'))

const series = computed(() => buildPeriods(gran.value))

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0)
const delta = (a: number[]) => {
  const p = a[a.length - 2]
  return p ? ((a[a.length - 1] - p) / p) * 100 : 0
}

const totMeet = computed(() => sum(series.value.meetings))
const totMin = computed(() => sum(series.value.minutes))
const totTok = computed(() => sum(series.value.tokens))

// active members (exclude pending invites) → leaderboard
const members = buildMemberStats(
  ADMIN_USERS.filter((u) => u.status === 'active'),
)
const usersSorted = computed(() => {
  const key =
    sort.value === 'hours'
      ? 'mins'
      : sort.value === 'tokens'
        ? 'tokens'
        : 'mtgs'
  return [...members].sort((a, b) => b[key] - a[key])
})
const maxMtg = Math.max(...members.map((u) => u.mtgs))

// platform split (stable mock proportions)
const platSplit = computed(() => {
  const t = totMeet.value
  const split: { key: PlatformKey; value: number }[] = [
    { key: 'meet', value: Math.round(t * 0.52) },
    { key: 'zoom', value: Math.round(t * 0.33) },
    { key: 'teams', value: t - Math.round(t * 0.52) - Math.round(t * 0.33) },
  ]
  return split.map((p) => ({ ...p, ...PLATFORMS[p.key] }))
})

const chartSeries = computed(() =>
  metric.value === 'minutes'
    ? series.value.minutes
    : metric.value === 'tokens'
      ? series.value.tokens
      : series.value.meetings,
)
const chartData = computed(() =>
  series.value.periods.map((p, i) => ({
    label: p.label,
    value: chartSeries.value[i],
  })),
)
const chartFmt = computed(() =>
  metric.value === 'tokens'
    ? (v: number) => fmtCompact(v) + ' tokens'
    : metric.value === 'minutes'
      ? (v: number) => fmtInt(v) + ' min'
      : (v: number) => fmtInt(v) + ' meetings',
)
const chartSubtitle = computed(() =>
  metric.value === 'tokens'
    ? 'AI tokens'
    : metric.value === 'minutes'
      ? 'Minutes recorded'
      : 'Meetings recorded',
)

const avgLen = computed(() => Math.round(totMin.value / totMeet.value))
const summariesPct = 96.4
const transcriptAcc = 98.1

const rangeLabel = computed(
  () => `Last 12 ${gran.value === 'weekly' ? 'weeks' : 'months'}`,
)
const sortedByLabel = computed(() =>
  sort.value === 'hours'
    ? 'hours'
    : sort.value === 'tokens'
      ? 'tokens'
      : 'meetings',
)

const granOptions: [typeof gran.value, string][] = [
  ['weekly', 'Weekly'],
  ['monthly', 'Monthly'],
]
const metricOptions: [Metric, string][] = [
  ['meetings', 'Meetings'],
  ['minutes', 'Minutes'],
  ['tokens', 'Tokens'],
]

const quickStats = computed(() => [
  {
    icon: 'clock',
    label: 'Avg meeting length',
    val: fmtDuration(avgLen.value),
  },
  { icon: 'sparkles', label: 'Summaries generated', val: summariesPct + '%' },
  {
    icon: 'activity',
    label: 'Transcription accuracy',
    val: transcriptAcc + '%',
  },
])
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="max-w-[1180px] mx-auto px-6 py-6 tab-anim">
      <!-- header controls -->
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex items-center gap-2 text-[13px] text-base-content/55">
          <Icon name="calendar" :size="15" class="text-base-content/40" />
          <span class="font-medium">{{ rangeLabel }}</span>
          <span class="text-base-content/25">·</span>
          <span
            >{{ series.periods[0].label }} –
            {{ series.periods[series.periods.length - 1].label }}</span
          >
        </div>
        <div class="flex-1" />
        <div
          class="join border border-base-content/10 rounded-xl overflow-hidden"
        >
          <button
            v-for="[v, label] in granOptions"
            :key="v"
            :class="
              cn(
                'join-item px-4 h-9 text-[13px] font-semibold transition-colors',
                gran === v
                  ? 'text-white'
                  : 'bg-base-100 text-base-content/60 hover:text-base-content',
              )
            "
            :style="gran === v ? { background: 'var(--accent)' } : undefined"
            @click="ui.setAnalyticsGran(v)"
          >
            {{ label }}
          </button>
        </div>
        <button
          class="btn btn-sm gap-1.5 bg-base-100 border-base-content/15 text-base-content/70 font-medium shadow-sm"
        >
          <Icon name="download" :size="15" /> Export
        </button>
      </div>

      <!-- KPI row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          icon="video"
          label="Meetings recorded"
          :value="fmtInt(totMeet)"
          :sub="`vs last ${perLabel}`"
          :series="series.meetings"
          :delta-pct="delta(series.meetings)"
        />
        <KpiCard
          icon="timer"
          label="Hours transcribed"
          :value="fmtCompact(totMin / 60)"
          :sub="`vs last ${perLabel}`"
          :series="series.minutes"
          :delta-pct="delta(series.minutes)"
        />
        <KpiCard
          icon="cpu"
          label="AI tokens used"
          :value="fmtCompact(totTok)"
          :sub="`vs last ${perLabel}`"
          :series="series.tokens"
          :delta-pct="delta(series.tokens)"
        />
        <KpiCard
          icon="users"
          label="Active users"
          :value="fmtInt(members.length)"
          sub="of 9 seats"
          :series="[6, 6, 7, 7, 7, 8, 8, 8]"
          :delta-pct="14.3"
        />
      </div>

      <!-- chart + platform split -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <!-- time-series -->
        <div
          class="lg:col-span-2 bg-base-100 border border-base-content/10 rounded-2xl p-5"
        >
          <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 class="font-bold text-[15px] tracking-tight">
                Recording activity
              </h3>
              <p class="text-[12px] text-base-content/45 mt-0.5">
                {{ chartSubtitle }} per {{ perLabel }}
              </p>
            </div>
            <div class="flex items-center gap-1 p-1 rounded-xl bg-base-200/70">
              <button
                v-for="[v, label] in metricOptions"
                :key="v"
                :class="
                  cn(
                    'px-3 h-7 rounded-lg text-[12.5px] font-semibold transition-colors',
                    metric === v
                      ? 'bg-base-100 shadow-sm text-[color:var(--accent)]'
                      : 'text-base-content/55 hover:text-base-content',
                  )
                "
                @click="metric = v"
              >
                {{ label }}
              </button>
            </div>
          </div>
          <div class="pl-7">
            <BarChart :data="chartData" :format="chartFmt" />
          </div>
        </div>

        <!-- platform split + quick stats -->
        <div
          class="bg-base-100 border border-base-content/10 rounded-2xl p-5 flex flex-col"
        >
          <h3 class="font-bold text-[15px] tracking-tight">By platform</h3>
          <div class="flex items-center gap-4 mt-4">
            <Donut :segments="platSplit" />
            <div class="flex-1 flex flex-col gap-2.5 min-w-0">
              <div
                v-for="p in platSplit"
                :key="p.key"
                class="flex items-center gap-2"
              >
                <span
                  class="w-2.5 h-2.5 rounded-sm shrink-0"
                  :style="{ background: p.color }"
                />
                <span class="text-[13px] font-medium flex-1 truncate">{{
                  p.short
                }}</span>
                <span class="text-[13px] font-semibold tabular-nums"
                  >{{ Math.round((p.value / totMeet) * 100) }}%</span
                >
              </div>
            </div>
          </div>
          <div
            class="border-t border-base-content/10 mt-5 pt-4 grid grid-cols-1 gap-3"
          >
            <div
              v-for="s in quickStats"
              :key="s.label"
              class="flex items-center gap-2.5"
            >
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-base-200/80 text-base-content/55"
              >
                <Icon :name="s.icon" :size="15" />
              </div>
              <span class="text-[12.5px] text-base-content/60 flex-1">{{
                s.label
              }}</span>
              <span class="text-[13.5px] font-bold tabular-nums">{{
                s.val
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- per-user leaderboard -->
      <div
        class="bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-base-content/10"
        >
          <div>
            <h3 class="font-bold text-[15px] tracking-tight">
              Usage by member
            </h3>
            <p class="text-[12px] text-base-content/45 mt-0.5">
              All-time activity across {{ members.length }} active members
            </p>
          </div>
          <span class="text-[11.5px] text-base-content/40"
            >Sorted by {{ sortedByLabel }}</span
          >
        </div>
        <table class="w-full">
          <thead>
            <tr
              class="text-left text-[11px] uppercase tracking-wide text-base-content/45 border-b border-base-content/10"
            >
              <th class="font-semibold pl-5 py-3">Member</th>
              <th
                class="font-semibold py-3 w-[26%] hidden sm:table-cell cursor-pointer select-none hover:text-base-content transition-colors"
                @click="sort = 'meetings'"
              >
                <span
                  :class="
                    cn(
                      'inline-flex items-center gap-1',
                      sort === 'meetings' && 'text-[color:var(--accent)]',
                    )
                  "
                >
                  Meetings<Icon
                    v-if="sort === 'meetings'"
                    name="chevron-down"
                    :size="12"
                  />
                </span>
              </th>
              <th
                class="font-semibold hidden md:table-cell cursor-pointer select-none hover:text-base-content transition-colors"
                @click="sort = 'hours'"
              >
                <span
                  :class="
                    cn(
                      'inline-flex items-center gap-1',
                      sort === 'hours' && 'text-[color:var(--accent)]',
                    )
                  "
                >
                  Hours<Icon
                    v-if="sort === 'hours'"
                    name="chevron-down"
                    :size="12"
                  />
                </span>
              </th>
              <th
                class="font-semibold hidden lg:table-cell cursor-pointer select-none hover:text-base-content transition-colors"
                @click="sort = 'tokens'"
              >
                <span
                  :class="
                    cn(
                      'inline-flex items-center gap-1',
                      sort === 'tokens' && 'text-[color:var(--accent)]',
                    )
                  "
                >
                  AI tokens<Icon
                    v-if="sort === 'tokens'"
                    name="chevron-down"
                    :size="12"
                  />
                </span>
              </th>
              <th class="font-semibold hidden xl:table-cell">Avg</th>
              <th class="font-semibold hidden md:table-cell">Trend</th>
              <th class="font-semibold pr-5 hidden sm:table-cell">
                Last active
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in usersSorted"
              :key="u.id"
              class="border-b border-base-content/5 last:border-0 hover:bg-base-content/[0.02] transition-colors"
            >
              <td :class="cn('pl-5', ui.dense ? 'py-2.5' : 'py-3.5')">
                <div class="flex items-center gap-3">
                  <Avatar :person="u" :size="36" />
                  <div class="min-w-0">
                    <div
                      class="font-semibold text-[14px] truncate flex items-center gap-1.5"
                    >
                      {{ u.name }}
                      <Icon
                        v-if="u.role === 'admin'"
                        name="shield"
                        :size="12"
                        :style="{ color: 'var(--accent)' }"
                      />
                    </div>
                    <div class="text-[12px] text-base-content/45 truncate">
                      {{ u.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="hidden sm:table-cell pr-4">
                <div class="flex items-center gap-2.5">
                  <span class="text-[14px] font-bold tabular-nums w-8">{{
                    u.mtgs
                  }}</span>
                  <div
                    class="flex-1 h-1.5 rounded-full bg-base-content/[0.08] overflow-hidden max-w-[120px]"
                  >
                    <div
                      class="h-full rounded-full"
                      :style="{
                        width: `${(u.mtgs / maxMtg) * 100}%`,
                        background: 'var(--accent)',
                      }"
                    />
                  </div>
                </div>
              </td>
              <td
                class="hidden md:table-cell text-[13.5px] font-semibold tabular-nums"
              >
                {{ fmtInt(u.hours) }}
              </td>
              <td
                class="hidden lg:table-cell text-[13.5px] tabular-nums text-base-content/70"
              >
                {{ fmtCompact(u.tokens) }}
              </td>
              <td
                class="hidden xl:table-cell text-[13px] tabular-nums text-base-content/55"
              >
                {{ u.avg }}m
              </td>
              <td class="hidden md:table-cell">
                <div class="w-[88px]">
                  <Sparkline
                    :points="u.spark"
                    :w="88"
                    :h="26"
                    :fill="false"
                    color="color-mix(in oklab, var(--accent) 80%, var(--fallback-bc,currentColor))"
                  />
                </div>
              </td>
              <td
                class="hidden sm:table-cell pr-5 text-[12.5px] text-base-content/50"
              >
                {{ u.last }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-[11px] text-base-content/35 mt-4 text-center">
        Figures are illustrative sample data · meetbud analytics
      </div>
    </div>
  </div>
</template>
