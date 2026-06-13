import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ME } from '@/data/people'

export type Role = 'admin' | 'member'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const signedIn = ref(false)
    const role = ref<Role>('admin')

    const user = computed(() => ({ ...ME, role: role.value }))

    function signIn() {
      signedIn.value = true
    }
    function signOut() {
      signedIn.value = false
    }
    function setRole(r: Role) {
      role.value = r
    }

    return { signedIn, role, user, signIn, signOut, setRole }
  },
  { persist: true },
)
