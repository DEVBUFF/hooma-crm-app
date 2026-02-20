"use client"

import { useState } from "react"
import { t } from "@/lib/tokens"
import { startOfWeekMonday } from "@/features/calendar/lib/time"
import { useWeekRange } from "@/features/calendar/hooks/useWeekRange"
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar"
import { WeekGrid } from "@/features/calendar/components/WeekGrid"
import type { Booking, Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Mock data — replace with Firestore queries when ready
// ---------------------------------------------------------------------------

const MOCK_STAFF: Staff[] = [
  { id: "s1", name: "Alice", color: t.colors.base.blue500 },
  { id: "s2", name: "Bob", color: t.colors.base.coral500 },
  { id: "s3", name: "Carol", color: t.colors.base.green600 },
  { id: "s4", name: "Dave", color: t.colors.base.blue600 },
]

/**
 * Build 6 bookings anchored to the current week so they are always visible on
 * first load. Dates are computed once at module initialisation time.
 */
function buildMockBookings(): Booking[] {
  const ws = startOfWeekMonday(new Date())

  function wd(dayOff: number, h: number, m: number): Date {
    const d = new Date(ws)
    d.setDate(d.getDate() + dayOff)
    d.setHours(h, m, 0, 0)
    return d
  }

  return [
    // Monday
    {
      id: "b1",
      staffId: "s1",
      startAt: wd(0, 9, 0),
      endAt: wd(0, 10, 0),
      customerNameSnapshot: "Emma Wilson",
      serviceNameSnapshot: "Haircut",
      status: "confirmed",
    },
    {
      id: "b2",
      staffId: "s2",
      startAt: wd(0, 11, 0),
      endAt: wd(0, 11, 30),
      customerNameSnapshot: "Jake Chen",
      serviceNameSnapshot: "Beard Trim",
      status: "confirmed",
    },
    // Wednesday
    {
      id: "b3",
      staffId: "s1",
      startAt: wd(2, 14, 0),
      endAt: wd(2, 15, 0),
      customerNameSnapshot: "Sophie Martin",
      serviceNameSnapshot: "Hair Color",
      status: "completed",
    },
    {
      id: "b4",
      staffId: "s3",
      startAt: wd(2, 10, 0),
      endAt: wd(2, 11, 0),
      customerNameSnapshot: "Liam Brown",
      serviceNameSnapshot: "Deep Massage",
      status: "confirmed",
    },
    // Thursday
    {
      id: "b5",
      staffId: "s2",
      startAt: wd(3, 13, 0),
      endAt: wd(3, 14, 0),
      customerNameSnapshot: "Olivia Davis",
      serviceNameSnapshot: "Highlights",
      status: "confirmed",
    },
    // Friday
    {
      id: "b6",
      staffId: "s4",
      startAt: wd(4, 15, 0),
      endAt: wd(4, 16, 0),
      customerNameSnapshot: "Noah Taylor",
      serviceNameSnapshot: "Cut & Style",
      status: "confirmed",
    },
  ]
}

const MOCK_BOOKINGS: Booking[] = buildMockBookings()

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CalendarPage() {
  const { weekStart, weekEnd, label, goPrevWeek, goNextWeek, goToday } =
    useWeekRange()
  const [view, setView] = useState<"day" | "week">("week")

  return (
    <div
      className="flex flex-col gap-4 p-6 min-h-full"
      style={{ background: t.colors.semantic.bg }}
    >
      <CalendarToolbar
        label={label}
        view={view}
        onPrev={goPrevWeek}
        onNext={goNextWeek}
        onToday={goToday}
        onViewChange={setView}
      />

      <WeekGrid
        staff={MOCK_STAFF}
        bookings={MOCK_BOOKINGS}
        weekStart={weekStart}
        weekEnd={weekEnd}
      />
    </div>
  )
}
