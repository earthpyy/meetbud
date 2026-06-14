<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/Icon.vue'

const auth = useAuthStore()
const router = useRouter()

type Step = 'email' | 'code'
const step = ref<Step>('email')
const email = ref('')
const code = ref<string[]>(['', '', '', '', '', ''])
const sending = ref(false)
const verifying = ref(false)
const resendIn = ref(0)
const inputs = ref<(HTMLInputElement | null)[]>([])

const emailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
const codeFull = () => code.value.every((c) => c !== '')

let resendTimer: ReturnType<typeof setTimeout> | undefined
watch(resendIn, (v) => {
  clearTimeout(resendTimer)
  if (v <= 0) return
  resendTimer = setTimeout(() => (resendIn.value = v - 1), 1000)
})
onBeforeUnmount(() => clearTimeout(resendTimer))

const error = ref('')

async function sendCode() {
  if (!emailValid()) return
  sending.value = true
  error.value = ''
  try {
    await auth.requestCode(email.value)
    step.value = 'code'
    resendIn.value = 30
    nextTick(() => inputs.value[0]?.focus())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to send code'
  } finally {
    sending.value = false
  }
}

async function verify() {
  if (!codeFull()) return
  verifying.value = true
  error.value = ''
  try {
    await auth.verify(email.value, code.value.join(''))
    router.push({ name: 'calendar' })
  } catch {
    error.value = 'Invalid or expired code'
  } finally {
    verifying.value = false
  }
}

function onCodeChange(i: number, v: string) {
  const digits = v.replace(/\D/g, '')
  if (!digits) {
    const n = [...code.value]
    n[i] = ''
    code.value = n
    return
  }
  if (digits.length > 1) {
    // paste
    const n = [...code.value]
    for (let k = 0; k < 6; k++) n[k] = digits[k] || ''
    code.value = n
    inputs.value[Math.min(5, digits.length - 1)]?.focus()
    return
  }
  const n = [...code.value]
  n[i] = digits
  code.value = n
  if (i < 5) inputs.value[i + 1]?.focus()
}

function onCodeKey(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !code.value[i] && i > 0)
    inputs.value[i - 1]?.focus()
  if (e.key === 'Enter' && codeFull()) verify()
}

async function resend() {
  error.value = ''
  try {
    await auth.requestCode(email.value)
    resendIn.value = 30
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to resend code'
  }
}
</script>

<template>
  <div class="h-screen flex bg-base-100 text-base-content overflow-hidden">
    <!-- brand panel -->
    <div
      class="hidden lg:flex w-[46%] relative flex-col justify-between p-12 text-white overflow-hidden"
      :style="{
        background:
          'linear-gradient(160deg, color-mix(in oklab, var(--accent) 92%, black) 0%, var(--accent) 55%, color-mix(in oklab, var(--accent) 80%, white) 100%)',
      }"
    >
      <div
        class="absolute inset-0 opacity-[0.12]"
        :style="{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }"
      />
      <div class="relative flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center"
        >
          <Icon name="record" :size="22" class="text-white" />
        </div>
        <span class="text-2xl font-extrabold tracking-tight">meetbud</span>
      </div>
      <div class="relative">
        <h2
          class="text-[34px] leading-[1.15] font-extrabold tracking-tight max-w-md"
        >
          Every meeting, recorded, transcribed and summarized.
        </h2>
        <p class="text-white/80 mt-4 max-w-sm text-[15px] leading-relaxed">
          meetbud joins your calls, captures the recording, and hands you an AI
          summary with action items — self-hosted, on your terms.
        </p>
        <div class="flex flex-wrap gap-2 mt-7">
          <span
            v-for="f in [
              'Auto-join meetings',
              'AI summaries',
              'Searchable transcripts',
            ]"
            :key="f"
            class="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-[12.5px] font-medium"
            >{{ f }}</span
          >
        </div>
      </div>
      <div class="relative text-white/60 text-[12.5px]">
        Self-hosted · SOC 2 ready · Your data stays yours
      </div>
    </div>

    <!-- form panel -->
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-[380px]">
        <div class="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center"
            :style="{ background: 'var(--accent)' }"
          >
            <Icon name="record" :size="20" class="text-white" />
          </div>
          <span class="text-xl font-extrabold tracking-tight">meetbud</span>
        </div>

        <div v-if="step === 'email'">
          <h1 class="text-[26px] font-extrabold tracking-tight">Sign in</h1>
          <p class="text-base-content/55 mt-1.5 text-[14px]">
            Enter your work email and we'll send you a one-time code. No
            password needed.
          </p>
          <div class="mt-7">
            <label class="text-[13px] font-semibold text-base-content/70"
              >Work email</label
            >
            <label
              class="mt-1.5 flex items-center gap-2.5 h-12 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 focus-within:border-[color:var(--accent)] focus-within:bg-base-100 transition-colors"
            >
              <Icon name="mail" :size="18" class="text-base-content/40" />
              <input
                v-model="email"
                type="email"
                placeholder="you@company.com"
                class="bg-transparent outline-none text-[15px] w-full placeholder:text-base-content/35"
                @keydown.enter="sendCode"
              />
            </label>
          </div>
          <button
            :disabled="!emailValid() || sending"
            class="btn w-full mt-5 text-white border-0 h-12 text-[15px] shadow-sm disabled:opacity-50"
            :style="{ background: 'var(--accent)' }"
            @click="sendCode"
          >
            <span v-if="sending" class="loading loading-spinner loading-sm" />
            <template v-else
              >Send login code <Icon name="arrow-right" :size="18"
            /></template>
          </button>
          <p
            class="text-[12.5px] text-base-content/45 mt-5 text-center leading-relaxed"
          >
            Access is invite-only. Don't have an account?<br />Ask your
            workspace admin to invite you.
          </p>
          <p
            v-if="error"
            class="text-[12.5px] text-error mt-3 text-center"
          >
            {{ error }}
          </p>
        </div>

        <div v-else>
          <button
            class="text-[13px] text-base-content/55 hover:text-base-content flex items-center gap-1 mb-5"
            @click="step = 'email'; error = ''"
          >
            <Icon name="arrow-left" :size="15" /> Back
          </button>
          <h1 class="text-[26px] font-extrabold tracking-tight">
            Check your email
          </h1>
          <p class="text-base-content/55 mt-1.5 text-[14px]">
            We sent a 6-digit code to
            <span class="font-semibold text-base-content">{{ email }}</span>
          </p>
          <div class="flex gap-2 mt-7 justify-between">
            <input
              v-for="(c, i) in code"
              :key="i"
              :ref="(el) => (inputs[i] = el as HTMLInputElement)"
              :value="c"
              inputmode="numeric"
              :maxlength="6"
              class="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-base-200/60 border-2 border-base-content/10 focus:border-[color:var(--accent)] focus:bg-base-100 outline-none transition-colors"
              @input="
                onCodeChange(i, ($event.target as HTMLInputElement).value)
              "
              @keydown="onCodeKey(i, $event)"
            />
          </div>
          <button
            :disabled="!codeFull() || verifying"
            class="btn w-full mt-6 text-white border-0 h-12 text-[15px] shadow-sm disabled:opacity-50"
            :style="{ background: 'var(--accent)' }"
            @click="verify"
          >
            <span v-if="verifying" class="loading loading-spinner loading-sm" />
            <template v-else
              >Verify &amp; continue <Icon name="check" :size="18"
            /></template>
          </button>
          <div class="mt-5 text-center text-[13px] text-base-content/50">
            Didn't get it?
            <span v-if="resendIn > 0">Resend in {{ resendIn }}s</span>
            <button
              v-else
              class="font-semibold text-[color:var(--accent)]"
              @click="resend"
            >
              Resend code
            </button>
          </div>
          <div
            v-if="error"
            class="mt-4 text-center text-[12.5px] text-error"
          >
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
