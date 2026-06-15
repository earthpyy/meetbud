<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cn } from '@/lib/cn'
import { useMeetingsStore } from '@/stores/meetings'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/stores/auth'
import { createMeeting } from '@/lib/meetingApi'
import Icon from '@/components/Icon.vue'
import Avatar from '@/components/Avatar.vue'
import ThemeToggle from './ThemeToggle.vue'
import Notifications from './Notifications.vue'
import NewRecordingModal from './NewRecordingModal.vue'

const route = useRoute()
const router = useRouter()
const meetingsStore = useMeetingsStore()
const auth = useAuthStore()

const heading = computed(() => {
  if (route.name === 'meeting') {
    const m = meetingsStore.byId(route.params.id as string)
    return { title: m ? m.title : 'Meeting', sub: 'Notes', back: true }
  }
  return {
    title: (route.meta.title as string) ?? 'meetbud',
    sub: (route.meta.sub as string) ?? '',
    back: Boolean(route.meta.back),
  }
})

const recOpen = ref(false)
const toast = ref<string | null>(null)

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}
async function onSubmit(link: string, title: string) {
  try {
    const created = await createMeeting(link, title)
    recOpen.value = false
    flash(`meetbud is joining “${title}” to record…`)
    meetingsStore.invalidateCalendar()
    await meetingsStore.loadNotesPage(1)
    router.push({ name: 'meeting', params: { id: created.id } })
  } catch (e) {
    flash(e instanceof Error ? e.message : 'Failed to start recording')
  }
}
function go(name: string) {
  router.push({ name })
  if (document.activeElement instanceof HTMLElement)
    document.activeElement.blur()
}
function setRole(r: Role) {
  auth.setRole(r)
}
async function signOut() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <header
    class="h-16 shrink-0 bg-base-100/80 backdrop-blur border-b border-base-content/10 flex items-center gap-3 px-5 z-40"
  >
    <div class="min-w-0 flex items-center gap-3">
      <button
        v-if="heading.back"
        class="btn btn-ghost btn-sm btn-square"
        title="Back to notes"
        @click="router.push({ name: 'notes' })"
      >
        <Icon name="arrow-left" :size="18" />
      </button>
      <div class="min-w-0">
        <h1 class="text-[17px] font-bold tracking-tight leading-tight truncate">
          {{ heading.title }}
        </h1>
        <p
          v-if="heading.sub"
          class="text-[12px] text-base-content/50 leading-tight truncate"
        >
          {{ heading.sub }}
        </p>
      </div>
    </div>

    <div class="flex-1" />

    <!-- search -->
    <label
      class="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-base-200/70 border border-base-content/10 focus-within:border-[color:var(--accent)] transition-colors w-64"
    >
      <Icon name="search" :size="16" class="text-base-content/40" />
      <input
        type="text"
        placeholder="Search meetings…"
        class="bg-transparent outline-none text-[13px] w-full placeholder:text-base-content/40"
      />
      <kbd class="kbd kbd-xs text-base-content/40">⌘K</kbd>
    </label>

    <button
      class="btn btn-sm gap-1.5 text-white border-0 shadow-sm"
      :style="{ background: 'var(--accent)' }"
      @click="recOpen = true"
    >
      <Icon name="plus" :size="16" />
      <span class="hidden lg:inline whitespace-nowrap">New recording</span>
    </button>

    <ThemeToggle />
    <Notifications />

    <!-- user menu -->
    <div v-if="auth.user" class="dropdown dropdown-end">
      <div
        tabindex="0"
        role="button"
        class="flex items-center gap-2 pl-1 pr-1 h-9 rounded-xl hover:bg-base-content/5 cursor-pointer"
      >
        <Avatar :person="auth.user" :size="32" />
        <Icon
          name="chevron-down"
          :size="14"
          class="text-base-content/40 hidden sm:block"
        />
      </div>
      <ul
        tabindex="0"
        class="dropdown-content z-[60] mt-2 w-64 menu p-2 bg-base-100 rounded-2xl shadow-xl border border-base-content/10"
      >
        <li class="menu-title px-3 pt-2 pb-3">
          <div class="flex items-center gap-3 normal-case">
            <Avatar :person="auth.user" :size="40" />
            <div class="min-w-0">
              <div class="text-[14px] font-semibold text-base-content truncate">
                {{ auth.user.name }}
              </div>
              <div
                class="text-[12px] text-base-content/50 truncate font-normal"
              >
                {{ auth.user.email }}
              </div>
            </div>
          </div>
        </li>
        <li>
          <a @click="go('profile')"
            ><Icon name="user" :size="17" /> Profile &amp; settings</a
          >
        </li>
        <li>
          <a @click="go('profile')"
            ><Icon name="link" :size="17" /> Calendar connection</a
          >
        </li>
        <li v-if="auth.role === 'admin'">
          <a @click="go('settings')"
            ><Icon name="settings" :size="17" /> Admin settings</a
          >
        </li>
        <div class="my-1 border-t border-base-content/10" />
        <!-- demo role switcher -->
        <li class="menu-title px-3 pt-2 pb-1 text-[10.5px] tracking-wider">
          PREVIEW AS
        </li>
        <li class="px-2 pb-1">
          <div class="join w-full">
            <button
              :class="
                cn(
                  'btn btn-xs join-item flex-1',
                  auth.role === 'admin' && 'btn-active',
                )
              "
              @click="setRole('admin')"
            >
              Admin
            </button>
            <button
              :class="
                cn(
                  'btn btn-xs join-item flex-1',
                  auth.role === 'member' && 'btn-active',
                )
              "
              @click="setRole('member')"
            >
              Member
            </button>
          </div>
        </li>
        <div class="my-1 border-t border-base-content/10" />
        <li>
          <a class="text-error" @click="signOut"
            ><Icon name="logout" :size="17" /> Sign out</a
          >
        </li>
      </ul>
    </div>
  </header>

  <NewRecordingModal
    v-if="recOpen"
    @close="recOpen = false"
    @submit="onSubmit"
  />
  <div
    v-if="toast"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-base-content text-base-100 shadow-xl text-[13.5px] font-medium"
  >
    <span
      class="loading loading-spinner loading-xs"
      :style="{ color: 'var(--accent)' }"
    />
    {{ toast }}
  </div>
</template>
