"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { t } from "@/lib/tokens"
import {
  addDays,
  isSameDay,
  getDayKey,
  formatTime,
  diffMinutes,
  formatDuration,
} from "@/features/calendar/lib/time"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"
import { formatDayGroupLabel } from "@/features/calendar/lib/time"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ---------------------------------------------------------------------------
// Status config — colours from tokens
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<BookingStatus, { bg: string; color: string; label: string }> = {
  scheduled:   { bg: "var(--color-status-scheduled-bg)",    color: "var(--color-status-scheduled)",    label: "Scheduled"   },
  confirmed:   { bg: "var(--color-status-confirmed-bg)",    color: "var(--color-status-confirmed)",    label: "Confirmed"   },
  in_progress: { bg: "var(--color-status-in-progress-bg)",  color: "var(--color-status-in-progress)",  label: "In progress" },
  completed:   { bg: "var(--color-status-completed-bg)",    color: "var(--color-status-completed)",    label: "Completed"   },
  canceled:    { bg: "var(--color-status-cancelled-bg)",    color: "var(--color-status-cancelled)",    label: "Cancelled"   },
  no_show:     { bg: "var(--color-status-no-show-bg)",      color: "var(--color-status-no-show)",      label: "No-show"     },
}

const STATUS_ICON: Record<BookingStatus, string> = {
  scheduled:   "◦",
  confirmed:   "✓",
  in_progress: "▶",
  completed:   "✔",
  canceled:    "✕",
  no_show:     "∅",
}

const QUICK_ACTIONS: Array<{ label: string; status: BookingStatus }> = [
  { label: "Start grooming",    status: "in_progress" },
  { label: "Mark as Completed", status: "completed"   },
  { label: "Mark as No-show",   status: "no_show"     },
  { label: "Cancel booking",    status: "canceled"     },
]

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAFF_COL_W = 180

// ---------------------------------------------------------------------------
// BookingPill — compact card shown inside a day cell
// ---------------------------------------------------------------------------

function BookingPill({
  booking,
  staff,
  onStatusChange,
  onBookingClick,
}: {
  booking:        Booking
  staff:          Staff
  onStatusChange: (id: string, status: BookingStatus) => void
  onBookingClick?: (booking: Booking) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pillRef = useRef<HTMLDivElement>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)

  const status  = STATUS_CONFIG[booking.status]
  const actions = QUICK_ACTIONS.filter((a) => a.status !== booking.status)
  const staffColor = staff.color

  const durationMin = diffMinutes(booking.startAt, booking.endAt)
  const durationStr = formatDuration(durationMin)

  // Compute popover position when hovered
  useEffect(() => {
    if (!hovered) {
      setPopoverPos(null)
      return
    }
    const el = pillRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPopoverPos({ top: rect.top, left: rect.right + 8 })
  }, [hovered])

  return (
    <div
      ref={pillRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!menuOpen) setHovered(false) }}
      onClick={(e) => {
        e.stopPropagation()
        onBookingClick?.(booking)
      }}
      style={{
        padding:      "5px 8px",
        borderRadius: t.radius.sm,
        background:   hexToRgba(staffColor, 0.12),
        borderLeft:   `3px solid ${staffColor}`,
        display:      "flex",
        flexDirection: "column",
        gap:          2,
        minWidth:     0,
        overflow:     "hidden",
        cursor:       "pointer",
        transition:   `background ${t.motion.duration.fast} ${t.motion.easing.standard}`,
        boxShadow:    "none",
      }}
    >
      {/* Row 1: time range + kebab / status dot */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          gap:            4,
        }}
      >
        <span
          style={{
            fontSize:   11,
            fontWeight: t.typography.fontWeight.semibold,
            color:      t.colors.semantic.textStrong,
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(booking.startAt)}–{formatTime(booking.endAt)}
        </span>

        {/* Kebab on hover or when menu is open — status dot otherwise */}
        {(hovered || menuOpen) && actions.length > 0 ? (
          <DropdownMenu open={menuOpen} onOpenChange={(open) => { setMenuOpen(open); if (!open) setHovered(false) }}>
            <DropdownMenuTrigger asChild>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  width:          16,
                  height:         16,
                  borderRadius:   t.radius.sm,
                  background:     hexToRgba(staffColor, 0.15),
                  border:         "none",
                  cursor:         "pointer",
                  padding:        0,
                  fontSize:       10,
                  letterSpacing:  1,
                  color:          t.colors.semantic.textMuted,
                  lineHeight:     1,
                }}
              >
                ···
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.status}
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(booking.id, action.status)
                  }}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span
            style={{
              width:        6,
              height:       6,
              borderRadius: "50%",
              background:   status.color,
              flexShrink:   0,
            }}
          />
        )}
      </div>

      {/* Row 2: customer · service + allergy indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, minWidth: 0 }}>
        <span
          style={{
            fontSize:     10,
            color:        t.colors.semantic.textMuted,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
            lineHeight:   1.3,
            flex:         1,
            minWidth:     0,
          }}
        >
          {booking.customerNameSnapshot} · {booking.serviceNameSnapshot}
        </span>
        {booking.petAllergiesSnapshot && (
          <span
            title={booking.petAllergiesSnapshot}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
              width:          12,
              height:         12,
              borderRadius:   "50%",
              background:     "var(--color-error-bg)",
              color:          "var(--color-error-text)",
              fontSize:       8,
              fontWeight:     700,
              lineHeight:     1,
              cursor:         "default",
            }}
          >
            !
          </span>
        )}
      </div>

      {/* ── Hover popover (portal, fixed positioning) ──────────────── */}
      {hovered && popoverPos && createPortal(
        <div
          style={{
            position:      "fixed",
            top:           popoverPos.top,
            left:          popoverPos.left,
            zIndex:        50,
            pointerEvents: "none",
            minWidth:      220,
          }}
        >
          <div
            style={{
              background:   t.colors.semantic.panel,
              borderRadius: t.radius.lg,
              boxShadow:    t.shadow.cardElevated,
              border:       `1px solid ${t.colors.semantic.border}`,
              overflow:     "hidden",
            }}
          >
            {/* Header bar */}
            <div
              style={{
                background:     staffColor,
                padding:        "8px 12px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                gap:            8,
              }}
            >
              <span
                style={{
                  fontSize:   t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.semibold,
                  color:      t.colors.semantic.textOnPrimary,
                  lineHeight: 1.3,
                }}
              >
                {formatTime(booking.startAt)} – {formatTime(booking.endAt)}
              </span>
              <span
                style={{
                  fontSize:   t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color:      t.colors.semantic.textOnPrimary,
                  lineHeight: 1.3,
                }}
              >
                {status.label}
              </span>
            </div>

            {/* Body */}
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Status row with icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    width:          28,
                    height:         28,
                    borderRadius:   t.radius.md,
                    background:     status.bg,
                    flexShrink:     0,
                  }}
                >
                  <span style={{ fontSize: 14, color: status.color }}>
                    {STATUS_ICON[booking.status]}
                  </span>
                </span>
                <span
                  style={{
                    fontSize:   t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    color:      t.colors.semantic.text,
                  }}
                >
                  {status.label}
                </span>
              </div>

              {/* Service + price */}
              <div
                style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "baseline",
                  gap:            8,
                }}
              >
                <span
                  style={{
                    fontSize:   t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    color:      t.colors.semantic.text,
                  }}
                >
                  {booking.serviceNameSnapshot}
                </span>
                {booking.priceSnapshot && (
                  <span
                    style={{
                      fontSize:   t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.semibold,
                      color:      t.colors.semantic.text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {booking.priceSnapshot}
                  </span>
                )}
              </div>

              {/* Customer + duration */}
              <span
                style={{
                  fontSize: t.typography.fontSize.xs,
                  color:    t.colors.semantic.textMuted,
                }}
              >
                {booking.customerNameSnapshot} · {durationStr}
              </span>

              {/* Allergies warning */}
              {booking.petAllergiesSnapshot && (
                <div
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          6,
                    padding:      "5px 8px",
                    borderRadius: t.radius.md,
                    background:   "var(--color-error-bg)",
                    fontSize:     t.typography.fontSize.xs,
                    color:        "var(--color-error-text)",
                    lineHeight:   1.35,
                  }}
                >
                  <span style={{ flexShrink: 0, fontSize: 12 }}>⚠</span>
                  <span><strong>Allergies:</strong> {booking.petAllergiesSnapshot}</span>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WeekViewGridProps {
  staff:       Staff[]
  bookings:    Booking[]
  /** Monday of the current week. */
  weekStart:   Date
  pxPerMinute: number
  onColumnClick:   (staff: Staff, startAt: Date) => void
  onUpdateBooking: (id: string, updates: { staffId: string; startAt: Date; endAt: Date }) => void
  onStatusChange:  (id: string, status: BookingStatus) => void
  onBookingClick?: (booking: Booking) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Week overview matrix: staff rows × 7 day columns.
 *
 * Layout
 * ──────
 * ┌──────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
 * │  Team    │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun  │
 * ├──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
 * │  Alice   │ pill │      │ pill │      │      │      │      │
 * ├──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
 * │  Bob     │      │ pill │      │ pill │      │      │      │
 * └──────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
 *
 * All 7 days are always visible — no horizontal scroll.
 * Prev/Next arrows navigate by week.
 * Click an empty cell to create a booking.
 */
export function WeekViewGrid({
  staff,
  bookings,
  weekStart,
  onColumnClick,
  onStatusChange,
  onBookingClick,
}: WeekViewGridProps) {
  // ── 7 days: Monday … Sunday ─────────────────────────────────────────────
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )
  const today = useMemo(() => new Date(), [])

  // ── Group bookings by dayKey → staffId → sorted Booking[] ──────────────
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, Booking[]>> = {}
    for (const b of bookings) {
      const dk = getDayKey(b.startAt)
      if (!map[dk]) map[dk] = {}
      if (!map[dk][b.staffId]) map[dk][b.staffId] = []
      map[dk][b.staffId].push(b)
    }
    // Sort each group by start time
    for (const dk of Object.keys(map)) {
      for (const sid of Object.keys(map[dk])) {
        map[dk][sid].sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      }
    }
    return map
  }, [bookings])

  // Total rows: 1 header + N staff rows
  const totalRows = staff.length + 1
  const gridCols = `${STAFF_COL_W}px repeat(7, 1fr)`
  // Header row is auto-sized, staff rows stretch equally
  const gridRows = `auto ${staff.map(() => "1fr").join(" ")}`

  return (
    <div
      style={{
        border:              `1px solid ${t.colors.semantic.border}`,
        background:          t.colors.semantic.panel,
        overflow:            "hidden",
        flex:                1,
        minWidth:            0,
        display:             "grid",
        gridTemplateColumns: gridCols,
        gridTemplateRows:    gridRows,
      }}
    >
      {/* ── Header row: corner + 7 day headers ─────────────────────────── */}

      {/* Corner cell */}
      <div
        style={{
          padding:      "12px 14px",
          display:      "flex",
          alignItems:   "center",
          borderRight:  `1px solid ${t.colors.semantic.divider}`,
          borderBottom: `1px solid ${t.colors.semantic.divider}`,
        }}
      >
        <span
          style={{
            fontSize:      t.typography.fontSize.xs,
            fontWeight:    t.typography.fontWeight.semibold,
            color:         t.colors.semantic.textMuted,
            textTransform: "uppercase",
            letterSpacing: t.typography.letterSpacing.label,
            userSelect:    "none",
          }}
        >
          Team
        </span>
      </div>

      {/* Day headers */}
      {days.map((day, i) => {
        const isToday = isSameDay(day, today)
        return (
          <div
            key={`header-${i}`}
            style={{
              padding:      "10px 12px",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              minWidth:     0,
              overflow:     "hidden",
              borderLeft:   `1px solid ${t.colors.semantic.divider}`,
              borderBottom: `1px solid ${t.colors.semantic.divider}`,
              background:   isToday
                ? t.colors.component.badge.todayBg
                : undefined,
            }}
          >
            <span
              style={{
                fontSize:   t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color:      isToday
                  ? t.colors.semantic.primary
                  : t.colors.semantic.textSubtle,
                userSelect: "none",
              }}
            >
              {formatDayGroupLabel(day)}
            </span>

            {/* Date number — today gets a circle indicator */}
            <span
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                justifyContent: "center",
                width:          isToday ? 24 : undefined,
                height:         isToday ? 24 : undefined,
                borderRadius:   isToday ? t.radius.sm : undefined,
                background:     isToday
                  ? t.colors.semantic.primary
                  : undefined,
                fontSize:       t.typography.fontSize.xs,
                fontWeight:     t.typography.fontWeight.semibold,
                color:          isToday
                  ? t.colors.semantic.textOnPrimary
                  : t.colors.semantic.textSubtle,
                userSelect:     "none",
              }}
            >
              {day.getDate()}
            </span>
          </div>
        )
      })}

      {/* ── Staff rows ─────────────────────────────────────────────────── */}
      {staff.map((s, staffIdx) => {
        const isLastRow = staffIdx === staff.length - 1
        return (
          <React.Fragment key={s.id}>
            {/* Staff name cell */}
            <div
              style={{
                padding:      "12px 14px",
                display:      "flex",
                alignItems:   "flex-start",
                gap:          10,
                borderRight:  `1px solid ${t.colors.semantic.divider}`,
                borderBottom: isLastRow
                  ? undefined
                  : `1px solid ${t.colors.semantic.divider}`,
              }}
            >
              <span
                style={{
                  display:      "inline-block",
                  width:        10,
                  height:       10,
                  borderRadius: "50%",
                  background:   s.color,
                  flexShrink:   0,
                  marginTop:    2,
                }}
              />
              <span
                style={{
                  fontSize:     t.typography.fontSize.sm,
                  fontWeight:   t.typography.fontWeight.semibold,
                  color:        t.colors.semantic.text,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}
              >
                {s.name}
              </span>
            </div>

            {/* Day cells */}
            {days.map((day, dayIdx) => {
              const dk           = getDayKey(day)
              const cellBookings = grouped[dk]?.[s.id] ?? []
              const isToday      = isSameDay(day, today)

              return (
                <div
                  key={`${s.id}-${dayIdx}`}
                  onClick={() => {
                    const startAt = new Date(day)
                    startAt.setHours(9, 0, 0, 0)
                    onColumnClick(s, startAt)
                  }}
                  style={{
                    padding:       6,
                    display:       "flex",
                    flexDirection: "column",
                    gap:           4,
                    minWidth:      0,
                    overflow:      "hidden",
                    borderLeft:    `1px solid ${t.colors.semantic.divider}`,
                    borderBottom:  isLastRow
                      ? undefined
                      : `1px solid ${t.colors.semantic.divider}`,
                    background:    isToday
                      ? t.colors.component.badge.todayBg
                      : undefined,
                    cursor:        "cell",
                  }}
                >
                  {cellBookings.map((b) => (
                    <BookingPill
                      key={b.id}
                      booking={b}
                      staff={s}
                      onStatusChange={onStatusChange}
                      onBookingClick={onBookingClick}
                    />
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        )
      })}
    </div>
  )
}
