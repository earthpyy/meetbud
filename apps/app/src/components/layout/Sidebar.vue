<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import Icon from '@/components/Icon.vue'
import Avatar from '@/components/Avatar.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const rail = computed(() => ui.sidebar === 'rail')

interface NavDef {
  icon: string
  label: string
  to: string
  match: string[]
}

const workspaceItems: NavDef[] = [
  {
    icon: 'calendar-days',
    label: 'Calendar',
    to: 'calendar',
    match: ['calendar'],
  },
  { icon: 'notes', label: 'Notes', to: 'notes', match: ['notes', 'meeting'] },
]
const adminItems: NavDef[] = [
  { icon: 'users', label: 'Users', to: 'users', match: ['users'] },
  {
    icon: 'settings',
    label: 'Admin settings',
    to: 'settings',
    match: ['settings'],
  },
]

function isActive(match: string[]) {
  return match.includes(route.name as string)
}
function go(name: string) {
  router.push({ name })
}

function navItemClass(active: boolean) {
  return cn(
    'group relative w-full flex items-center rounded-xl transition-colors duration-150',
    rail.value ? 'justify-center h-11' : 'gap-3 px-3 h-10',
    active
      ? 'text-[color:var(--accent)] font-semibold'
      : 'text-base-content/65 hover:text-base-content hover:bg-base-content/5 font-medium',
  )
}
</script>

<template>
  <aside
    :class="
      cn(
        'h-full shrink-0 bg-base-100 border-r border-base-content/10 flex flex-col transition-[width] duration-200',
        rail ? 'w-[76px]' : 'w-[252px]',
      )
    "
  >
    <!-- header -->
    <div
      :class="
        cn(
          'flex items-center',
          rail ? 'justify-center py-4' : 'justify-between px-4 py-4',
        )
      "
    >
      <div class="flex items-center gap-2.5 px-1 select-none">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden"
          :style="{ background: 'var(--accent)' }"
        >
          <span
            class="absolute inset-0 opacity-25"
            :style="{
              background:
                'radial-gradient(circle at 30% 20%, #fff, transparent 55%)',
            }"
          />
          <Icon name="record" :size="20" class="text-white relative" />
        </div>
        <div v-if="!rail" class="leading-none">
          <div class="font-extrabold text-[19px] tracking-tight">meetbud</div>
          <div
            class="text-[10.5px] font-medium text-base-content/45 tracking-wide mt-0.5"
          >
            MEETING INTELLIGENCE
          </div>
        </div>
      </div>
      <button
        v-if="!rail"
        class="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content"
        title="Collapse"
        @click="ui.setSidebar('rail')"
      >
        <Icon name="chevrons-left" :size="18" />
      </button>
    </div>

    <!-- nav -->
    <nav class="flex-1 flex flex-col gap-1 px-3">
      <div
        v-if="!rail"
        class="px-3 pt-3 pb-1.5 text-[10.5px] font-bold tracking-wider text-base-content/35"
      >
        WORKSPACE
      </div>
      <button
        v-for="item in workspaceItems"
        :key="item.to"
        :title="rail ? item.label : undefined"
        :class="navItemClass(isActive(item.match))"
        :style="
          isActive(item.match)
            ? {
                background:
                  'color-mix(in oklab, var(--accent) 12%, transparent)',
              }
            : undefined
        "
        @click="go(item.to)"
      >
        <span
          v-if="isActive(item.match)"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
          :style="{ background: 'var(--accent)' }"
        />
        <Icon
          :name="item.icon"
          :size="20"
          :stroke="isActive(item.match) ? 2.2 : 2"
        />
        <span v-if="!rail" class="text-[14px] whitespace-nowrap">{{
          item.label
        }}</span>
      </button>

      <template v-if="auth.role === 'admin'">
        <div
          v-if="!rail"
          class="px-3 pt-5 pb-1.5 text-[10.5px] font-bold tracking-wider text-base-content/35"
        >
          ADMIN
        </div>
        <div v-else class="my-2 mx-auto w-7 border-t border-base-content/10" />
        <button
          v-for="item in adminItems"
          :key="item.to"
          :title="rail ? item.label : undefined"
          :class="navItemClass(isActive(item.match))"
          :style="
            isActive(item.match)
              ? {
                  background:
                    'color-mix(in oklab, var(--accent) 12%, transparent)',
                }
              : undefined
          "
          @click="go(item.to)"
        >
          <span
            v-if="isActive(item.match)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
            :style="{ background: 'var(--accent)' }"
          />
          <Icon
            :name="item.icon"
            :size="20"
            :stroke="isActive(item.match) ? 2.2 : 2"
          />
          <span v-if="!rail" class="text-[14px] whitespace-nowrap">{{
            item.label
          }}</span>
        </button>
      </template>
    </nav>

    <!-- expand button (rail) -->
    <div v-if="rail" class="px-3 pb-2 flex justify-center">
      <button
        class="btn btn-ghost btn-sm btn-square text-base-content/40"
        title="Expand"
        @click="ui.setSidebar('expanded')"
      >
        <Icon name="chevron-right" :size="18" />
      </button>
    </div>

    <!-- footer user -->
    <div :class="cn('border-t border-base-content/10', rail ? 'p-2' : 'p-3')">
      <button
        :class="
          cn(
            'w-full flex items-center rounded-xl hover:bg-base-content/5 transition-colors',
            rail ? 'justify-center p-1.5' : 'gap-3 p-2',
            route.name === 'profile' && 'bg-base-content/5',
          )
        "
        @click="go('profile')"
      >
        <Avatar :person="auth.user" :size="rail ? 36 : 38" />
        <div v-if="!rail" class="min-w-0 text-left flex-1">
          <div class="text-[13.5px] font-semibold truncate">
            {{ auth.user.name }}
          </div>
          <div
            class="text-[11.5px] text-base-content/50 truncate flex items-center gap-1"
          >
            <Icon v-if="auth.role === 'admin'" name="shield" :size="12" />
            {{ auth.role === 'admin' ? 'Administrator' : 'Member' }}
          </div>
        </div>
        <Icon
          v-if="!rail"
          name="chevron-right"
          :size="16"
          class="text-base-content/30"
        />
      </button>
    </div>
  </aside>
</template>
