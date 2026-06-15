export interface Person {
  id: string
  name: string
  email: string
  initials: string
  color: string
  title?: string
}

export type MeetingStatus =
  | 'upcoming'
  | 'ongoing'
  | 'transcribing'
  | 'summarizing'
  | 'done'

export type PlatformKey = 'meet' | 'zoom' | 'teams'

export interface RawMeeting {
  id: string
  title: string
  platform: PlatformKey
  d: number
  s: [number, number]
  e: [number, number]
  organizer: string
  attendees: string[]
  recording: boolean
  status: MeetingStatus
  desc: string
  featured?: boolean
}

export interface Meeting extends RawMeeting {
  start: Date
  end: Date
  organizerP: Person
  attendeesP: Person[]
  duration: number
  link: string
}

export interface TranscriptLine {
  t: number
  sp: string
  text: string
}

export interface ActionItem {
  who: string
  text: string
  due: string
}

export interface Summary {
  tldr: string
  keyPoints: string[]
  actionItems: ActionItem[]
  decisions: string[]
  topics: { label: string; t: number }[]
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  status: 'active' | 'invited'
  initials: string
  color: string
  last: string
  meetings: number
}

export interface ApiPerson {
  id: string
  userId?: string | null
  name: string
  email: string | null
  title: string | null
  initials: string
  color: string
  isExternal?: boolean
  isOrganizer?: boolean
}

export interface ApiMeeting {
  id: string
  title: string
  description: string | null
  platform: PlatformKey
  status: MeetingStatus
  start: string
  end: string
  durationMin: number
  joinUrl: string | null
  recording: boolean
  organizer: ApiPerson
  attendees: ApiPerson[]
}

export interface ApiMeetingDetail extends ApiMeeting {
  hasTranscript: boolean
  hasSummary: boolean
  media: { status: string; durationSec: number | null; audioUrl: string | null; videoUrl: string | null } | null
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
