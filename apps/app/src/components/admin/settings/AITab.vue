<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/Icon.vue'
import DaisySelect from '@/components/DaisySelect.vue'
import SettingRow from './SettingRow.vue'
import MaskedKey from './MaskedKey.vue'

const inputCls =
  'w-full h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors'

const k = ref('sk-ant-•••••••••••••••••••••••••••••')
const base = ref('https://api.anthropic.com')
const model = ref('claude-sonnet-4.5')
const temp = ref(0.3)
const prompt = ref(
  'You are a meeting-notes assistant. Summarize the transcript into a concise TL;DR, key points, decisions, and action items with owners. Be specific and never invent details.',
)
const models = [
  'claude-sonnet-4.5',
  'claude-opus-4.1',
  'claude-haiku-4.5',
  'gpt-4o (compat)',
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
        <div class="flex gap-2">
          <div class="flex-1">
            <MaskedKey v-model="k" placeholder="sk-ant-..." />
          </div>
          <button class="btn btn-sm h-10">Test</button>
        </div>
        <div
          class="mt-1.5 flex items-center gap-1.5 text-[12px] text-green-600"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-green-500" /> Connection
          verified · 4 models available
        </div>
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
