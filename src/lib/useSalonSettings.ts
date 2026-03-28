"use client"

import { useMemo } from "react"
import { useSalon } from "@/lib/useSalon"

const DEFAULT_CURRENCY = "GEL"
const DEFAULT_DATE_FORMAT = "DD/MM/YYYY"

/** Pad a number to 2 digits. */
function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

/**
 * Format a Date according to the given format string.
 * Supported tokens: DD, MM, YYYY.
 * Anything else (separators, weekday, etc.) is left as-is.
 */
export function applyDateFormat(date: Date, format: string): string {
  const dd = pad(date.getDate())
  const mm = pad(date.getMonth() + 1)
  const yyyy = date.getFullYear().toString()
  return format.replace("DD", dd).replace("MM", mm).replace("YYYY", yyyy)
}

/**
 * Hook that exposes salon-level settings with sensible defaults.
 *
 * Returns:
 * - `currency` — e.g. "GEL", "EUR"
 * - `dateFormat` — e.g. "DD/MM/YYYY"
 * - `formatDate(date)` — formats a Date using the salon's preferred format
 * - `loading` — true while salon data is still loading
 */
export function useSalonSettings() {
  const { salon, loading } = useSalon()

  const currency   = salon?.settings?.currency   ?? DEFAULT_CURRENCY
  const dateFormat = salon?.settings?.dateFormat ?? DEFAULT_DATE_FORMAT

  const formatDate = useMemo(
    () => (date: Date) => applyDateFormat(date, dateFormat),
    [dateFormat],
  )

  return { currency, dateFormat, formatDate, loading } as const
}
