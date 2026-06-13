import type { Meeting, RawMeeting } from '@/lib/types'
import { durationMin } from '@/lib/format'
import { PEOPLE } from './people'

export const TODAY = new Date()

function mkDate(offsetDays: number, h: number, m: number): Date {
  const d = new Date(TODAY)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  d.setHours(h, m, 0, 0)
  return d
}

const RAW_MEETINGS: RawMeeting[] = [
  {
    id: 'm-roadmap',
    title: 'Q2 Roadmap Review',
    platform: 'zoom',
    d: -7,
    s: [10, 0],
    e: [11, 0],
    organizer: 'me',
    attendees: ['me', 'marcus', 'priya', 'sofia'],
    recording: true,
    status: 'done',
    desc: 'Review progress against Q2 objectives and re-prioritise the backlog.',
  },
  {
    id: 'm-critique',
    title: 'Design Critique — Mobile',
    platform: 'meet',
    d: -5,
    s: [14, 0],
    e: [15, 0],
    organizer: 'priya',
    attendees: ['priya', 'me', 'daniel'],
    recording: true,
    status: 'done',
    desc: 'Walkthrough of the new mobile navigation patterns.',
  },
  {
    id: 'm-northwind',
    title: 'Customer Discovery — Northwind',
    platform: 'meet',
    d: -3,
    s: [9, 30],
    e: [10, 12],
    organizer: 'emma',
    attendees: ['emma', 'me', 'raj', 'helen'],
    recording: true,
    status: 'done',
    featured: true,
    desc: 'Discovery call with Northwind to understand their data pipeline pain points ahead of the pilot.',
  },
  {
    id: 'm-11priya',
    title: '1:1 — Alex & Priya',
    platform: 'meet',
    d: -2,
    s: [16, 0],
    e: [16, 30],
    organizer: 'me',
    attendees: ['me', 'priya'],
    recording: false,
    status: 'done',
    desc: 'Weekly 1:1.',
  },
  {
    id: 'm-pricing',
    title: 'Pricing Workshop',
    platform: 'zoom',
    d: -1,
    s: [13, 0],
    e: [14, 30],
    organizer: 'sofia',
    attendees: ['sofia', 'me', 'emma', 'nina'],
    recording: true,
    status: 'summarizing',
    desc: 'Define packaging and pricing tiers for the self-serve launch.',
  },
  {
    id: 'm-standup',
    title: 'Engineering Standup',
    platform: 'meet',
    d: 0,
    s: [9, 30],
    e: [9, 45],
    organizer: 'marcus',
    attendees: ['marcus', 'daniel', 'nina', 'me'],
    recording: true,
    status: 'done',
    desc: 'Daily async-friendly standup.',
  },
  {
    id: 'm-sync',
    title: 'Weekly Team Sync',
    platform: 'meet',
    d: 0,
    s: [11, 0],
    e: [12, 0],
    organizer: 'me',
    attendees: ['me', 'priya', 'marcus', 'sofia', 'daniel', 'nina'],
    recording: true,
    status: 'ongoing',
    desc: 'Cross-functional weekly sync — product, design, eng.',
  },
  {
    id: 'm-pipeline',
    title: 'Sales Pipeline Review',
    platform: 'zoom',
    d: 0,
    s: [13, 30],
    e: [14, 15],
    organizer: 'emma',
    attendees: ['emma', 'tom', 'me'],
    recording: true,
    status: 'transcribing',
    desc: 'Review of open opportunities and forecast for the quarter.',
  },
  {
    id: 'm-onboard',
    title: 'Design Review — Onboarding',
    platform: 'meet',
    d: 0,
    s: [15, 30],
    e: [16, 30],
    organizer: 'priya',
    attendees: ['priya', 'me', 'daniel', 'sofia'],
    recording: true,
    status: 'upcoming',
    desc: 'Review the redesigned first-run onboarding flow.',
  },
  {
    id: 'm-mktg',
    title: 'Marketing Planning',
    platform: 'teams',
    d: 1,
    s: [10, 0],
    e: [11, 0],
    organizer: 'sofia',
    attendees: ['sofia', 'me', 'emma'],
    recording: true,
    status: 'upcoming',
    desc: 'Plan the launch campaign and content calendar.',
  },
  {
    id: 'm-interview',
    title: 'Interview — Backend Engineer',
    platform: 'meet',
    d: 1,
    s: [14, 0],
    e: [15, 0],
    organizer: 'marcus',
    attendees: ['marcus', 'daniel'],
    recording: false,
    status: 'upcoming',
    desc: 'Final-round system design interview.',
  },
  {
    id: 'm-board',
    title: 'Board Prep',
    platform: 'zoom',
    d: 2,
    s: [11, 0],
    e: [12, 30],
    organizer: 'me',
    attendees: ['me', 'sofia', 'marcus'],
    recording: true,
    status: 'upcoming',
    desc: 'Prepare the deck and narrative for the upcoming board meeting.',
  },
  {
    id: 'm-allhands',
    title: 'Company All-Hands',
    platform: 'meet',
    d: 3,
    s: [16, 0],
    e: [17, 0],
    organizer: 'me',
    attendees: [
      'me',
      'priya',
      'marcus',
      'sofia',
      'daniel',
      'nina',
      'emma',
      'tom',
    ],
    recording: true,
    status: 'upcoming',
    desc: 'Monthly all-hands. Metrics, roadmap, Q&A.',
  },
  {
    id: 'm-11marcus',
    title: '1:1 — Alex & Marcus',
    platform: 'meet',
    d: 4,
    s: [10, 30],
    e: [11, 0],
    organizer: 'me',
    attendees: ['me', 'marcus'],
    recording: false,
    status: 'upcoming',
    desc: 'Weekly 1:1.',
  },
]

export const MEETINGS: Meeting[] = RAW_MEETINGS.map((m) => {
  const start = mkDate(m.d, m.s[0], m.s[1])
  const end = mkDate(m.d, m.e[0], m.e[1])
  return {
    ...m,
    start,
    end,
    organizerP: PEOPLE[m.organizer],
    attendeesP: m.attendees.map((a) => PEOPLE[a]),
    duration: durationMin(start, end),
    link:
      m.platform === 'zoom'
        ? 'zoom.us/j/' + (1000000000 + Math.floor(Math.random() * 1e8))
        : m.platform === 'teams'
          ? 'teams.microsoft.com/l/meetup-join/...'
          : 'meet.google.com/' +
            ['abc-defg-hij', 'qpr-stuv-wxy', 'kmn-opqr-stu'][
              Math.floor(Math.random() * 3)
            ],
  }
})

export function byId(id: string): Meeting | undefined {
  return MEETINGS.find((m) => m.id === id)
}
