"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { t } from "@/lib/tokens"
import { StaffHeaderRow } from "@/features/calendar/components/StaffHeaderRow"
import { StaffDayColumn } from "@/features/calendar/components/StaffDayColumn"
import { TimeGutter } from "@/features/calendar/components/TimeGutter"
import type { Booking, Staff } from "@/features/calendar/types"
import {
  DAY_START_HOUR,
  PX_PER_MINUTE,
  minutesToPx,
} from "@/features/calendar/lib/grid-config"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derives a CSS box-shadow glow string from a hex token color.
 * Avoids hardcoding rgba values independently of the token.
 */
function hexGlow(hex: string, alpha = 0.35, spread = 6): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `0 0 ${spread}px rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WeekGridProps {
  staff: Staff[]
  bookings: Booking[]
  weekStart: Date
  weekEnd: Date
}

/**
 * Layout strategy
 * ───────────────
 * The outer div (scrollRef) is the single scroll container (overflow: auto).
 *
 * Sticky top  → StaffHeaderRow (position: sticky; top: 0; z-index: 10)
 *               Corner cell inside it is also sticky left: 0.
 *
 * Sticky left → TimeGutter (position: sticky; left: 0; z-index: 5)
 *
 * Now line    → Absolutely positioned inside the staff-columns wrapper
 *               (position: relative) so it spans all staff columns but not
 *               the TimeGutter. z-index: 8 — above grid lines and cards,
 *               below the sticky header.
 *
 * Auto-scroll → On mount and on week change, scrollTop is set to
 *               (now − 60 min) if today is in the visible week, else 0.
 */
export function WeekGrid({ staff, bookings, weekStart, weekEnd }: WeekGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialise synchronously so the line is present on the first paint.
  const [nowPx, setNowPx] = useState<number | null>(() => {
    const now = new Date()
    return minutesToPx(now.getHours(), now.getMinutes())
  })

  // True when today falls inside the currently displayed week.
  const showNowLine = useMemo(() => {
    const now = new Date()
    return now >= weekStart && now <= weekEnd
  }, [weekStart, weekEnd])

  // Tick every minute to keep the now line in sync.
  useEffect(() => {
    function tick() {
      const now = new Date()
      setNowPx(minutesToPx(now.getHours(), now.getMinutes()))
    }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll: fires on mount and whenever the viewed week changes.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let targetPx = 0
    const now = new Date()

    if (now >= weekStart && now <= weekEnd) {
      // Scroll so the now line sits ~60 minutes from the top of the viewport.
      const minutesSinceDayStart =
        (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes()
      targetPx = Math.max(0, (minutesSinceDayStart - 60) * PX_PER_MINUTE)
    }

    el.scrollTop = targetPx
  }, [weekStart]) // weekStart is memoised in useWeekRange — stable reference

  const nowGlow = hexGlow(t.colors.semantic.accent)

  return (
    <div
      ref={scrollRef}
      style={{
        overflow: "auto",
        maxHeight: "calc(100vh - 160px)",
        borderRadius: t.radius["2xl"],
        boxShadow: t.shadow.card,
        border: `1px solid ${t.colors.semantic.borderSubtle}`,
        background: t.colors.semantic.panel,
        position: "relative",
      }}
    >
      {/* ── Sticky header: staff names ─────────────────────────────── */}
      <StaffHeaderRow staff={staff} />

      {/* ── Body: time gutter + staff columns ──────────────────────── */}
      <div style={{ display: "flex" }}>
        <TimeGutter />

        {/* Staff columns + now-line overlay
            position: relative makes this the containing block for the now
            line, so it spans exactly the staff-column area. */}
        <div style={{ position: "relative", display: "flex" }}>

          {/* ── Now line ─────────────────────────────────────────────
              Rendered as two elements inside a zero-height wrapper:
                1. A filled circle at the left edge of the line.
                2. The horizontal accent line with a soft glow.
              The circle uses left: -5 so it slightly overlaps the
              TimeGutter border, matching the common calendar pattern.
              pointerEvents: none ensures it never blocks card clicks.
          ────────────────────────────────────────────────────────── */}
          {showNowLine && nowPx !== null && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: nowPx,
                left: 0,
                right: 0,
                zIndex: 8,
                pointerEvents: "none",
              }}
            >
              {/* Circle */}
              <div
                style={{
                  position: "absolute",
                  left: -5,
                  top: -4,
                  width: 9,
                  height: 9,
                  borderRadius: t.radius.full,
                  background: t.colors.semantic.accent,
                  boxShadow: nowGlow,
                }}
              />
              {/* Line */}
              <div
                style={{
                  height: 2,
                  background: t.colors.semantic.accent,
                  boxShadow: nowGlow,
                }}
              />
            </div>
          )}

          {/* Staff day columns */}
          {staff.map((s) => (
            <StaffDayColumn
              key={s.id}
              staff={s}
              bookings={bookings.filter(
                (b) =>
                  b.staffId === s.id &&
                  b.startAt >= weekStart &&
                  b.startAt <= weekEnd,
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
