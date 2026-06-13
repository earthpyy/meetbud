import type { MeetingStatus, PlatformKey } from './types'

// ── meeting status meta ──
export interface StatusMeta {
  label: string
  dot: string
  badge: string
  text: string
  pulse?: boolean
  spin?: boolean
}

export const STATUS: Record<MeetingStatus, StatusMeta> = {
  upcoming: {
    label: 'Upcoming',
    dot: '#94a3b8',
    badge: 'badge-ghost',
    text: 'text-base-content/60',
  },
  ongoing: {
    label: 'Live',
    dot: '#ef4444',
    badge: 'badge-error',
    text: 'text-error',
    pulse: true,
  },
  transcribing: {
    label: 'Transcribing',
    dot: '#f59e0b',
    badge: 'badge-warning',
    text: 'text-warning',
    spin: true,
  },
  summarizing: {
    label: 'Summarizing',
    dot: '#3b82f6',
    badge: 'badge-info',
    text: 'text-info',
    spin: true,
  },
  done: {
    label: 'Done',
    dot: '#22c55e',
    badge: 'badge-success',
    text: 'text-success',
  },
}

// ── meeting platform meta ──
export interface PlatformMeta {
  label: string
  short: string
  color: string
  initial: string
}

export const PLATFORMS: Record<PlatformKey, PlatformMeta> = {
  meet: { label: 'Google Meet', short: 'Meet', color: '#00897b', initial: 'M' },
  zoom: { label: 'Zoom', short: 'Zoom', color: '#2563eb', initial: 'Z' },
  teams: {
    label: 'Microsoft Teams',
    short: 'Teams',
    color: '#5b5fc7',
    initial: 'T',
  },
}
