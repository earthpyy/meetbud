<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/lib/cn'
import { fmtClock } from '@/lib/format'
import type { TranscriptLine, Person } from '@/lib/types'
import Icon from '@/components/Icon.vue'
import Avatar from '@/components/Avatar.vue'

const UNKNOWN_PERSON: Person = { id: '', name: 'Speaker', email: '', initials: '?', color: '#94a3b8' }

const props = defineProps<{
  currentTime: number
  transcript: TranscriptLine[]
  people: Record<string, Person>
}>()
const emit = defineEmits<{ seek: [t: number] }>()

const q = ref('')

const activeIdx = computed(() => {
  let idx = -1
  for (let i = 0; i < props.transcript.length; i++) {
    if (props.transcript[i].t <= props.currentTime) idx = i
    else break
  }
  return idx
})

const ql = computed(() => q.value.trim().toLowerCase())

function visible(line: TranscriptLine) {
  if (!ql.value) return true
  const p = props.people[line.sp] ?? UNKNOWN_PERSON
  return (
    line.text.toLowerCase().includes(ql.value) ||
    p.name.toLowerCase().includes(ql.value)
  )
}
</script>

<template>
  <div class="max-w-[820px]">
    <label
      class="flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-base-100 border border-base-content/10 focus-within:border-[color:var(--accent)] transition-colors mb-5 w-full sm:w-80"
    >
      <Icon name="search" :size="16" class="text-base-content/40" />
      <input
        v-model="q"
        placeholder="Search transcript…"
        class="bg-transparent outline-none text-[13.5px] w-full placeholder:text-base-content/40"
      />
    </label>
    <div class="space-y-1">
      <template v-for="(line, i) in props.transcript" :key="i">
        <div
          v-if="visible(line)"
          :class="
            cn(
              'flex gap-3 rounded-xl p-3 transition-colors',
              i === activeIdx ? '' : 'hover:bg-base-content/[0.025]',
            )
          "
          :style="
            i === activeIdx
              ? {
                  background:
                    'color-mix(in oklab, var(--accent) 9%, transparent)',
                  boxShadow: 'inset 3px 0 0 var(--accent)',
                }
              : {}
          "
        >
          <Avatar :person="props.people[line.sp] ?? UNKNOWN_PERSON" :size="32" class="mt-0.5" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-0.5">
              <span
                class="font-semibold text-[13.5px] whitespace-nowrap"
                :style="{ color: (props.people[line.sp] ?? UNKNOWN_PERSON).color }"
                >{{ (props.people[line.sp] ?? UNKNOWN_PERSON).name }}</span
              >
              <button
                class="font-mono text-[11.5px] text-base-content/40 hover:text-[color:var(--accent)] tabular-nums"
                @click="emit('seek', line.t)"
              >
                {{ fmtClock(line.t) }}
              </button>
            </div>
            <p class="text-[14px] leading-relaxed text-base-content/80">
              {{ line.text }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
