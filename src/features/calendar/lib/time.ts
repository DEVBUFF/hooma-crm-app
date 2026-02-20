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
