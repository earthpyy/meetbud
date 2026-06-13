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
