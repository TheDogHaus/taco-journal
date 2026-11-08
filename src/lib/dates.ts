const dayFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const dayYearFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const fullFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
const monthFmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const shortMonthFmt = new Intl.DateTimeFormat(undefined, { month: 'short' })

const pad = (n: number) => String(n).padStart(2, '0')

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** "Today", "Yesterday", "3 days ago", then "Oct 12" (with year if not this year). */
export function relativeDay(iso: string): string {
  const date = new Date(iso)
  const days = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.getFullYear() === new Date().getFullYear() ? dayFmt.format(date) : dayYearFmt.format(date)
}

export const formatFullDate = (iso: string) => fullFmt.format(new Date(iso))
export const monthLabel = (iso: string) => monthFmt.format(new Date(iso))
export const shortMonth = (d: Date) => shortMonthFmt.format(d)

export function monthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

/** yyyy-mm-dd in local time, for <input type="date"> */
export function toDateInput(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Converts the date input back to an ISO timestamp. Keeps the original time if
 * the day didn't change; uses "now" for today and noon for other days.
 */
export function isoFromDateInput(date: string, baseIso?: string): string {
  if (baseIso && toDateInput(baseIso) === date) return baseIso
  const now = new Date()
  if (toDateInput(now.toISOString()) === date) return now.toISOString()
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 12).toISOString()
}

export function daysAgoIso(n: number, hour = 13): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 15, 0, 0)
  return d.toISOString()
}
