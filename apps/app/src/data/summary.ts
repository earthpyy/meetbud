import type { Summary } from '@/lib/types'

export const SUMMARY: Summary = {
  tldr: "Northwind's core pain is data trust and observability, not volume. They've had two incidents this quarter where bad data reached customer-facing reports. We aligned on a 4–6 week pilot covering their three highest-risk sources with schema-change detection, freshness checks, and Slack/PagerDuty alerting. Success = catching one real issue pre-report and cutting detection time from hours to minutes.",
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
}

export const REC_DURATION = 342 // seconds (~5:42) — mock audio length
