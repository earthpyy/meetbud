<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/Icon.vue'
import DaisySelect from '@/components/DaisySelect.vue'
import SettingRow from './SettingRow.vue'
import MaskedKey from './MaskedKey.vue'
import { useSettingsStore } from '@/stores/settings'

const inputCls =
  'w-full h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors'

const store = useSettingsStore()

// New secret key typed by the admin (empty = keep existing).
const k = computed({
  get: () => store.draft.aiApiKey ?? '',
  set: (v: string) => (store.draft.aiApiKey = v),
})
const base = computed({
  get: () => store.draft.aiBaseUrl ?? '',
  set: (v: string) => (store.draft.aiBaseUrl = v),
})
const model = computed({
  get: () => store.draft.aiModel ?? '',
  set: (v: string) => (store.draft.aiModel = v),
})
const temp = computed({
  get: () => store.draft.aiTemperature ?? 0.3,
  set: (v: number) => (store.draft.aiTemperature = v),
})
const prompt = computed({
  get: () => store.draft.aiSystemPrompt ?? '',
  set: (v: string) => (store.draft.aiSystemPrompt = v),
})
const aiKeySet = computed(() => store.settings?.aiApiKeySet ?? false)

const models = [
  'claude-opus-4-8',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
  'claude-fable-5',
]
</script>

<template>
  <div>
    <div class="flex items-center gap-2.5 mb-1">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        :style="{
          background: 'color-mix(in oklab, var(--accent) 13%, transparent)',
          color: 'var(--accent)',
        }"
      >
        <Icon name="sparkles" :size="18" />
      </div>
      <div>
        <h3 class="font-bold text-[15.5px] tracking-tight">
          AI &amp; Summarization
        </h3>
        <p class="text-[12.5px] text-base-content/50">
          Connect an Anthropic-compatible endpoint used to generate summaries.
        </p>
      </div>
    </div>
    <div class="mt-3">
      <SettingRow
        label="API base URL"
        hint="Any Anthropic-compatible endpoint (proxy, gateway, or self-hosted)."
      >
        <input v-model="base" :class="inputCls + ' font-mono text-[13px]'" />
      </SettingRow>
      <SettingRow
        label="API key"
        hint="Stored encrypted. Used server-side only."
      >
        <MaskedKey v-model="k" placeholder="sk-ant-..." :configured="aiKeySet" />
      </SettingRow>
      <SettingRow
        label="Model"
        hint="Used for summaries and action-item extraction."
      >
        <DaisySelect
          :value="model"
          :options="models"
          @change="model = $event"
        />
      </SettingRow>
      <SettingRow
        label="Temperature"
        hint="Lower = more factual. Higher = more creative."
      >
        <div class="flex items-center gap-3">
          <input
            v-model.number="temp"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="range range-sm flex-1"
            :style="{ '--range-shdw': 'var(--accent)' }"
          />
          <span class="font-mono text-[13px] w-8 text-right tabular-nums">{{
            temp.toFixed(1)
          }}</span>
        </div>
      </SettingRow>
      <SettingRow
        label="Summary prompt"
        hint="The system prompt sent with each transcript."
        stacked
      >
        <textarea
          v-model="prompt"
          rows="4"
          class="w-full p-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[13.5px] leading-relaxed outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors resize-none"
        />
      </SettingRow>
    </div>
  </div>
</template>
