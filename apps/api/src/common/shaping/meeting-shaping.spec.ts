import {
  shapeMeeting,
  shapeParticipant,
  shapeTranscript,
  shapeSummary,
} from './meeting-shaping'

const baseMeeting = {
  id: 'm1',
  title: 'Q2 Roadmap Review',
  description: 'Review progress',
  platform: 'zoom' as const,
  status: 'done' as const,
  startAt: new Date('2026-06-15T10:00:00.000Z'),
  endAt: new Date('2026-06-15T11:00:00.000Z'),
  joinUrl: 'zoom.us/j/1',
  recordingEnabled: true,
  organizerId: 'u1',
}

const organizer = {
  id: 'p1',
  meetingId: 'm1',
  userId: 'u1',
  name: 'Alex Rivera',
  email: 'alex@acme.com',
  title: 'Head of Product',
  isOrganizer: true,
  isExternal: false,
}
const guest = {
  id: 'p2',
  meetingId: 'm1',
  userId: null,
  name: 'Raj Mehta',
  email: 'raj@northwind.io',
  title: null,
  isOrganizer: false,
  isExternal: true,
}

describe('meeting-shaping', () => {
  it('shapes a participant', () => {
    expect(shapeParticipant(guest as never)).toMatchObject({
      id: 'p2',
      userId: null,
      name: 'Raj Mehta',
      initials: 'RM',
      isExternal: true,
      isOrganizer: false,
    })
  })

  it('shapes a meeting with ISO dates, duration, and organizer', () => {
    const shaped = shapeMeeting(baseMeeting as never, [organizer, guest] as never)
    expect(shaped).toMatchObject({
      id: 'm1',
      platform: 'zoom',
      status: 'done',
      start: '2026-06-15T10:00:00.000Z',
      end: '2026-06-15T11:00:00.000Z',
      durationMin: 60,
      recording: true,
    })
    expect(shaped.organizer.id).toBe('p1')
    expect(shaped.attendees).toHaveLength(2)
  })

  it('shapes transcript segments to { t, sp, text }', () => {
    const out = shapeTranscript([
      { startSec: 4, participantId: 'p1', text: 'Hi', order: 0 },
      { startSec: 22, participantId: 'p2', text: 'Hello', order: 1 },
    ] as never)
    expect(out).toEqual([
      { t: 4, sp: 'p1', text: 'Hi' },
      { t: 22, sp: 'p2', text: 'Hello' },
    ])
  })

  it('flattens summary content', () => {
    const out = shapeSummary({
      tldr: 'short',
      content: {
        keyPoints: ['a'],
        actionItems: [{ who: 'me', text: 'do it', due: 'Friday' }],
        decisions: ['d'],
        topics: [{ label: 'Intro', t: 4 }],
      },
    } as never)
    expect(out).toEqual({
      tldr: 'short',
      keyPoints: ['a'],
      actionItems: [{ who: 'me', text: 'do it', due: 'Friday' }],
      decisions: ['d'],
      topics: [{ label: 'Intro', t: 4 }],
    })
  })
})
