import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiPost, apiGet, configureApi } from '@/lib/api'
import { router } from '@/router'

export type Role = 'admin' | 'member'

export interface ApiUser {
  id: string
  name: string
  email: string
  title: string | null
  role: Role
  initials: string
  color: string
}

interface AuthResult {
  accessToken: string
  refreshToken: string
  user: ApiUser
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const user = ref<ApiUser | null>(null)
    // Local-only role override for the prototype's role-switch demo (does not hit the server).
    const roleOverride = ref<Role | null>(null)

    const signedIn = computed(() => !!accessToken.value)
    const role = computed<Role>(() => roleOverride.value ?? user.value?.role ?? 'member')

    function setSession(res: AuthResult) {
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken
      user.value = res.user
      roleOverride.value = null
    }
    function clear() {
      accessToken.value = null
      refreshToken.value = null
      user.value = null
      roleOverride.value = null
    }

    async function requestCode(email: string) {
      await apiPost('/auth/request-code', { email }, { auth: false })
    }
    async function verify(email: string, code: string) {
      const res = await apiPost<AuthResult>('/auth/verify', { email, code }, { auth: false })
      setSession(res)
    }
    async function refreshProfile() {
      if (!signedIn.value) return
      user.value = await apiGet<ApiUser>('/me')
    }
    function applyProfileUpdate(p: { name: string; title: string | null }) {
      if (user.value) {
        user.value = { ...user.value, name: p.name, title: p.title }
      }
    }
    async function signOut() {
      try {
        await apiPost('/auth/logout')
      } catch {
        // ignore network/401 — clearing locally is enough
      }
      clear()
    }
    function setRole(r: Role) {
      roleOverride.value = r
    }

    configureApi({
      getAccessToken: () => accessToken.value,
      getRefreshToken: () => refreshToken.value,
      onRefreshed: (a, r) => {
        accessToken.value = a
        refreshToken.value = r
      },
      onAuthFailure: () => {
        clear()
        router.push({ name: 'login' })
      },
    })

    return {
      accessToken,
      refreshToken,
      user,
      signedIn,
      role,
      requestCode,
      verify,
      refreshProfile,
      applyProfileUpdate,
      signOut,
      setRole,
    }
  },
  { persist: { pick: ['accessToken', 'refreshToken', 'user'] } },
)
