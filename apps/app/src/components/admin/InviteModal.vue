<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { cn } from '@/lib/cn'
import Icon from '@/components/Icon.vue'

const emit = defineEmits<{
  close: []
  invite: [email: string, role: 'admin' | 'member']
}>()

const email = ref('')
const role = ref<'admin' | 'member'>('member')
const shown = ref(false)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => {
  shown.value = true
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const valid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

const roleOptions: ['member' | 'admin', string, string][] = [
  ['member', 'Member', 'Can record & view their meetings'],
  ['admin', 'Admin', 'Full access incl. settings'],
]

function submit() {
  if (valid.value) emit('invite', email.value, role.value)
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
          <Icon name="mail" :size="20" />
        </div>
        <button class="btn btn-ghost btn-sm btn-square" @click="emit('close')">
          <Icon name="x" :size="18" />
        </button>
      </div>
      <h2 class="text-lg font-extrabold tracking-tight mt-3">
        Invite a teammate
      </h2>
      <p class="text-base-content/55 text-[13.5px] mt-1">
        They'll get an email with a one-time login link. No password required.
      </p>

      <div class="mt-5">
        <label class="text-[12.5px] font-semibold text-base-content/65"
          >Email address</label
        >
        <label
          class="mt-1.5 flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-base-200/60 border border-base-content/10 focus-within:border-[color:var(--accent)] focus-within:bg-base-100 transition-colors"
        >
          <Icon name="mail" :size="17" class="text-base-content/40" />
          <input
            v-model="email"
            placeholder="teammate@acme.com"
            class="bg-transparent outline-none text-[14.5px] w-full placeholder:text-base-content/35"
            @keydown.enter="submit"
          />
        </label>
      </div>
      <div class="mt-4">
        <label class="text-[12.5px] font-semibold text-base-content/65"
          >Role</label
        >
        <div class="grid grid-cols-2 gap-2 mt-1.5">
          <button
            v-for="[v, label, d] in roleOptions"
            :key="v"
            :class="
              cn(
                'text-left rounded-xl border p-3 transition-colors',
                role === v
                  ? 'border-transparent'
                  : 'border-base-content/12 hover:bg-base-content/5',
              )
            "
            :style="
              role === v
                ? {
                    background:
                      'color-mix(in oklab, var(--accent) 8%, transparent)',
                    boxShadow: 'inset 0 0 0 1.5px var(--accent)',
                  }
                : {}
            "
            @click="role = v"
          >
            <div class="flex items-center gap-1.5 font-semibold text-[13.5px]">
              <Icon
                v-if="v === 'admin'"
                name="shield"
                :size="13"
                :style="{ color: 'var(--accent)' }"
              />{{ label }}
            </div>
            <div class="text-[11.5px] text-base-content/50 mt-0.5 leading-snug">
              {{ d }}
            </div>
          </button>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button class="btn btn-ghost flex-1" @click="emit('close')">
          Cancel
        </button>
        <button
          :disabled="!valid"
          class="btn flex-1 text-white border-0 disabled:opacity-50"
          :style="{ background: 'var(--accent)' }"
          @click="submit"
        >
          <Icon name="send" :size="16" /> Send invite
        </button>
      </div>
    </div>
  </div>
</template>
