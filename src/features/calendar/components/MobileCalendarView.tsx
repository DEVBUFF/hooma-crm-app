"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react"
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

const STATUS_DOT: Record<BookingStatus, string> = {
  scheduled:   "var(--color-status-scheduled)",
  confirmed:   "var(--color-status-confirmed)",
  in_progress: "var(--color-status-in-progress)",
  completed:   "var(--color-status-completed)",
  canceled:    "var(--color-status-cancelled)",
  no_show:     "var(--color-status-no-show)",
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
  onBookingClick?: (booking: Booking) => void
  onAddBooking?: (staff: Staff, startAt: Date) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MobileCalendarView({
  staff,
  bookings,
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
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {dayBookings.length === 0 ? (
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
              <div key={staffId} className="mb-5">
                {/* Staff header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <span
                    className="text-sm font-medium"
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
                <div className="flex flex-col gap-2">
                  {staffBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onBookingClick?.(b)}
                      className="w-full text-left cursor-pointer"
                      style={{
                        background: hexToRgba(s.color, 0.08),
                        borderLeft: `3px solid ${s.color}`,
                        borderRadius: "0 10px 10px 0",
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "none",
                        borderLeftWidth: 3,
                        borderLeftStyle: "solid",
                        borderLeftColor: s.color,
                      }}
                    >
                      <div>
                        <div
                          className="text-[15px] font-medium tracking-tight"
                          style={{
                            color: t.colors.semantic.textStrong,
                            fontFamily: t.typography.fontFamily.mono,
                          }}
                        >
                          {formatTime(b.startAt)}–{formatTime(b.endAt)}
                        </div>
                        <div
                          className="text-[13px] mt-0.5"
                          style={{ color: t.colors.semantic.textMuted }}
                        >
                          {b.customerNameSnapshot} · {b.serviceNameSnapshot}
                        </div>
                      </div>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: STATUS_DOT[b.status] }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          /* ── Timeline view ───────────────────────────────────────────── */
          <div className="flex flex-col gap-2">
            {dayBookings.map((b) => {
              const s = staff.find((st) => st.id === b.staffId)
              const color = s?.color ?? t.colors.semantic.primary

              return (
                <button
                  key={b.id}
                  onClick={() => onBookingClick?.(b)}
                  className="w-full text-left cursor-pointer flex items-center gap-3"
                  style={{
                    background: t.colors.semantic.panel,
                    borderRadius: 14,
                    padding: "14px 16px",
                    border: `1px solid ${t.colors.semantic.borderSubtle}`,
                  }}
                >
                  {/* Time column */}
                  <div
                    className="min-w-[72px]"
                    style={{
                      fontFamily: t.typography.fontFamily.mono,
                      fontSize: 14,
                      fontWeight: 500,
                      color: t.colors.semantic.textStrong,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {formatTime(b.startAt)}
                    <div
                      className="text-xs font-normal"
                      style={{ color: t.colors.semantic.textSubtle }}
                    >
                      {formatTime(b.endAt)}
                    </div>
                  </div>
                  {/* Divider */}
                  <div
                    className="w-[3px] h-9 rounded-sm shrink-0"
                    style={{ background: color }}
                  />
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[15px] font-medium truncate"
                      style={{ color: t.colors.semantic.textStrong }}
                    >
                      {b.customerNameSnapshot}
                    </div>
                    <div
                      className="text-[13px] flex items-center gap-1.5 mt-0.5"
                      style={{ color: t.colors.semantic.textMuted }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: color }}
                      />
                      {s?.name} · {b.serviceNameSnapshot}
                    </div>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: STATUS_DOT[b.status] }}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <button
        onClick={handleFab}
        className="absolute bottom-24 right-4 w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer z-10"
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
