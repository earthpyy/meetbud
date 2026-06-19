<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth'
import {
  fetchMe,
  updateProfile,
  updatePreferences,
  type AutoRecord,
  type ApiPreferences,
} from '@/lib/profileApi'
import Icon from '@/components/Icon.vue'
import Avatar from '@/components/Avatar.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import ProfileField from '@/components/profile/ProfileField.vue'
import ToggleRow from '@/components/profile/ToggleRow.vue'

const auth = useAuthStore()

const prefs = ref({ early: true, notify: true, slack: false, weekly: true })
const autoRecord = ref<AutoRecord>('organized')
const timezone = ref<string>('')

const PROMPT_PRESETS: Record<string, string> = {
  Default:
    'Summarize my meetings into a concise TL;DR, key points, decisions, and action items with owners. Be specific and never invent details.',
  Brief:
    'Give a 2–3 sentence overview and a short bullet list of action items only.',
  'Action items':
    'Extract only the action items, each with an owner and a due date.',
  'Decisions & risks':
    'Focus on decisions made and any risks, blockers or open questions raised, with owners for each follow-up.',
}
const customOn = ref(false)
const preset = ref('Default')
const prompt = ref(PROMPT_PRESETS['Default'])
const savedPrompt = ref(false)

// Account edit mode
const editing = ref(false)
const editName = ref('')
const editTitle = ref('')
const editTz = ref('')
const savingProfile = ref(false)

const autoRecordOptions: [AutoRecord, string][] = [
  ['all', 'All meetings'],
  ['organized', 'Only mine'],
  ['off', 'Off'],
]
const connectable: [string, string, string][] = [
  ['Microsoft Outlook', 'building', '#0A66C2'],
  ['Apple iCal', 'calendar', '#94a3b8'],
]

onMounted(async () => {
  try {
    const me = await fetchMe()
    const p = me.preferences
    prefs.value = {
      early: p.joinEarly,
      notify: p.notifyOnSummary,
      slack: p.slackSummaries,
      weekly: p.weeklyDigest,
    }
    autoRecord.value = p.autoRecord
    timezone.value = me.timezone ?? ''
    customOn.value = p.customPromptEnabled
    if (p.customPrompt) {
      prompt.value = p.customPrompt
      preset.value = 'Custom'
    }
  } catch (err) {
    console.error(err)
  }
})

function pickPreset(p: string) {
  preset.value = p
  prompt.value = PROMPT_PRESETS[p]
}
async function savePrompt() {
  try {
    await updatePreferences({
      customPromptEnabled: customOn.value,
      customPrompt: prompt.value,
    })
    savedPrompt.value = true
    setTimeout(() => (savedPrompt.value = false), 2200)
  } catch (err) {
    console.error(err)
  }
}
async function setCustomOn(v: boolean) {
  customOn.value = v
  await updatePreferences({ customPromptEnabled: v })
}
async function setAutoRecord(v: AutoRecord) {
  autoRecord.value = v
  await updatePreferences({ autoRecord: v })
}
async function set(k: keyof typeof prefs.value, v: boolean) {
  prefs.value = { ...prefs.value, [k]: v }
  const patch: Partial<ApiPreferences> = {}
  if (k === 'early') patch.joinEarly = v
  else if (k === 'notify') patch.notifyOnSummary = v
  else if (k === 'slack') patch.slackSummaries = v
  else if (k === 'weekly') patch.weeklyDigest = v
  await updatePreferences(patch)
}
function onPromptInput(v: string) {
  prompt.value = v
  preset.value = 'Custom'
}

function startEdit() {
  editName.value = auth.user?.name ?? ''
  editTitle.value = auth.user?.title ?? ''
  editTz.value = timezone.value
  editing.value = true
}
function cancelEdit() {
  editing.value = false
}
async function saveProfile() {
  savingProfile.value = true
  try {
    const updated = await updateProfile({
      name: editName.value,
      title: editTitle.value,
      timezone: editTz.value,
    })
    timezone.value = updated.timezone ?? ''
    auth.applyProfileUpdate({ name: updated.name, title: updated.title })
    editing.value = false
  } finally {
    savingProfile.value = false
  }
}
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="max-w-[820px] mx-auto px-6 py-6 space-y-6">
      <!-- header -->
      <div
        v-if="auth.user"
        class="bg-base-100 border border-base-content/10 rounded-2xl p-5 flex items-center gap-4"
      >
        <Avatar :person="auth.user" :size="64" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-extrabold tracking-tight truncate">
              {{ auth.user.name }}
            </h2>
            <span
              class="badge badge-sm gap-1 border-0"
              :style="{
                background:
                  'color-mix(in oklab, var(--accent) 14%, transparent)',
                color: 'var(--accent)',
              }"
            >
              <Icon v-if="auth.role === 'admin'" name="shield" :size="11" />{{
                auth.role === 'admin' ? 'Administrator' : 'Member'
              }}
            </span>
          </div>
          <p class="text-base-content/55 text-[14px]">{{ auth.user.email }}</p>
        </div>
      </div>

      <!-- account -->
      <ProfileCard v-if="auth.user" title="Account">
        <template #action>
          <button
            v-if="!editing"
            class="btn btn-sm gap-1.5"
            @click="startEdit"
          >
            <Icon name="edit" :size="15" /> Edit
          </button>
          <div v-else class="flex items-center gap-2">
            <button class="btn btn-ghost btn-sm" @click="cancelEdit">
              Cancel
            </button>
            <button
              class="btn btn-sm text-white border-0"
              :style="{ background: 'var(--accent)' }"
              :disabled="savingProfile"
              @click="saveProfile"
            >
              Save
            </button>
          </div>
        </template>
        <div v-if="!editing" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField label="Full name" :value="auth.user.name" />
          <ProfileField label="Email" :value="auth.user.email" />
          <ProfileField label="Role / title" :value="auth.user.title ?? ''" />
          <ProfileField label="Timezone" :value="timezone || '—'" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-[12px] font-semibold text-base-content/55"
              >Full name</label
            >
            <input
              v-model="editName"
              class="mt-1 w-full h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors"
            />
          </div>
          <div>
            <label class="text-[12px] font-semibold text-base-content/55"
              >Email</label
            >
            <div
              class="mt-1 h-10 px-3.5 flex items-center rounded-xl bg-base-200/40 border border-base-content/10 text-[14px] text-base-content/50"
            >
              {{ auth.user.email }}
            </div>
          </div>
          <div>
            <label class="text-[12px] font-semibold text-base-content/55"
              >Role / title</label
            >
            <input
              v-model="editTitle"
              class="mt-1 w-full h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors"
            />
          </div>
          <div>
            <label class="text-[12px] font-semibold text-base-content/55"
              >Timezone</label
            >
            <input
              v-model="editTz"
              placeholder="America/Los_Angeles"
              class="mt-1 w-full h-10 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[14px] outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors"
            />
          </div>
        </div>
      </ProfileCard>

      <!-- calendar connection -->
      <ProfileCard
        v-if="auth.user"
        title="Calendar connection"
        desc="meetbud reads your calendar to auto-detect and join meetings."
      >
        <div
          class="rounded-xl border-2 p-4"
          :style="{
            borderColor: 'color-mix(in oklab, var(--accent) 35%, transparent)',
            background: 'color-mix(in oklab, var(--accent) 5%, transparent)',
          }"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-11 h-11 rounded-xl bg-base-100 border border-base-content/10 flex items-center justify-center shrink-0"
            >
              <Icon
                name="calendar-days"
                :size="22"
                :style="{ color: '#4285F4' }"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-[14.5px]">Google Calendar</span>
                <span
                  class="inline-flex items-center gap-1 text-[11.5px] font-semibold text-green-600"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
              </div>
              <div class="text-[12.5px] text-base-content/55">
                {{ auth.user?.email }} · synced 2 min ago · 3 calendars
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-xs btn-ghost gap-1 text-base-content/60">
                <Icon name="refresh" :size="13" /> Sync now
              </button>
              <button class="btn btn-xs btn-ghost text-error">
                Disconnect
              </button>
            </div>
          </div>
        </div>
        <div class="mt-3 space-y-2">
          <div
            v-for="[name, icon, color] in connectable"
            :key="name"
            class="flex items-center gap-3.5 rounded-xl border border-base-content/10 p-3"
          >
            <div
              class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center shrink-0"
            >
              <Icon :name="icon" :size="19" :style="{ color }" />
            </div>
            <span
              class="flex-1 font-medium text-[13.5px] text-base-content/70"
              >{{ name }}</span
            >
            <button class="btn btn-xs btn-outline gap-1">
              <Icon name="plus" :size="13" /> Connect
            </button>
          </div>
        </div>
      </ProfileCard>

      <!-- recording prefs -->
      <ProfileCard
        title="Recording preferences"
        desc="Defaults applied to meetings on your calendar."
      >
        <div class="mb-3">
          <label class="text-[12px] font-semibold text-base-content/55"
            >Auto-record</label
          >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
            <button
              v-for="[v, label] in autoRecordOptions"
              :key="v"
              :class="
                cn(
                  'h-10 rounded-xl border text-[13px] font-medium transition-colors',
                  autoRecord === v
                    ? 'text-white border-transparent'
                    : 'border-base-content/12 text-base-content/65 hover:bg-base-content/5',
                )
              "
              :style="
                autoRecord === v ? { background: 'var(--accent)' } : undefined
              "
              @click="setAutoRecord(v)"
            >
              {{ label }}
            </button>
          </div>
        </div>
        <div class="divide-y divide-base-content/8">
          <ToggleRow
            title="Join 1 minute early"
            desc="The notetaker joins just before the meeting starts."
            :on="prefs.early"
            @change="set('early', $event)"
          />
          <ToggleRow
            title="Notify me when a summary is ready"
            :on="prefs.notify"
            @change="set('notify', $event)"
          />
        </div>
      </ProfileCard>

      <!-- summary preferences -->
      <ProfileCard
        title="Summary preferences"
        desc="Personalize how meetbud's AI writes up your meetings."
      >
        <ToggleRow
          title="Use my own summary prompt"
          desc="Override the workspace default for meetings you organize."
          :on="customOn"
          @change="setCustomOn($event)"
        />
        <div v-if="customOn" class="mt-3 pt-3 border-t border-base-content/8">
          <label class="text-[12px] font-semibold text-base-content/55"
            >Quick presets</label
          >
          <div class="flex flex-wrap gap-2 mt-1.5">
            <button
              v-for="p in Object.keys(PROMPT_PRESETS)"
              :key="p"
              :class="
                cn(
                  'px-3 h-8 rounded-lg text-[12.5px] font-medium border transition-colors',
                  preset === p
                    ? 'text-white border-transparent'
                    : 'border-base-content/12 text-base-content/65 hover:bg-base-content/5',
                )
              "
              :style="
                preset === p ? { background: 'var(--accent)' } : undefined
              "
              @click="pickPreset(p)"
            >
              {{ p }}
            </button>
          </div>
          <label
            class="text-[12px] font-semibold text-base-content/55 mt-4 block"
            >Your summary prompt</label
          >
          <textarea
            :value="prompt"
            rows="5"
            class="mt-1.5 w-full p-3.5 rounded-xl bg-base-200/60 border border-base-content/10 text-[13.5px] leading-relaxed outline-none focus:border-[color:var(--accent)] focus:bg-base-100 transition-colors resize-none"
            @input="onPromptInput(($event.target as HTMLTextAreaElement).value)"
          />
          <div class="flex items-center justify-between gap-3 mt-3">
            <span
              class="text-[12px] text-base-content/45 flex items-center gap-1.5"
              ><Icon name="sparkles" :size="13" /> Applied to new recordings you
              own.</span
            >
            <div class="flex items-center gap-2">
              <span
                v-if="savedPrompt"
                class="text-[12.5px] text-green-600 flex items-center gap-1.5"
                ><Icon name="check-circle" :size="15" /> Saved</span
              >
              <button
                class="btn btn-sm text-white border-0"
                :style="{ background: 'var(--accent)' }"
                @click="savePrompt"
              >
                Save prompt
              </button>
            </div>
          </div>
        </div>
        <div
          v-else
          class="mt-2 flex items-start gap-2 text-[12.5px] text-base-content/55 rounded-xl bg-base-200/50 p-3"
        >
          <Icon name="info" :size="15" class="mt-0.5 shrink-0" />
          <span
            >Your meetings use the workspace default summary prompt configured
            by your admin.</span
          >
        </div>
      </ProfileCard>

      <!-- notifications -->
      <ProfileCard title="Notifications">
        <div class="divide-y divide-base-content/8">
          <ToggleRow
            title="Weekly digest email"
            desc="A recap of your meetings every Monday."
            :on="prefs.weekly"
            @change="set('weekly', $event)"
          />
          <ToggleRow
            title="Post summaries to Slack"
            desc="Connect Slack to share notes automatically."
            :on="prefs.slack"
            @change="set('slack', $event)"
          />
        </div>
      </ProfileCard>
    </div>
  </div>
</template>
