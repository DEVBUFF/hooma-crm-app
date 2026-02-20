"use client"

import { t } from "@/lib/tokens"
import { StaffHeaderRow } from "@/features/calendar/components/StaffHeaderRow"
import { StaffDayColumn } from "@/features/calendar/components/StaffDayColumn"
import { TimeGutter } from "@/features/calendar/components/TimeGutter"
import type { Booking, Staff } from "@/features/calendar/types"

interface WeekGridProps {
  staff: Staff[]
  bookings: Booking[]
  weekStart: Date
  weekEnd: Date
}

/**
 * Layout strategy
 * ───────────────
 * The outer div is the single scroll container (overflow: auto — both axes).
 *
 * Sticky top  → StaffHeaderRow (owns its own position: sticky; top: 0)
 *               Its internal corner cell is also position: sticky; left: 0,
 *               so it pins to the top-left corner when scrolling either axis.
 *
 * Sticky left → TimeGutter (position: sticky; left: 0 within the body row)
 *               Stays visible while scrolling horizontally through staff cols.
 *
 * All widths are explicit (GUTTER_WIDTH + n × COLUMN_WIDTH) so the container
 * can grow a scrollbar when staff columns exceed the viewport.
 */
export function WeekGrid({ staff, bookings, weekStart, weekEnd }: WeekGridProps) {
  return (
    <div
      style={{
        overflow: "auto",
        maxHeight: "calc(100vh - 160px)",
        borderRadius: t.radius["2xl"],
        boxShadow: t.shadow.card,
        border: `1px solid ${t.colors.semantic.borderSubtle}`,
        background: t.colors.semantic.panel,
        // Needed so the child sticky elements have a well-defined scroll root
        position: "relative",
      }}
    >
      {/* ── Sticky header: staff names ─────────────────────────────── */}
      <StaffHeaderRow staff={staff} />

      {/* ── Body: time gutter + staff columns ──────────────────────── */}
      <div style={{ display: "flex" }}>
        <TimeGutter />

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
  )
}
