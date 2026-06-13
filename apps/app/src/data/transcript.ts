import type { TranscriptLine } from '@/lib/types'

// transcript for the featured meeting (Customer Discovery — Northwind).
export const TRANSCRIPT: TranscriptLine[] = [
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
