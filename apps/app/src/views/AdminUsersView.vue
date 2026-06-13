<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/lib/cn'
import type { AdminUser } from '@/lib/types'
import { ADMIN_USERS } from '@/data/adminUsers'
import { useUiStore } from '@/stores/ui'
import Icon from '@/components/Icon.vue'
import Avatar from '@/components/Avatar.vue'
import RoleBadge from '@/components/admin/RoleBadge.vue'
import InviteModal from '@/components/admin/InviteModal.vue'

const ui = useUiStore()

const users = ref<AdminUser[]>(ADMIN_USERS.map((u) => ({ ...u })))
const q = ref('')
const filter = ref('all')
const inviteOpen = ref(false)
const toast = ref<string | null>(null)

const filters: [string, string][] = [
  ['all', 'All'],
  ['admins', 'Admins'],
  ['members', 'Members'],
  ['invited', 'Invited'],
]

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 2600)
}
function invite(email: string, role: 'admin' | 'member') {
  const initials = email[0].toUpperCase()
  users.value = [
    {
      id: 'inv-' + Date.now(),
      name: email,
      email,
      role,
      status: 'invited',
      initials,
      color: '#94a3b8',
      last: 'Invited just now',
      meetings: 0,
    },
    ...users.value,
  ]
  inviteOpen.value = false
  flash(`Invite sent to ${email}`)
}
function setRole(id: string, role: 'admin' | 'member') {
  users.value = users.value.map((x) => (x.id === id ? { ...x, role } : x))
  blur()
}
function remove(id: string) {
  users.value = users.value.filter((x) => x.id !== id)
  blur()
}
function resend(email: string) {
  flash(`Invite re-sent to ${email}`)
  blur()
}
function blur() {
  if (document.activeElement instanceof HTMLElement)
    document.activeElement.blur()
}

function matches(u: AdminUser) {
  if (
    q.value &&
    !(
      u.name.toLowerCase().includes(q.value.toLowerCase()) ||
      u.email.toLowerCase().includes(q.value.toLowerCase())
    )
  )
    return false
  if (filter.value === 'admins') return u.role === 'admin'
  if (filter.value === 'members')
    return u.role === 'member' && u.status === 'active'
  if (filter.value === 'invited') return u.status === 'invited'
  return true
}
const list = computed(() => users.value.filter(matches))
const active = computed(
  () => users.value.filter((u) => u.status === 'active').length,
)
const pending = computed(
  () => users.value.filter((u) => u.status === 'invited').length,
)
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="max-w-[1100px] mx-auto px-6 py-6">
      <!-- header -->
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex items-center gap-2 text-[13.5px]">
          <span class="font-semibold">{{ active }} active</span>
          <span class="text-base-content/30">·</span>
          <span class="text-base-content/55">{{ pending }} pending</span>
        </div>
        <div class="flex-1" />
        <label
          class="flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-base-100 border border-base-content/10 focus-within:border-[color:var(--accent)] transition-colors w-full sm:w-64"
        >
          <Icon name="search" :size="16" class="text-base-content/40" />
          <input
            v-model="q"
            placeholder="Search members…"
            class="bg-transparent outline-none text-[14px] w-full placeholder:text-base-content/40"
          />
        </label>
        <button
          class="btn btn-sm gap-1.5 text-white border-0 shadow-sm"
          :style="{ background: 'var(--accent)' }"
          @click="inviteOpen = true"
        >
          <Icon name="plus" :size="16" /> Invite user
        </button>
      </div>

      <!-- filter tabs -->
      <div class="flex items-center gap-1.5 mb-4">
        <button
          v-for="[v, label] in filters"
          :key="v"
          :class="
            cn(
              'px-3 h-8 rounded-lg text-[13px] font-medium transition-colors',
              filter === v
                ? 'text-white'
                : 'bg-base-100 border border-base-content/10 text-base-content/60 hover:text-base-content',
            )
          "
          :style="filter === v ? { background: 'var(--accent)' } : undefined"
          @click="filter = v"
        >
          {{ label }}
        </button>
      </div>

      <!-- table -->
      <div
        class="bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden"
      >
        <table class="w-full">
          <thead>
            <tr
              class="text-left text-[11.5px] font-semibold uppercase tracking-wide text-base-content/45 border-b border-base-content/10"
            >
              <th class="font-semibold pl-5 py-3">Member</th>
              <th class="font-semibold hidden md:table-cell">Role</th>
              <th class="font-semibold hidden lg:table-cell">Meetings</th>
              <th class="font-semibold hidden sm:table-cell">Last active</th>
              <th class="pr-5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in list"
              :key="u.id"
              class="border-b border-base-content/5 last:border-0 hover:bg-base-content/[0.02] transition-colors"
            >
              <td :class="cn('pl-5', ui.dense ? 'py-2.5' : 'py-3.5')">
                <div class="flex items-center gap-3">
                  <Avatar :person="u" :size="38" />
                  <div class="min-w-0">
                    <div
                      class="font-semibold text-[14px] truncate flex items-center gap-2"
                    >
                      <span
                        v-if="u.status === 'invited'"
                        class="text-base-content/60"
                        >{{ u.email }}</span
                      >
                      <template v-else>{{ u.name }}</template>
                      <span
                        v-if="u.status === 'invited'"
                        class="badge badge-xs badge-warning border-0"
                        >Pending</span
                      >
                    </div>
                    <div
                      v-if="u.status !== 'invited'"
                      class="text-[12px] text-base-content/45 truncate"
                    >
                      {{ u.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="hidden md:table-cell">
                <div class="dropdown">
                  <div
                    tabindex="0"
                    role="button"
                    class="cursor-pointer inline-flex items-center gap-1"
                  >
                    <RoleBadge :role="u.role" /><Icon
                      name="chevron-down"
                      :size="13"
                      class="text-base-content/30"
                    />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu menu-sm bg-base-100 rounded-xl shadow-xl border border-base-content/10 mt-1 w-40 z-50"
                  >
                    <li>
                      <a @click="setRole(u.id, 'admin')"
                        ><Icon name="shield" :size="14" /> Make admin</a
                      >
                    </li>
                    <li>
                      <a @click="setRole(u.id, 'member')"
                        ><Icon name="user" :size="14" /> Make member</a
                      >
                    </li>
                  </ul>
                </div>
              </td>
              <td class="hidden lg:table-cell text-[13px] text-base-content/60">
                {{ u.status === 'invited' ? '—' : u.meetings }}
              </td>
              <td
                class="hidden sm:table-cell text-[12.5px] text-base-content/50"
              >
                {{ u.last }}
              </td>
              <td class="pr-5 text-right">
                <div class="dropdown dropdown-end">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn btn-ghost btn-xs btn-square text-base-content/50"
                  >
                    <Icon name="more-vertical" :size="17" />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu menu-sm bg-base-100 rounded-xl shadow-xl border border-base-content/10 mt-1 w-44 z-50"
                  >
                    <li v-if="u.status === 'invited'">
                      <a @click="resend(u.email)"
                        ><Icon name="refresh" :size="14" /> Resend invite</a
                      >
                    </li>
                    <li>
                      <a><Icon name="mail" :size="14" /> Email member</a>
                    </li>
                    <li>
                      <a class="text-error" @click="remove(u.id)"
                        ><Icon name="trash" :size="14" />
                        {{
                          u.status === 'invited' ? 'Revoke invite' : 'Remove'
                        }}</a
                      >
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <InviteModal
      v-if="inviteOpen"
      @close="inviteOpen = false"
      @invite="invite"
    />
    <div
      v-if="toast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-base-content text-base-100 shadow-xl text-[13.5px] font-medium"
    >
      <Icon
        name="check-circle"
        :size="17"
        :style="{ color: 'var(--accent)' }"
      />
      {{ toast }}
    </div>
  </div>
</template>
