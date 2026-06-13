// date / time formatting helpers (ported from core.jsx).

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
export const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
export const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function fmtTime(d: Date): string {
  let h = d.getHours()
  const m = d.getMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return m === 0 ? `${h} ${ap}` : `${h}:${pad2(m)} ${ap}`
}

export function fmtTimeRange(a: Date, b: Date): string {
  return `${fmtTime(a)} – ${fmtTime(b)}`
}

export function fmtHour(h: number): string {
  const ap = h >= 12 ? 'PM' : 'AM'
  let hh = h % 12
  if (hh === 0) hh = 12
  return `${hh} ${ap}`
}

export function fmtDateLong(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_ABBR[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function fmtDateMed(d: Date): string {
  return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function startOfWeek(d: Date): Date {
  // Sunday start
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - x.getDay())
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function durationMin(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60000)
}

export function fmtDuration(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function fmtClock(sec: number): string {
  // seconds → m:ss
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${pad2(s)}`
}

export function relativeDay(d: Date, now: Date): string {
  const t0 = new Date(now)
  t0.setHours(0, 0, 0, 0)
  const d0 = new Date(d)
  d0.setHours(0, 0, 0, 0)
  const diff = Math.round((d0.getTime() - t0.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff < 7) return DAY_NAMES[d.getDay()]
  if (diff < -1 && diff > -7) return `Last ${DAY_NAMES[d.getDay()]}`
  return fmtDateMed(d)
}
