/** Returns the Monday 00:00:00 of the week containing `date`. */
export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sun, 1 = Mon, …
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Returns the Sunday 23:59:59.999 of the week containing `date`. */
export function endOfWeekSunday(date: Date): Date {
  const d = startOfWeekMonday(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

/** "Feb 17 – Feb 23" */
export function formatWeekRangeLabel(weekStart: Date, weekEnd: Date): string {
  const fmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const start = weekStart.toLocaleDateString("en-US", fmt)
  const end = weekEnd.toLocaleDateString("en-US", fmt)
  return `${start} – ${end}`
}

/** Add (or subtract) a number of calendar days to a date. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** True when two dates fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Clamps `date` to [dayStart, dayEnd]. */
export function clampToDay(date: Date, dayStart: Date, dayEnd: Date): Date {
  if (date < dayStart) return dayStart
  if (date > dayEnd) return dayEnd
  return date
}

// ---------------------------------------------------------------------------
// Grid / booking helpers
// ---------------------------------------------------------------------------

/**
 * Minutes from `a` to `b`.
 * Positive when `b` is after `a`, negative when before.
 */
export function diffMinutes(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60_000)
}

/**
 * Minutes elapsed since the given day-start hour:minute on the same
 * calendar day as `date`.
 * e.g. minutesSinceDayStart(new Date("2026-02-20T09:30"), 8, 0) → 90
 */
export function minutesSinceDayStart(
  date: Date,
  dayStartHour: number,
  dayStartMinute = 0,
): number {
  return (
    date.getHours() * 60 +
    date.getMinutes() -
    (dayStartHour * 60 + dayStartMinute)
  )
}

/** Format a Date as "HH:mm" (24-hour clock). */
export function formatTime(date: Date): string {
  const hh = date.getHours().toString().padStart(2, "0")
  const mm = date.getMinutes().toString().padStart(2, "0")
  return `${hh}:${mm}`
}

/**
 * Snap `value` to the nearest multiple of `step`.
 * e.g. snapMinutes(23, 15) → 30
 */
export function snapMinutes(value: number, step: number): number {
  return Math.round(value / step) * step
}
