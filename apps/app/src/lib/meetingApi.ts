import { apiGet, apiPost, apiPatch, apiDelete } from './api'
import type {
  ApiMeeting,
  ApiMeetingDetail,
  ApiPerson,
  Meeting,
  Person,
  Summary,
  TranscriptLine,
} from './types'

function toPerson(p: ApiPerson): Person {
  return {
    id: p.id,
    name: p.name,
    email: p.email ?? '',
    initials: p.initials,
    color: p.color,
    title: p.title ?? undefined,
  }
}

export function toMeeting(dto: ApiMeeting): Meeting {
  const start = new Date(dto.start)
  const end = new Date(dto.end)
  return {
    id: dto.id,
    title: dto.title,
    platform: dto.platform,
    d: 0,
    s: [start.getHours(), start.getMinutes()],
    e: [end.getHours(), end.getMinutes()],
    organizer: dto.organizer.id,
    attendees: dto.attendees.map((a) => a.id),
    recording: dto.recording,
    status: dto.status,
    desc: dto.description ?? '',
    start,
    end,
    organizerP: toPerson(dto.organizer),
    attendeesP: dto.attendees.map(toPerson),
    duration: dto.durationMin,
    link: dto.joinUrl ?? '',
  }
}

export const fetchMeetings = (qs = '') =>
  apiGet<ApiMeeting[]>(`/meetings${qs}`).then((list) => list.map(toMeeting))
export const fetchMeeting = (id: string) => apiGet<ApiMeetingDetail>(`/meetings/${id}`)
export const fetchTranscript = (id: string) =>
  apiGet<TranscriptLine[]>(`/meetings/${id}/transcript`)
export const fetchSummary = (id: string) => apiGet<Summary>(`/meetings/${id}/summary`)
export const createMeeting = (joinUrl: string, title: string) =>
  apiPost<ApiMeetingDetail>('/meetings', { joinUrl, title })
export const setRecording = (id: string, recordingEnabled: boolean) =>
  apiPatch<ApiMeetingDetail>(`/meetings/${id}/recording`, { recordingEnabled })
export const deleteMeeting = (id: string) => apiDelete<{ ok: boolean }>(`/meetings/${id}`)
