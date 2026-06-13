<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/Icon.vue'
import DaisySelect from '@/components/DaisySelect.vue'
import SettingRow from './SettingRow.vue'
import MaskedKey from './MaskedKey.vue'

const inputCls =
  'w-full h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors'

const k = ref('rcl-•••••••••••••••••••••••')
const botName = ref('meetbud Notetaker')
const region = ref('us-east-1')
const retention = ref('90')
const autoLeave = ref(true)

const regions = [
  { value: 'us-east-1', label: 'US East (Virginia)' },
  { value: 'eu-west-1', label: 'EU West (Ireland)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
]
const retentions = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
  { value: '0', label: 'Forever' },
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
        <Icon name="record" :size="18" />
      </div>
      <div>
        <h3 class="font-bold text-[15.5px] tracking-tight">
          Recording &amp; transcription
        </h3>
        <p class="text-[12.5px] text-base-content/50">
          meetbud uses Recall.ai to send a bot into meetings.
        </p>
      </div>
    </div>
    <div class="mt-3">
      <SettingRow label="Recall.ai API key">
        <MaskedKey v-model="k" placeholder="rcl-..." />
      </SettingRow>
      <SettingRow
        label="Bot display name"
        hint="Shown to participants when the notetaker joins."
      >
        <input v-model="botName" :class="inputCls" />
      </SettingRow>
      <SettingRow
        label="Recording region"
        hint="Where recordings are processed & stored."
      >
        <DaisySelect
          :value="region"
          :options="regions"
          @change="region = $event"
        />
      </SettingRow>
      <SettingRow
        label="Retention period"
        hint="Recordings are deleted after this many days."
      >
        <DaisySelect
          :value="retention"
          :options="retentions"
          width-class="w-44"
          menu-width="w-44"
          @change="retention = $event"
        />
      </SettingRow>
      <SettingRow
        label="Auto-leave empty meetings"
        hint="Bot leaves if no participants join within 5 minutes."
      >
        <input
          v-model="autoLeave"
          type="checkbox"
          class="toggle toggle-sm"
          :style="
            autoLeave
              ? {
                  backgroundColor: 'var(--accent)',
                  borderColor: 'var(--accent)',
                }
              : {}
          "
        />
      </SettingRow>
    </div>
  </div>
</template>
