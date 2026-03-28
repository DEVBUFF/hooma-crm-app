"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Plus, User, PawPrint, Scissors, Clock, Users, ShieldAlert } from "lucide-react"
import { t } from "@/lib/tokens"
import {
  addDays,
  startOfWeekMonday,
  isSameDay,
  formatTime,
  diffMinutes,
  formatDuration,
  getDayKey,
} from "@/features/calendar/lib/time"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  scheduled:   { label: "Scheduled",   color: "var(--color-status-scheduled)",   bg: "var(--color-status-scheduled-bg)"   },
  confirmed:   { label: "Confirmed",   color: "var(--color-status-confirmed)",   bg: "var(--color-status-confirmed-bg)"   },
  in_progress: { label: "In progress", color: "var(--color-status-in-progress)", bg: "var(--color-status-in-progress-bg)" },
  completed:   { label: "Completed",   color: "var(--color-status-completed)",   bg: "var(--color-status-completed-bg)"   },
  canceled:    { label: "Cancelled",   color: "var(--color-status-cancelled)",   bg: "var(--color-status-cancelled-bg)"   },
  no_show:     { label: "No-show",     color: "var(--color-status-no-show)",     bg: "var(--color-status-no-show-bg)"     },
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-[5px] h-[5px] rounded-full shrink-0"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MobileCalendarViewProps {
  staff: Staff[]
  bookings: Booking[]
  loading?: boolean
  onBookingClick?: (booking: Booking) => void
  onAddBooking?: (staff: Staff, startAt: Date) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MobileCalendarView({
  staff,
  bookings,
  loading = false,
  onBookingClick,
  onAddBooking,
}: MobileCalendarViewProps) {
  // ── Week + day state ─────────────────────────────────────────────────────
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeekMonday(new Date()))
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<"timeline" | "staff">("staff")

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekAnchor, i)),
    [weekAnchor],
  )

  const today = useMemo(() => new Date(), [])

  const monthLabel = selectedDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Navigate weeks
  function goPrevWeek() {
    setWeekAnchor((a) => addDays(a, -7))
    setSelectedDay((d) => addDays(d, -7))
  }
  function goNextWeek() {
    setWeekAnchor((a) => addDays(a, 7))
    setSelectedDay((d) => addDays(d, 7))
  }

  function selectDay(day: Date) {
    setSelectedDay(day)
  }

  // ── Filter bookings for selected day ─────────────────────────────────────
  const dayKey = getDayKey(selectedDay)
  const dayBookings = useMemo(
    () =>
      bookings
        .filter((b) => getDayKey(b.startAt) === dayKey)
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
    [bookings, dayKey],
  )

  // Group by staff
  const byStaff = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    for (const b of dayBookings) {
      if (!map[b.staffId]) map[b.staffId] = []
      map[b.staffId].push(b)
    }
    return map
  }, [dayBookings])

  // Check which days have bookings
  const daysWithBookings = useMemo(() => {
    const set = new Set<string>()
    for (const b of bookings) set.add(getDayKey(b.startAt))
    return set
  }, [bookings])

  // ── FAB handler ──────────────────────────────────────────────────────────
  function handleFab() {
    if (!onAddBooking || staff.length === 0) return
    const startAt = new Date(selectedDay)
    startAt.setHours(9, 0, 0, 0)
    onAddBooking(staff[0], startAt)
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-xl font-medium tracking-tight"
            style={{ color: t.colors.semantic.textStrong }}
          >
            {monthLabel}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrevWeek}
              className="w-9 h-9 rounded-md flex items-center justify-center cursor-pointer"
              style={{
                border: `1px solid ${t.colors.semantic.borderSubtle}`,
                background: t.colors.semantic.panel,
                color: t.colors.semantic.textMuted,
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNextWeek}
              className="w-9 h-9 rounded-md flex items-center justify-center cursor-pointer"
              style={{
                border: `1px solid ${t.colors.semantic.borderSubtle}`,
                background: t.colors.semantic.panel,
                color: t.colors.semantic.textMuted,
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Week strip */}
        <div className="flex justify-between">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDay)
            const isToday = isSameDay(day, today)
            const hasBookings = daysWithBookings.has(getDayKey(day))
            const weekday = day.toLocaleDateString("en-US", { weekday: "short" })

            return (
              <button
                key={day.toISOString()}
                onClick={() => selectDay(day)}
                className="flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg min-w-[44px] cursor-pointer transition-colors duration-150"
                style={{
                  border: "none",
                  background: isSelected ? t.colors.semantic.primary : "transparent",
                }}
              >
                <span
                  className="text-[11px] font-medium uppercase tracking-wide"
                  style={{
                    color: isSelected
                      ? "rgba(255,255,255,0.7)"
                      : t.colors.semantic.textSubtle,
                  }}
                >
                  {weekday}
                </span>
                <span
                  className="text-lg font-medium"
                  style={{
                    color: isSelected
                      ? "#FFFFFF"
                      : isToday
                        ? t.colors.semantic.primary
                        : t.colors.semantic.textStrong,
                  }}
                >
                  {day.getDate()}
                </span>
                {/* Booking indicator dot */}
                <span
                  className="w-[5px] h-[5px] rounded-full"
                  style={{
                    background: hasBookings
                      ? isSelected
                        ? "rgba(255,255,255,0.7)"
                        : t.colors.semantic.primary
                      : "transparent",
                  }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── View toggle ─────────────────────────────────────────────────── */}
      <div
        className="flex mx-4 mb-3 p-[3px] rounded-lg"
        style={{ background: t.colors.semantic.borderSubtle }}
      >
        {(["timeline", "staff"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className="flex-1 py-2 text-[13px] font-medium rounded-md cursor-pointer capitalize transition-all duration-150"
            style={{
              border: "none",
              background: viewMode === mode ? t.colors.semantic.panel : "transparent",
              color: viewMode === mode ? t.colors.semantic.textStrong : t.colors.semantic.textSubtle,
              boxShadow: viewMode === mode ? t.shadow.sm : "none",
            }}
          >
            {mode === "timeline" ? "Timeline" : "By staff"}
          </button>
        ))}
      </div>

      {/* ── Bookings list ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-28" style={{ WebkitOverflowScrolling: "touch" }}>
        {loading ? (
          /* ── Skeleton loading ─────────────────────────────────────────── */
          <div className="flex flex-col gap-6">
            {[0, 1].map((group) => (
              <div key={group}>
                {/* Staff header skeleton */}
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <div className="w-2.5 h-2.5 rounded-full hooma-skeleton" />
                  <div className="h-4 w-24 rounded hooma-skeleton" />
                  <div className="h-3 w-16 rounded hooma-skeleton ml-auto" />
                </div>
                {/* Card skeletons */}
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: group === 0 ? 3 : 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[14px] overflow-hidden"
                      style={{ border: `1px solid ${t.colors.semantic.borderSubtle}` }}
                    >
                      {/* Header skeleton */}
                      <div
                        className="flex items-center justify-between px-3.5 py-3"
                        style={{ background: t.colors.semantic.bg }}
                      >
                        <div className="h-4 w-28 rounded hooma-skeleton" />
                        <div className="h-5 w-20 rounded-full hooma-skeleton" />
                      </div>
                      {/* Body skeleton */}
                      <div className="flex flex-col gap-2.5 px-3.5 py-3" style={{ background: t.colors.semantic.panel }}>
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded hooma-skeleton shrink-0" />
                          <div className="h-3.5 w-32 rounded hooma-skeleton" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded hooma-skeleton shrink-0" />
                          <div className="h-3.5 w-24 rounded hooma-skeleton" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded hooma-skeleton shrink-0" />
                          <div className="h-3.5 w-28 rounded hooma-skeleton flex-1" />
                          <div className="h-3.5 w-14 rounded hooma-skeleton" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : dayBookings.length === 0 ? (
          <div className="text-center py-12" style={{ color: t.colors.semantic.textSubtle }}>
            <div className="text-sm">No bookings for this day.</div>
            <div className="text-[13px] mt-1">Tap + to add one.</div>
          </div>
        ) : viewMode === "staff" ? (
          /* ── Staff-grouped view ──────────────────────────────────────── */
          Object.entries(byStaff).map(([staffId, staffBookings]) => {
            const s = staff.find((st) => st.id === staffId)
            if (!s) return null
            return (
              <div key={staffId} className="mb-6">
                {/* Staff header */}
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: t.colors.semantic.textStrong }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="text-xs ml-auto"
                    style={{ color: t.colors.semantic.textSubtle }}
                  >
                    {staffBookings.length} booking{staffBookings.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {/* Booking cards */}
                <div className="flex flex-col gap-2.5">
                  {staffBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onBookingClick?.(b)}
                      className="w-full text-left cursor-pointer overflow-hidden rounded-[14px]"
                      style={{
                        background: t.colors.semantic.panel,
                        border: `1px solid ${t.colors.semantic.borderSubtle}`,
                      }}
                    >
                      {/* Card header: time + status */}
                      <div
                        className="flex items-center justify-between px-3.5 py-2.5"
                        style={{
                          background: hexToRgba(s.color, 0.08),
                          borderBottom: `1px solid ${t.colors.semantic.borderSubtle}`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={14} style={{ color: t.colors.semantic.textSubtle }} />
                          <span
                            className="text-sm font-medium tracking-tight"
                            style={{
                              color: t.colors.semantic.textStrong,
                              fontFamily: t.typography.fontFamily.mono,
                            }}
                          >
                            {formatTime(b.startAt)}–{formatTime(b.endAt)}
                          </span>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      {/* Card body: icon rows */}
                      <div className="flex flex-col gap-2 px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <User size={14} style={{ color: t.colors.semantic.textSubtle, flexShrink: 0 }} />
                          <span className="text-[13px] font-medium truncate" style={{ color: t.colors.semantic.textStrong }}>
                            {b.customerNameSnapshot}
                          </span>
                        </div>
                        {b.petNameSnapshot && (
                          <div className="flex items-center gap-2">
                            <PawPrint size={14} style={{ color: t.colors.semantic.textSubtle, flexShrink: 0 }} />
                            <span className="text-[13px] truncate" style={{ color: t.colors.semantic.textStrong }}>
                              {b.petNameSnapshot}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Scissors size={14} style={{ color: t.colors.semantic.textSubtle, flexShrink: 0 }} />
                          <span className="text-[13px] flex-1 truncate" style={{ color: t.colors.semantic.textStrong }}>
                            {b.serviceNameSnapshot}
                          </span>
                          {b.priceSnapshot && (
                            <span
                              className="text-[13px] font-medium shrink-0"
                              style={{ color: t.colors.semantic.primary, fontFamily: t.typography.fontFamily.mono }}
                            >
                              {b.priceSnapshot}
                            </span>
                          )}
                        </div>
                        {b.petAllergiesSnapshot && (
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "var(--color-error-bg)" }}>
                            <ShieldAlert size={13} style={{ color: "var(--color-error-text)", flexShrink: 0 }} />
                            <span className="text-[12px] font-medium" style={{ color: "var(--color-error-text)" }}>
                              {b.petAllergiesSnapshot}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          /* ── Timeline view ───────────────────────────────────────────── */
          <div className="flex flex-col gap-2.5">
            {dayBookings.map((b) => {
              const s = staff.find((st) => st.id === b.staffId)
              const color = s?.color ?? t.colors.semantic.primary

              return (
                <button
                  key={b.id}
                  onClick={() => onBookingClick?.(b)}
                  className="w-full text-left cursor-pointer overflow-hidden rounded-[14px]"
                  style={{
                    background: t.colors.semantic.panel,
                    border: `1px solid ${t.colors.semantic.borderSubtle}`,
                  }}
                >
                  {/* Card header: time + status */}
                  <div
                    className="flex items-center justify-between px-3.5 py-2.5"
                    style={{
                      background: t.colors.semantic.bg,
                      borderBottom: `1px solid ${t.colors.semantic.borderSubtle}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: t.colors.semantic.textSubtle }} />
                      <span
                        className="text-sm font-medium tracking-tight"
                        style={{
                          color: t.colors.semantic.textStrong,
                          fontFamily: t.typography.fontFamily.mono,
                        }}
                      >
                        {formatTime(b.startAt)}–{formatTime(b.endAt)}
                      </span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  {/* Card body: icon rows */}
                  <div className="flex flex-col gap-2 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Users size={14} style={{ color: color, flexShrink: 0 }} />
                      <span className="text-[13px] font-medium truncate" style={{ color: t.colors.semantic.textStrong }}>
                        {s?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} style={{ color: t.colors.semantic.textSubtle, flexShrink: 0 }} />
                      <span className="text-[13px] truncate" style={{ color: t.colors.semantic.textStrong }}>
                        {b.customerNameSnapshot}
                        {b.petNameSnapshot ? ` · ${b.petNameSnapshot}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors size={14} style={{ color: t.colors.semantic.textSubtle, flexShrink: 0 }} />
                      <span className="text-[13px] flex-1 truncate" style={{ color: t.colors.semantic.textStrong }}>
                        {b.serviceNameSnapshot}
                      </span>
                      {b.priceSnapshot && (
                        <span
                          className="text-[13px] font-medium shrink-0"
                          style={{ color: t.colors.semantic.primary, fontFamily: t.typography.fontFamily.mono }}
                        >
                          {b.priceSnapshot}
                        </span>
                      )}
                    </div>
                    {b.petAllergiesSnapshot && (
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "var(--color-error-bg)" }}>
                        <ShieldAlert size={13} style={{ color: "var(--color-error-text)", flexShrink: 0 }} />
                        <span className="text-[12px] font-medium" style={{ color: "var(--color-error-text)" }}>
                          {b.petAllergiesSnapshot}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <button
        onClick={handleFab}
        className="fixed bottom-24 right-4 w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer z-10"
        style={{
          background: t.colors.semantic.primary,
          border: "none",
          color: "#FFFFFF",
          boxShadow: `0 4px 12px ${hexToRgba(t.colors.base.periwinkle500, 0.4)}`,
        }}
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
