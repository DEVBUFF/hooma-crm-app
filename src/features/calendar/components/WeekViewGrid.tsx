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
  confirmed: { bg: t.colors.semantic.infoBg,    color: t.colors.semantic.info,      label: "Confirmed" },
  completed: { bg: t.colors.semantic.successBg, color: t.colors.semantic.success,   label: "Completed" },
  canceled:  { bg: t.colors.semantic.errorBg,   color: t.colors.semantic.error,     label: "Canceled"  },
  no_show:   { bg: t.colors.semantic.surface,   color: t.colors.semantic.textMuted, label: "No show"   },
}

const STATUS_ICON: Record<BookingStatus, string> = {
  confirmed: "✓",
  completed: "✔",
  canceled:  "✕",
  no_show:   "∅",
}

const QUICK_ACTIONS: Array<{ label: string; status: BookingStatus }> = [
  { label: "Mark as Completed", status: "completed" },
  { label: "Mark as No-show",   status: "no_show"   },
  { label: "Cancel booking",    status: "canceled"   },
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
}: {
  booking:        Booking
  staff:          Staff
  onStatusChange: (id: string, status: BookingStatus) => void
}) {
  const [hovered, setHovered] = useState(false)
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
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
      style={{
        padding:      "5px 8px",
        borderRadius: t.radius.sm,
        background:   hexToRgba(staffColor, 0.22),
        borderLeft:   `3px solid ${staffColor}`,
        display:      "flex",
        flexDirection: "column",
        gap:          2,
        minWidth:     0,
        overflow:     "hidden",
        cursor:       "default",
        transition:   `box-shadow ${t.motion.duration.fast} ${t.motion.easing.standard}`,
        boxShadow:    hovered ? t.shadow.sm : "none",
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

        {/* Kebab on hover — status dot otherwise */}
        {hovered && actions.length > 0 ? (
          <DropdownMenu>
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
                  background:     hexToRgba(staffColor, 0.28),
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

      {/* Row 2: customer · service */}
      <span
        style={{
          fontSize:     10,
          color:        t.colors.semantic.textMuted,
          overflow:     "hidden",
          textOverflow: "ellipsis",
          whiteSpace:   "nowrap",
          lineHeight:   1.3,
        }}
      >
        {booking.customerNameSnapshot} · {booking.serviceNameSnapshot}
      </span>

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
              background:   t.colors.semantic.surface,
              borderRadius: t.radius.xl,
              boxShadow:    t.shadow.lg,
              border:       `1px solid ${t.colors.semantic.divider}`,
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
                  color:      "#fff",
                  lineHeight: 1.3,
                }}
              >
                {formatTime(booking.startAt)} – {formatTime(booking.endAt)}
              </span>
              <span
                style={{
                  fontSize:   t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color:      "#fff",
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
                    borderRadius:   t.radius.full,
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
        borderRadius:        t.radius["2xl"],
        boxShadow:           t.shadow.card,
        border:              `1px solid ${t.colors.semantic.divider}`,
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
                  ? t.colors.semantic.success
                  : t.colors.semantic.textSubtle,
                userSelect: "none",
              }}
            >
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </span>

            {/* Date number — today gets a circle indicator */}
            <span
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                justifyContent: "center",
                width:          isToday ? 24 : undefined,
                height:         isToday ? 24 : undefined,
                borderRadius:   isToday ? t.radius.full : undefined,
                background:     isToday
                  ? t.colors.semantic.success
                  : undefined,
                fontSize:       t.typography.fontSize.xs,
                fontWeight:     t.typography.fontWeight.semibold,
                color:          isToday
                  ? t.colors.base.cream50
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
