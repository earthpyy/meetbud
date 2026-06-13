<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { cn } from '@/lib/cn'
import { PLATFORMS } from '@/lib/constants'
import Icon from '@/components/Icon.vue'

const emit = defineEmits<{ close: []; submit: [link: string, title: string] }>()

const link = ref('')
const title = ref('')
const shown = ref(false)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => {
  shown.value = true
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const l = computed(() => link.value.trim())
const valid = computed(
  () =>
    l.value.length > 6 &&
    /(zoom\.us|meet\.google|teams\.|webex|https?:\/\/)/i.test(l.value),
)
const plat = computed(() =>
  /zoom/i.test(l.value)
    ? PLATFORMS.zoom
    : /teams/i.test(l.value)
      ? PLATFORMS.teams
      : PLATFORMS.meet,
)

function submit() {
  if (valid.value)
    emit('submit', l.value, title.value.trim() || 'Untitled meeting')
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
          'relative bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 w-full max-w-md p-6 transition-all duration-200',
          shown ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        )
      "
      @click.stop
    >
      <div class="flex items-start justify-between mb-1">
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center"
          :style="{
            background: 'color-mix(in oklab, var(--accent) 13%, transparent)',
            color: 'var(--accent)',
          }"
        >
          <Icon name="record" :size="20" />
        </div>
        <button class="btn btn-ghost btn-sm btn-square" @click="emit('close')">
          <Icon name="x" :size="18" />
        </button>
      </div>
      <h2 class="text-lg font-extrabold tracking-tight mt-3">
        Record a meeting
      </h2>
      <p class="text-base-content/55 text-[13.5px] mt-1">
        Paste a link to any meeting — even one that isn't on your calendar — and
        meetbud will join to record &amp; transcribe.
      </p>

      <div class="mt-5">
        <label class="text-[12.5px] font-semibold text-base-content/65"
          >Meeting link</label
        >
        <label
          class="mt-1.5 flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 focus-within:border-[color:var(--accent)] focus-within:bg-base-100 transition-colors"
        >
          <Icon name="link" :size="17" class="text-base-content/40 shrink-0" />
          <input
            v-model="link"
            placeholder="zoom.us/j/… or meet.google.com/…"
            class="bg-transparent outline-none text-[14px] w-full placeholder:text-base-content/35"
            @keydown.enter="submit"
          />
          <span
            v-if="valid"
            class="flex items-center gap-1 text-[11.5px] font-semibold shrink-0 whitespace-nowrap"
            :style="{ color: plat.color }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :style="{ background: plat.color }"
            />{{ plat.short }}
          </span>
        </label>
      </div>
      <div class="mt-4">
        <label class="text-[12.5px] font-semibold text-base-content/65"
          >Meeting title
          <span class="text-base-content/40 font-normal"
            >(optional)</span
          ></label
        >
        <input
          v-model="title"
          placeholder="e.g. Vendor demo"
          class="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors"
        />
      </div>
      <div
        class="mt-4 flex items-start gap-2 text-[12px] text-base-content/55 rounded-xl bg-base-200/50 p-3"
      >
        <Icon name="info" :size="15" class="mt-0.5 shrink-0" />
        <span
          >The notetaker joins as “meetbud Notetaker” via Recall.ai and starts
          recording when it's admitted.</span
        >
      </div>

      <div class="flex gap-2 mt-5">
        <button class="btn btn-ghost flex-1" @click="emit('close')">
          Cancel
        </button>
        <button
          :disabled="!valid"
          class="btn flex-1 text-white border-0 disabled:opacity-50"
          :style="{ background: 'var(--accent)' }"
          @click="submit"
        >
          <Icon name="record" :size="16" /> Start recording
        </button>
      </div>
    </div>
  </div>
</template>
