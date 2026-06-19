import {
  MeetingPlatform,
  MeetingStatus,
  PrismaClient,
  RecordingStatus,
  Role,
  UserStatus,
} from '@prisma/client'

const prisma = new PrismaClient()

// Default admin account. Login is passwordless (email OTP), so no password is stored.
// Override via env when seeding a different environment.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Admin'

const TEAM = [
  { key: 'alex', name: 'Alex Rivera', email: 'alex@acme.com', title: 'Head of Product' },
  { key: 'priya', name: 'Priya Nair', email: 'priya@acme.com', title: 'Design Lead' },
  { key: 'marcus', name: 'Marcus Lee', email: 'marcus@acme.com', title: 'Eng Manager' },
  { key: 'sofia', name: 'Sofia Garcia', email: 'sofia@acme.com', title: 'PMM' },
  { key: 'daniel', name: 'Daniel Kim', email: 'daniel@acme.com', title: 'Staff Engineer' },
  { key: 'emma', name: 'Emma Wilson', email: 'emma@acme.com', title: 'Account Exec' },
  { key: 'nina', name: 'Nina Patel', email: 'nina@acme.com', title: 'Data Analyst' },
]

const EXTERNAL: Record<string, { name: string; email: string; title: string }> = {
  raj: { name: 'Raj Mehta', email: 'raj@northwind.io', title: 'VP Engineering, Northwind' },
  helen: { name: 'Helen Ortiz', email: 'helen@northwind.io', title: 'CTO, Northwind' },
}

function at(offsetDays: number, h: number, m: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  d.setHours(h, m, 0, 0)
  return d
}

const SEED_MEETINGS = [
  {
    title: 'Customer Discovery — Northwind',
    platform: 'meet',
    status: 'done',
    s: [-3, 9, 30] as [number, number, number],
    e: [-3, 10, 12] as [number, number, number],
    organizer: 'emma',
    internal: ['emma'] as string[],
    external: ['raj', 'helen'] as string[],
    featured: true,
    desc: 'Discovery call with Northwind to understand their data pipeline pain points ahead of the pilot.',
  },
  {
    title: 'Q2 Roadmap Review',
    platform: 'zoom',
    status: 'done',
    s: [-7, 10, 0] as [number, number, number],
    e: [-7, 11, 0] as [number, number, number],
    organizer: 'alex',
    internal: ['alex', 'marcus', 'priya', 'sofia'] as string[],
    external: [] as string[],
    featured: false,
    desc: 'Review progress against Q2 objectives and re-prioritise the backlog.',
  },
  {
    title: 'Pricing Workshop',
    platform: 'zoom',
    status: 'summarizing',
    s: [-1, 13, 0] as [number, number, number],
    e: [-1, 14, 30] as [number, number, number],
    organizer: 'sofia',
    internal: ['sofia', 'emma', 'nina'] as string[],
    external: [] as string[],
    featured: false,
    desc: 'Define packaging and pricing tiers for the self-serve launch.',
  },
  {
    title: 'Sales Pipeline Review',
    platform: 'zoom',
    status: 'transcribing',
    s: [0, 13, 30] as [number, number, number],
    e: [0, 14, 15] as [number, number, number],
    organizer: 'emma',
    internal: ['emma'] as string[],
    external: [] as string[],
    featured: false,
    desc: 'Review of open opportunities and forecast for the quarter.',
  },
  {
    title: 'Weekly Team Sync',
    platform: 'meet',
    status: 'ongoing',
    s: [0, 11, 0] as [number, number, number],
    e: [0, 12, 0] as [number, number, number],
    organizer: 'alex',
    internal: ['alex', 'priya', 'marcus', 'sofia', 'daniel', 'nina'] as string[],
    external: [] as string[],
    featured: false,
    desc: 'Cross-functional weekly sync — product, design, eng.',
  },
  {
    title: 'Design Review — Onboarding',
    platform: 'meet',
    status: 'upcoming',
    s: [0, 15, 30] as [number, number, number],
    e: [0, 16, 30] as [number, number, number],
    organizer: 'priya',
    internal: ['priya', 'daniel', 'sofia'] as string[],
    external: [] as string[],
    featured: false,
    desc: 'Review the redesigned first-run onboarding flow.',
  },
  {
    title: 'Board Prep',
    platform: 'zoom',
    status: 'upcoming',
    s: [2, 11, 0] as [number, number, number],
    e: [2, 12, 30] as [number, number, number],
    organizer: 'alex',
    internal: ['alex', 'sofia', 'marcus'] as string[],
    external: [] as string[],
    featured: false,
    desc: 'Prepare the deck and narrative for the upcoming board meeting.',
  },
]

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, role: Role.admin, status: UserStatus.active },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: Role.admin,
      status: UserStatus.active,
    },
  })

  const team: Record<string, { id: string; name: string; email: string; title: string }> = {}
  for (const member of TEAM) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: { name: member.name, title: member.title },
      create: {
        email: member.email,
        name: member.name,
        title: member.title,
        role: Role.member,
        status: UserStatus.active,
      },
    })
    team[member.key] = { id: user.id, name: member.name, email: member.email, title: member.title }
  }

  // Idempotent re-seed: remove previously-seeded meetings for these organizers.
  await prisma.meeting.deleteMany({
    where: {
      organizer: {
        email: { in: [ADMIN_EMAIL, ...TEAM.map((t) => t.email)] },
      },
    },
  })

  let northwindId = ''
  for (const m of SEED_MEETINGS) {
    const org = team[m.organizer]
    const participantsData = [
      ...m.internal.map((k) => ({
        userId: team[k].id,
        name: team[k].name,
        email: team[k].email,
        title: team[k].title,
        isOrganizer: k === m.organizer,
        isExternal: false,
      })),
      ...m.external.map((k) => ({
        name: EXTERNAL[k].name,
        email: EXTERNAL[k].email,
        title: EXTERNAL[k].title,
        isOrganizer: false,
        isExternal: true,
      })),
    ]
    const startAt = at(m.s[0], m.s[1], m.s[2])
    const endAt = at(m.e[0], m.e[1], m.e[2])
    const created = await prisma.meeting.create({
      data: {
        title: m.title,
        description: m.desc,
        platform: m.platform as MeetingPlatform,
        status: m.status as MeetingStatus,
        startAt,
        endAt,
        organizerId: org.id,
        recordingEnabled: m.status !== 'upcoming',
        participants: { create: participantsData },
      },
      include: { participants: true },
    })
    if (m.featured) {
      northwindId = created.id
    } else if (m.status === 'done') {
      const durationSec = Math.round((endAt.getTime() - startAt.getTime()) / 1000)
      await prisma.recording.create({
        data: {
          meetingId: created.id,
          status: RecordingStatus.done,
          durationSec,
        },
      })
      await prisma.summary.create({
        data: {
          meetingId: created.id,
          tldr: `Auto-generated summary for ${m.title}.`,
          generatedAt: new Date(),
          inputTokens: 900 + durationSec,
          outputTokens: 300 + Math.round(durationSec / 3),
          content: {
            keyPoints: [],
            actionItems: [],
            decisions: [],
            topics: [],
          },
        },
      })
    }
  }

  await seedNorthwindNotes(northwindId)

  console.log(`Seeded admin ${admin.email}, ${TEAM.length} members, ${SEED_MEETINGS.length} meetings.`)
}

async function seedNorthwindNotes(meetingId: string) {
  if (!meetingId) return
  const participants = await prisma.participant.findMany({ where: { meetingId } })
  const byName = (substr: string) =>
    participants.find((p) => p.name.toLowerCase().includes(substr))?.id ?? null

  // Map the mock transcript's speaker keys to participant ids.
  // 'me' in the Northwind mock is the acme-side interviewer → map to Emma (the organizer).
  const speaker: Record<string, string | null> = {
    emma: byName('emma'),
    raj: byName('raj'),
    helen: byName('helen'),
    me: byName('emma'),
  }

  const LINES: { t: number; sp: string; text: string }[] = [
    {
      t: 4,
      sp: 'emma',
      text: 'Thanks everyone for hopping on. Raj, Helen — really appreciate the time. The goal today is just to understand how your data pipeline works today and where the friction is.',
    },
    {
      t: 22,
      sp: 'raj',
      text: 'Happy to. So right now we ingest event data from about a dozen sources into a warehouse, and the transformation layer is a mix of scheduled jobs and some hand-written scripts.',
    },
    {
      t: 41,
      sp: 'raj',
      text: "The honest answer is it's brittle. When a source schema changes upstream, things break silently and we don't find out until a dashboard looks wrong.",
    },
    {
      t: 63,
      sp: 'helen',
      text: "And that's the part that keeps me up at night. We've had two incidents this quarter where bad data reached a customer-facing report before anyone caught it.",
    },
    {
      t: 80,
      sp: 'me',
      text: "That's really useful context. When something breaks today, how long does it typically take the team to detect and then trace it back to the root cause?",
    },
    {
      t: 95,
      sp: 'helen',
      text: 'Detection is the killer. Sometimes hours, sometimes a couple of days. Tracing it once we know is maybe thirty minutes for someone who knows the system.',
    },
    {
      t: 118,
      sp: 'raj',
      text: "Right, and only two people really know the system end to end, which is its own risk. If either of them is out, we're slow to respond.",
    },
    {
      t: 134,
      sp: 'emma',
      text: "So if I'm hearing you correctly, the biggest pain isn't the volume of data — it's confidence. Knowing the data is correct, and being alerted fast when it isn't.",
    },
    {
      t: 150,
      sp: 'raj',
      text: "Exactly. Volume we can handle. It's trust and observability that we're missing.",
    },
    {
      t: 165,
      sp: 'me',
      text: 'Got it. On the alerting side — would you want anomalies routed to something like Slack, or do you live in PagerDuty for this kind of thing?',
    },
    {
      t: 182,
      sp: 'helen',
      text: "Slack for the soft signals, PagerDuty only for the truly urgent. We don't want to page someone at 3am because a row count drifted two percent.",
    },
    {
      t: 201,
      sp: 'me',
      text: 'Makes sense. Let me sketch out what a pilot could look like — connect three of your highest-risk sources, add schema-change detection and freshness checks, and route alerts to a dedicated Slack channel.',
    },
    {
      t: 224,
      sp: 'raj',
      text: 'That would already be a big step up. The three sources would be Stripe, the product event stream, and the Postgres replica.',
    },
    {
      t: 240,
      sp: 'emma',
      text: 'Perfect. And what does success look like for you four to six weeks in? How would you know the pilot was worth it?',
    },
    {
      t: 257,
      sp: 'helen',
      text: "If we catch at least one real issue before it hits a report, and detection time drops from hours to minutes — that's a clear win for us.",
    },
    {
      t: 276,
      sp: 'me',
      text: "That's a great, measurable bar. I'll put together a short pilot plan with that as the headline success metric and share it by end of week.",
    },
    {
      t: 294,
      sp: 'emma',
      text: "And I'll follow up with the security questionnaire and the order form so procurement can start in parallel.",
    },
    {
      t: 309,
      sp: 'raj',
      text: "Sounds good. Loop in our data platform lead, Dana, on the technical plan — she'll own the integration on our side.",
    },
    {
      t: 324,
      sp: 'emma',
      text: "Will do. Thank you both, this was incredibly helpful. We'll be in touch this week.",
    },
  ]

  await prisma.transcriptSegment.createMany({
    data: LINES.map((l, i) => ({
      meetingId,
      participantId: speaker[l.sp] ?? null,
      startSec: l.t,
      text: l.text,
      order: i,
    })),
  })

  await prisma.recording.create({
    data: {
      meetingId,
      status: RecordingStatus.done,
      durationSec: 342,
      audioUrl: null,
    },
  })

  await prisma.summary.create({
    data: {
      meetingId,
      tldr: "Northwind's core pain is data trust and observability, not volume. They've had two incidents this quarter where bad data reached customer-facing reports. We aligned on a 4–6 week pilot covering their three highest-risk sources with schema-change detection, freshness checks, and Slack/PagerDuty alerting. Success = catching one real issue pre-report and cutting detection time from hours to minutes.",
      generatedAt: new Date(),
      inputTokens: 1840,
      outputTokens: 620,
      content: {
        keyPoints: [
          'Current pipeline ingests ~12 sources into a warehouse; transformation is brittle and breaks silently on upstream schema changes.',
          'Detection is the biggest gap — issues can go unnoticed for hours or days; only two engineers understand the system end-to-end.',
          'The real need is confidence in data correctness and fast alerting, not handling more volume.',
          'Alerting should split by severity: soft signals to Slack, only truly urgent issues to PagerDuty.',
        ],
        actionItems: [
          {
            who: 'me',
            text: 'Draft a pilot plan covering Stripe, product event stream, and Postgres replica, with detection-time reduction as the headline metric.',
            due: 'By Friday',
          },
          {
            who: 'emma',
            text: 'Send the security questionnaire and order form so procurement can start in parallel.',
            due: 'This week',
          },
          {
            who: 'raj',
            text: "Introduce Dana (data platform lead) to own the integration on Northwind's side.",
            due: 'This week',
          },
        ],
        decisions: [
          'Pilot scope locked to three highest-risk sources rather than the full pipeline.',
          'Success criteria agreed: catch ≥1 real issue before it reaches a report, and reduce detection time from hours to minutes.',
        ],
        topics: [
          { label: 'Current pipeline & pain points', t: 22 },
          { label: 'Detection & root-cause time', t: 80 },
          { label: 'Alerting preferences', t: 165 },
          { label: 'Pilot scope', t: 201 },
          { label: 'Success criteria & next steps', t: 240 },
        ],
      },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
