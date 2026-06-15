import {
  Meeting,
  MeetingPlatform,
  MeetingStatus,
  Participant,
  RecordingStatus,
  Summary,
  TranscriptSegment,
} from '@prisma/client'
import { ShapedPerson, shapePerson } from './person-shaping'

export interface ShapedParticipant extends ShapedPerson {
  userId: string | null
  isExternal: boolean
  isOrganizer: boolean
}

export interface ShapedMeeting {
  id: string
  title: string
  description: string | null
  platform: MeetingPlatform
  status: MeetingStatus
  start: string
  end: string
  durationMin: number
  joinUrl: string | null
  recording: boolean
  organizer: ShapedParticipant
  attendees: ShapedParticipant[]
}

export interface PaginatedMeetings {
  items: ShapedMeeting[]
  total: number
  page: number
  pageSize: number
}

export interface ShapedMedia {
  status: RecordingStatus
  durationSec: number | null
  audioUrl: string | null
  videoUrl: string | null
}

export interface ShapedMeetingDetail extends ShapedMeeting {
  hasTranscript: boolean
  hasSummary: boolean
  media: ShapedMedia | null
}

export function shapeParticipant(p: Participant): ShapedParticipant {
  return {
    ...shapePerson(p),
    userId: p.userId,
    isExternal: p.isExternal,
    isOrganizer: p.isOrganizer,
  }
}

export function shapeMeeting(
  meeting: Meeting,
  participants: Participant[],
): ShapedMeeting {
  const attendees = participants.map(shapeParticipant)
  const organizer =
    attendees.find((a) => a.isOrganizer) ??
    attendees.find((a) => a.userId === meeting.organizerId) ??
    attendees[0]
  return {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    platform: meeting.platform,
    status: meeting.status,
    start: meeting.startAt.toISOString(),
    end: meeting.endAt.toISOString(),
    durationMin: Math.round(
      (meeting.endAt.getTime() - meeting.startAt.getTime()) / 60000,
    ),
    joinUrl: meeting.joinUrl,
    recording: meeting.recordingEnabled,
    organizer,
    attendees,
  }
}

export function shapeTranscript(
  segments: Pick<TranscriptSegment, 'startSec' | 'participantId' | 'text'>[],
): { t: number; sp: string | null; text: string }[] {
  return segments.map((s) => ({ t: s.startSec, sp: s.participantId, text: s.text }))
}

export function shapeSummary(summary: Summary) {
  const content = (summary.content ?? {}) as {
    keyPoints?: unknown
    actionItems?: unknown
    decisions?: unknown
    topics?: unknown
  }
  return {
    tldr: summary.tldr,
    keyPoints: content.keyPoints ?? [],
    actionItems: content.actionItems ?? [],
    decisions: content.decisions ?? [],
    topics: content.topics ?? [],
  }
}

export function shapeMeetingDetail(
  meeting: Meeting,
  participants: Participant[],
  extra: {
    recording: {
      status: RecordingStatus
      durationSec: number | null
      audioUrl: string | null
      videoUrl: string | null
    } | null
    hasSummary: boolean
    hasTranscript: boolean
  },
): ShapedMeetingDetail {
  return {
    ...shapeMeeting(meeting, participants),
    hasTranscript: extra.hasTranscript,
    hasSummary: extra.hasSummary,
    media: extra.recording
      ? {
          status: extra.recording.status,
          durationSec: extra.recording.durationSec,
          audioUrl: extra.recording.audioUrl,
          videoUrl: extra.recording.videoUrl,
        }
      : null,
  }
}
