import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppShell.vue'),
    children: [
      { path: '', redirect: { name: 'calendar' } },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@/views/CalendarView.vue'),
        meta: {
          title: 'Calendar',
          sub: 'Your meetings across day, week and month',
        },
      },
      {
        path: 'notes',
        name: 'notes',
        component: () => import('@/views/NotesView.vue'),
        meta: {
          title: 'Notes',
          sub: 'Recorded meetings, transcripts & summaries',
        },
      },
      {
        path: 'notes/:id',
        name: 'meeting',
        component: () => import('@/views/MeetingDetailView.vue'),
        meta: { sub: 'Notes', back: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: {
          title: 'Profile & settings',
          sub: 'Manage your account and connections',
        },
      },
      {
        path: 'admin/analytics',
        name: 'analytics',
        component: () => import('@/views/AnalyticsView.vue'),
        meta: {
          title: 'Analytics',
          sub: 'Workspace recording & usage insights',
          admin: true,
        },
      },
      {
        path: 'admin/users',
        name: 'users',
        component: () => import('@/views/AdminUsersView.vue'),
        meta: {
          title: 'Users',
          sub: 'Manage workspace members and invites',
          admin: true,
        },
      },
      {
        path: 'admin/settings',
        name: 'settings',
        component: () => import('@/views/AdminSettingsView.vue'),
        meta: {
          title: 'Admin settings',
          sub: 'Workspace-wide configuration',
          admin: true,
        },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'calendar' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.signedIn) return { name: 'login' }
  if (to.meta.public && auth.signedIn) return { name: 'calendar' }
  if (to.meta.admin && auth.role !== 'admin') return { name: 'notes' }
})
