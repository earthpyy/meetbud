import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'
export type SidebarMode = 'expanded' | 'rail'
export type NotesLayout = 'table' | 'cards'
export type CalView = 'day' | 'week' | 'month' | 'list'

export const useUiStore = defineStore(
  'ui',
  () => {
    const theme = ref<Theme>('light')
    const sidebar = ref<SidebarMode>('expanded')
    const notesLayout = ref<NotesLayout>('table')
    const calView = ref<CalView>('week')

    // Density is hardcoded to "comfortable" in this build (Tweaks panel dropped).
    const dense = false

    function applyTheme() {
      document.documentElement.setAttribute('data-theme', theme.value)
    }
    function setTheme(t: Theme) {
      theme.value = t
      applyTheme()
    }
    function toggleTheme() {
      setTheme(theme.value === 'dark' ? 'light' : 'dark')
    }
    function setSidebar(s: SidebarMode) {
      sidebar.value = s
    }
    function setNotesLayout(l: NotesLayout) {
      notesLayout.value = l
    }
    function setCalView(v: CalView) {
      calView.value = v
    }

    return {
      theme,
      sidebar,
      notesLayout,
      calView,
      dense,
      applyTheme,
      setTheme,
      toggleTheme,
      setSidebar,
      setNotesLayout,
      setCalView,
    }
  },
  { persist: { pick: ['theme', 'sidebar', 'notesLayout', 'calView'] } },
)
