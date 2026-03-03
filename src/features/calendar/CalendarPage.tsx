"use client"

import { useCallback, useMemo, useState } from "react"
import { t } from "@/lib/tokens"
import {
  addDays,
  formatDayLabel,
} from "@/features/calendar/lib/time"
import { useWeekRange } from "@/features/calendar/hooks/useWeekRange"
import { useBookings } from "@/features/calendar/hooks/useBookings"
import { useCalendarStaff } from "@/features/calendar/hooks/useCalendarStaff"
import { useCalendarCustomers } from "@/features/calendar/hooks/useCalendarCustomers"
import { useCalendarServices } from "@/features/calendar/hooks/useCalendarServices"
import { useSalon } from "@/lib/useSalon"
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar"
import { WeekGrid } from "@/features/calendar/components/WeekGrid"
import { WeekViewGrid } from "@/features/calendar/components/WeekViewGrid"
import { CreateBookingModal } from "@/features/calendar/components/CreateBookingModal"
import { BookingDetailPanel } from "@/features/calendar/components/BookingDetailPanel"
import { BASE_PX_PER_MINUTE } from "@/features/calendar/lib/grid-config"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Zoom
// ---------------------------------------------------------------------------

const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5] as const
type ZoomLevel = (typeof ZOOM_LEVELS)[number]

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

  // ── Salon + Firestore data ──────────────────────────────────────────────
  const { salon }                                  = useSalon()
  const salonId                                    = salon?.id ?? null
  const { bookings, loading: bookingsLoading, add, update, remove } = useBookings(salonId)
  const { staff, loading: staffLoading }           = useCalendarStaff(salonId)
  const { customers }                              = useCalendarCustomers(salonId)
  const { services }                               = useCalendarServices(salonId)
  const currency                                   = salon?.settings?.currency ?? "GEL"

  // ── Create-booking modal ───────────────────────────────────────────────────
  const [pendingSlot, setPendingSlot] = useState<PendingSlot | null>(null)

  const handleColumnClick = useCallback((s: Staff, startAt: Date) => {
    setPendingSlot({ staff: s, startAt })
  }, [])

  const handleCreate = useCallback(
    async (data: Omit<Booking, "id">) => {
      await add(data)
      setPendingSlot(null)
    },
    [add],
  )

  // ── Status change (quick actions from BookingCard dropdown) ───────────────
  const handleStatusChange = useCallback(
    async (id: string, status: BookingStatus) => {
      await update(id, { status })
    },
    [update],
  )

  // ── Drag / resize commit ───────────────────────────────────────────────────
  const handleUpdateBooking = useCallback(
    async (
      id:      string,
      updates: { staffId: string; startAt: Date; endAt: Date },
    ) => {
      await update(id, updates)
    },
    [update],
  )

  // ── Booking detail panel (click to open) ──────────────────────────────────
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId],
  )

  const handleBookingClick = useCallback((booking: Booking) => {
    setSelectedBookingId(booking.id)
  }, [])

  const handleSaveBooking = useCallback(
    async (updated: Booking) => {
      await update(updated.id, {
        staffId:              updated.staffId,
        startAt:              updated.startAt,
        endAt:                updated.endAt,
        customerNameSnapshot: updated.customerNameSnapshot,
        serviceNameSnapshot:  updated.serviceNameSnapshot,
        priceSnapshot:        updated.priceSnapshot,
        status:               updated.status,
      })
      setSelectedBookingId(null)
    },
    [update],
  )

  const handleDeleteBooking = useCallback(
    async (id: string) => {
      await remove(id)
      setSelectedBookingId(null)
    },
    [remove],
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

  // ── Loading guard ──────────────────────────────────────────────────────
  const isLoading = bookingsLoading || staffLoading

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

      {isLoading ? (
        <div
          style={{
            flex:           1,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            color:          t.colors.semantic.textMuted,
            fontSize:       t.typography.fontSize.sm,
          }}
        >
          Loading…
        </div>
      ) : staff.length === 0 ? (
        <div
          style={{
            flex:           1,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            color:          t.colors.semantic.textMuted,
            fontSize:       t.typography.fontSize.sm,
          }}
        >
          Add staff members to start using the calendar.
        </div>
      ) : view === "week" ? (
        /* ── True week view: 7 day groups ─────────────────────────────── */
        <WeekViewGrid
          staff={staff}
          bookings={bookings}
          weekStart={weekStart}
          pxPerMinute={pxPerMinute}
          onColumnClick={handleColumnClick}
          onUpdateBooking={handleUpdateBooking}
          onStatusChange={handleStatusChange}
          onBookingClick={handleBookingClick}
        />
      ) : (
        /* ── Day view: staff columns for a single day ──────────────────── */
        <WeekGrid
          staff={staff}
          bookings={bookings}
          weekStart={dayStart}
          weekEnd={dayEnd}
          pxPerMinute={pxPerMinute}
          onColumnClick={handleColumnClick}
          onUpdateBooking={handleUpdateBooking}
          onStatusChange={handleStatusChange}
          onBookingClick={handleBookingClick}
        />
      )}

      {/* Modal rendered at page level — above the scroll container. */}
      {pendingSlot && (
        <CreateBookingModal
          staff={pendingSlot.staff}
          startAt={pendingSlot.startAt}
          customers={customers}
          services={services}
          currency={currency}
          onClose={() => setPendingSlot(null)}
          onCreate={handleCreate}
        />
      )}

      {/* Booking detail panel — slides in from the right */}
      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          staff={staff}
          customers={customers}
          services={services}
          currency={currency}
          onClose={() => setSelectedBookingId(null)}
          onSave={handleSaveBooking}
          onDelete={handleDeleteBooking}
        />
      )}
    </div>
  )
}
