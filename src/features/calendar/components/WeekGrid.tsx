"use client"

import { t } from "@/lib/tokens"
import { StaffHeaderRow } from "@/features/calendar/components/StaffHeaderRow"
import { StaffDayColumn } from "@/features/calendar/components/StaffDayColumn"
import { TimeGutter } from "@/features/calendar/components/TimeGutter"
import type { Booking, Staff } from "@/features/calendar/types"

/** px per hour — change here to scale the entire grid. */
const HOUR_HEIGHT = 60

interface WeekGridProps {
  staff: Staff[]
  bookings: Booking[]
  weekStart: Date
  weekEnd: Date
}

export function WeekGrid({ staff, bookings, weekStart, weekEnd }: WeekGridProps) {
  return (
    <div
      className="overflow-auto"
      style={{
        background: t.colors.semantic.panel,
        borderRadius: t.radius.xl,
        boxShadow: t.shadow.card,
        border: `1px solid ${t.colors.semantic.borderSubtle}`,
        maxHeight: "calc(100vh - 160px)",
      }}
    >
      {/* Sticky staff-name header */}
      <div style={{ position: "sticky", top: 0, zIndex: t.zIndex.sticky }}>
        <StaffHeaderRow staff={staff} />
      </div>

      {/* Scrollable body: time gutter + one column per staff member */}
      <div className="flex">
        <TimeGutter hourHeight={HOUR_HEIGHT} />

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
            hourHeight={HOUR_HEIGHT}
          />
        ))}
      </div>
    </div>
  )
}
