"use client"

import { useCallback, useMemo, useState } from "react"
import { t } from "@/lib/tokens"
import {
  addDays,
  startOfWeekMonday,
  formatDayLabel,
} from "@/features/calendar/lib/time"
import { useWeekRange } from "@/features/calendar/hooks/useWeekRange"
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar"
import { WeekGrid } from "@/features/calendar/components/WeekGrid"
import { WeekViewGrid } from "@/features/calendar/components/WeekViewGrid"
import { CreateBookingModal } from "@/features/calendar/components/CreateBookingModal"
import { BASE_PX_PER_MINUTE } from "@/features/calendar/lib/grid-config"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Zoom
// ---------------------------------------------------------------------------

const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5] as const
type ZoomLevel = (typeof ZOOM_LEVELS)[number]

// ---------------------------------------------------------------------------
// Mock data — replace with Firestore queries when ready
// ---------------------------------------------------------------------------

const MOCK_STAFF: Staff[] = [
  { id: "s1", name: "Alice", color: t.colors.base.blue500 },
  { id: "s2", name: "Bob",   color: t.colors.base.coral500 },
  { id: "s3", name: "Carol", color: t.colors.base.green600 },
  { id: "s4", name: "Dave",  color: t.colors.base.blue600 },
]

/**
 * Build 6 bookings anchored to the current week so they are always visible on
 * first load. Dates are computed once inside useState lazy initialiser.
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
      id: "b1", staffId: "s1",
      startAt: wd(0, 9, 0),  endAt: wd(0, 10, 0),
      customerNameSnapshot: "Emma Wilson",  serviceNameSnapshot: "Haircut",
      priceSnapshot: "GEL 25",
      status: "confirmed",
    },
    {
      id: "b2", staffId: "s2",
      startAt: wd(0, 11, 0), endAt: wd(0, 11, 30),
      customerNameSnapshot: "Jake Chen",   serviceNameSnapshot: "Beard Trim",
      priceSnapshot: "GEL 15",
      status: "confirmed",
    },
    // Wednesday
    {
      id: "b3", staffId: "s1",
      startAt: wd(2, 14, 0), endAt: wd(2, 15, 0),
      customerNameSnapshot: "Sophie Martin", serviceNameSnapshot: "Hair Color",
      priceSnapshot: "GEL 60",
      status: "completed",
    },
    {
      id: "b4", staffId: "s3",
      startAt: wd(2, 10, 0), endAt: wd(2, 11, 0),
      customerNameSnapshot: "Liam Brown",  serviceNameSnapshot: "Deep Massage",
      priceSnapshot: "GEL 45",
      status: "confirmed",
    },
    // Thursday
    {
      id: "b5", staffId: "s2",
      startAt: wd(3, 13, 0), endAt: wd(3, 14, 0),
      customerNameSnapshot: "Olivia Davis", serviceNameSnapshot: "Highlights",
      priceSnapshot: "GEL 80",
      status: "confirmed",
    },
    // Friday
    {
      id: "b6", staffId: "s4",
      startAt: wd(4, 15, 0), endAt: wd(4, 16, 0),
      customerNameSnapshot: "Noah Taylor", serviceNameSnapshot: "Cut & Style",
      priceSnapshot: "GEL 35",
      status: "confirmed",
    },
  ]
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/** Shape of a pending new booking: which staff + what snapped start time. */
interface PendingSlot {
  staff:   Staff
  startAt: Date
}

export function CalendarPage() {
  // ── View mode ─────────────────────────────────────────────────────────────
  const [view, setView] = useState<"day" | "week">("week")

  // ── Week navigation (week mode) ───────────────────────────────────────────
  const { weekStart, weekEnd, goPrevWeek, goNextWeek, goToday: goThisWeek } =
    useWeekRange()

  // ── Day navigation (day mode) ─────────────────────────────────────────────
  const [currentDay, setCurrentDay] = useState<Date>(() => new Date())
  const goPrevDay  = useCallback(() => setCurrentDay((d) => addDays(d, -1)), [])
  const goNextDay  = useCallback(() => setCurrentDay((d) => addDays(d, 1)),  [])
  const goTodayDay = useCallback(() => setCurrentDay(new Date()),            [])

  // Bounds used by WeekGrid in day mode: filter bookings to a single day
  const dayStart = useMemo(() => {
    const d = new Date(currentDay); d.setHours(0, 0, 0, 0); return d
  }, [currentDay])
  const dayEnd = useMemo(() => {
    const d = new Date(currentDay); d.setHours(23, 59, 59, 999); return d
  }, [currentDay])

  // ── Unified toolbar values ─────────────────────────────────────────────────
  const label   = view === "week" ? undefined : formatDayLabel(currentDay)
  const onPrev  = view === "week" ? goPrevWeek  : goPrevDay
  const onNext  = view === "week" ? goNextWeek  : goNextDay
  const onToday = view === "week" ? goThisWeek  : goTodayDay

  // ── Bookings (local state) ─────────────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>(() => buildMockBookings())

  // ── Create-booking modal ───────────────────────────────────────────────────
  const [pendingSlot, setPendingSlot] = useState<PendingSlot | null>(null)

  const handleColumnClick = useCallback((staff: Staff, startAt: Date) => {
    setPendingSlot({ staff, startAt })
  }, [])

  function handleCreate(data: Omit<Booking, "id">) {
    setBookings((prev) => [...prev, { ...data, id: `b${Date.now()}` }])
    setPendingSlot(null)
  }

  // ── Status change (quick actions from BookingCard dropdown) ───────────────
  const handleStatusChange = useCallback(
    (id: string, status: BookingStatus) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b)),
      )
    },
    [],
  )

  // ── Drag / resize commit ───────────────────────────────────────────────────
  const handleUpdateBooking = useCallback(
    (
      id:      string,
      updates: { staffId: string; startAt: Date; endAt: Date },
    ) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      )
    },
    [],
  )

  // ── Zoom ───────────────────────────────────────────────────────────────────
  const [zoomIdx, setZoomIdx] = useState<number>(1) // default: 100 %
  const zoom        = ZOOM_LEVELS[zoomIdx] as ZoomLevel
  const pxPerMinute = BASE_PX_PER_MINUTE * zoom

  const onZoomIn  = useCallback(
    () => setZoomIdx((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1)),
    [],
  )
  const onZoomOut = useCallback(
    () => setZoomIdx((i) => Math.max(i - 1, 0)),
    [],
  )

  return (
    <div
      className="flex flex-col gap-4 p-6 min-h-full w-full min-w-0"
      style={{ background: t.colors.semantic.bg }}
    >
      <CalendarToolbar
        label={label ?? `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        view={view}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
        onViewChange={setView}
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        canZoomIn={zoomIdx  < ZOOM_LEVELS.length - 1}
        canZoomOut={zoomIdx > 0}
      />

      {view === "week" ? (
        /* ── True week view: 7 day groups ─────────────────────────────── */
        <WeekViewGrid
          staff={MOCK_STAFF}
          bookings={bookings}
          weekStart={weekStart}
          pxPerMinute={pxPerMinute}
          onColumnClick={handleColumnClick}
          onUpdateBooking={handleUpdateBooking}
          onStatusChange={handleStatusChange}
        />
      ) : (
        /* ── Day view: staff columns for a single day ──────────────────── */
        <WeekGrid
          staff={MOCK_STAFF}
          bookings={bookings}
          weekStart={dayStart}
          weekEnd={dayEnd}
          pxPerMinute={pxPerMinute}
          onColumnClick={handleColumnClick}
          onUpdateBooking={handleUpdateBooking}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Modal rendered at page level — above the scroll container. */}
      {pendingSlot && (
        <CreateBookingModal
          staff={pendingSlot.staff}
          startAt={pendingSlot.startAt}
          onClose={() => setPendingSlot(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
