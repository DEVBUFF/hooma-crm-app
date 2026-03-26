"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { t } from "@/lib/tokens"
import { formatTime, diffMinutes, formatDuration } from "@/features/calendar/lib/time"
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
// Status config — all colors from tokens
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  BookingStatus,
  { bg: string; color: string; label: string }
> = {
  scheduled:   { bg: "var(--color-status-scheduled-bg)",    color: "var(--color-status-scheduled)",    label: "Scheduled"   },
  confirmed:   { bg: "var(--color-status-confirmed-bg)",    color: "var(--color-status-confirmed)",    label: "Confirmed"   },
  in_progress: { bg: "var(--color-status-in-progress-bg)",  color: "var(--color-status-in-progress)",  label: "In progress" },
  completed:   { bg: "var(--color-status-completed-bg)",    color: "var(--color-status-completed)",    label: "Completed"   },
  canceled:    { bg: "var(--color-status-cancelled-bg)",    color: "var(--color-status-cancelled)",    label: "Cancelled"   },
  no_show:     { bg: "var(--color-status-no-show-bg)",      color: "var(--color-status-no-show)",      label: "No-show"     },
}

// ---------------------------------------------------------------------------
// Status icons — simple Unicode glyphs for the hover popover
// ---------------------------------------------------------------------------

const STATUS_ICON: Record<BookingStatus, string> = {
  scheduled:   "◦",
  confirmed:   "✓",
  in_progress: "▶",
  completed:   "✔",
  canceled:    "✕",
  no_show:     "∅",
}

// ---------------------------------------------------------------------------
// Quick-action transitions available in the kebab dropdown
// ---------------------------------------------------------------------------

const QUICK_ACTIONS: Array<{ label: string; status: BookingStatus }> = [
  { label: "Start grooming",    status: "in_progress" },
  { label: "Mark as Completed", status: "completed"   },
  { label: "Mark as No-show",   status: "no_show"     },
  { label: "Cancel booking",    status: "canceled"     },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BookingCardProps {
  booking: Booking
  staff: Staff
  /** Pixel offset from top of the day column. */
  top: number
  /** Pixel height (already has 22 px minimum applied by caller). */
  height: number
  /** Offset from the left edge of the column — px number or CSS calc() string. */
  left: number | string
  /** Width of the card — px number or CSS calc() string. */
  width: number | string
  /** True while this booking is being dragged — renders faded origin ghost. */
  isDragging?: boolean
  /** Called on pointerdown on the card body to initiate a drag. */
  onDragStart: (e: React.PointerEvent) => void
  /** Called on pointerdown on the bottom resize handle. */
  onResizeStart: (e: React.PointerEvent) => void
  /** Called when the user selects a quick-action status from the dropdown. */
  onStatusChange: (status: BookingStatus) => void
  /** Called when the user clicks the card (tap without drag). */
  onBookingClick?: (booking: Booking) => void
}

export function BookingCard({
  booking,
  staff,
  top,
  height,
  left,
  width,
  isDragging = false,
  onDragStart,
  onResizeStart,
  onStatusChange,
  onBookingClick,
}: BookingCardProps) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)

  // Track pointer position to distinguish click from drag
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  // Compute popover position when hovered
  useEffect(() => {
    if (!hovered || isDragging) {
      setPopoverPos(null)
      return
    }
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPopoverPos({ top: rect.top, left: rect.right + 8 })
  }, [hovered, isDragging])

  // Subtract 2 px so adjacent bookings have a small visual gap; never go below 22 px.
  const cardHeight = Math.max(height - 2, 22)
  // Below 50 px (~25 min) there is only room for the name row.
  const compact = cardHeight < 50

  const status  = STATUS_CONFIG[booking.status]
  const cardBg  = hexToRgba(staff.color, isDragging ? 0.12 : 0.28)
  // Actions filtered to exclude the current status (no-op transition)
  const actions = QUICK_ACTIONS.filter((a) => a.status !== booking.status)

  const durationMin = diffMinutes(booking.startAt, booking.endAt)
  const durationStr = formatDuration(durationMin)

  return (
    <div
      ref={cardRef}
      data-booking-card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!menuOpen) setHovered(false) }}
      onClick={(e) => {
        e.stopPropagation()
        // Only fire if pointer didn't travel far (click, not drag)
        const start = pointerStartRef.current
        if (start && onBookingClick) {
          const dx = e.clientX - start.x
          const dy = e.clientY - start.y
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            onBookingClick(booking)
          }
        }
        pointerStartRef.current = null
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        pointerStartRef.current = { x: e.clientX, y: e.clientY }
        onDragStart(e)
      }}
      style={{
        position: "absolute",
        top,
        left,
        width,
        height: cardHeight,
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.35 : 1,
        transition: `opacity ${t.motion.duration.fast} ${t.motion.easing.standard}`,
        userSelect: "none",
      }}
    >
      {/* ── Card body (clipped) ────────────────────────────────────── */}
      <div
        style={{
          width:          "100%",
          height:         "100%",
          borderRadius:   t.radius.sm,
          background:     cardBg,
          borderLeft:     `3px solid ${staff.color}`,
          boxShadow:      hovered && !isDragging ? `0 0 0 1px ${staff.color}` : "none",
          overflow:       "hidden",
          padding:        compact ? "3px 7px" : "6px 8px",
          display:        "flex",
          flexDirection:  "column",
          gap:            2,
          transition:     `box-shadow ${t.motion.duration.fast} ${t.motion.easing.standard}`,
        }}
      >
      {/* ── Top row: customer name + allergy indicator + kebab menu ── */}
      <div
        style={{
          display:        "flex",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          gap:            4,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 3 }}>
          <p
            style={{
              flex:         1,
              minWidth:     0,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
              fontSize:     t.typography.fontSize.xs,
              fontWeight:   t.typography.fontWeight.semibold,
              color:        t.colors.semantic.textStrong,
              lineHeight:   1.3,
              margin:       0,
            }}
          >
            {booking.customerNameSnapshot}
          </p>
          {booking.petAllergiesSnapshot && (
            <span
              title={booking.petAllergiesSnapshot}
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                justifyContent: "center",
                flexShrink:   0,
                width:        14,
                height:       14,
                borderRadius: "50%",
                background:   "var(--color-error-bg)",
                color:        "var(--color-error-text)",
                fontSize:     9,
                lineHeight:   1,
                cursor:       "default",
              }}
            >
              !
            </span>
          )}
        </div>

        {/* Kebab "···" — visible on hover or when menu is open, hidden while dragging */}
        {(hovered || menuOpen) && !isDragging && actions.length > 0 && (
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
                  width:          18,
                  height:         18,
                  borderRadius:   t.radius.sm,
                  background:     hexToRgba(staff.color, 0.15),
                  border:         "none",
                  cursor:         "pointer",
                  padding:        0,
                  fontSize:       11,
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
                    onStatusChange(action.status)
                  }}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* ── Detail rows — hidden when compact ──────────────────────── */}
      {!compact && (
        <>
          <p
            style={{
              margin:       0,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
              fontSize:     t.typography.fontSize.xs,
              color:        t.colors.semantic.textMuted,
              lineHeight:   1.25,
            }}
          >
            {booking.serviceNameSnapshot}
          </p>

          {/* Time range + status badge — pinned to bottom */}
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        6,
              marginTop:  "auto",
              flexWrap:   "nowrap",
              overflow:   "hidden",
            }}
          >
            <span
              style={{
                fontSize:   t.typography.fontSize.xs,
                color:      t.colors.semantic.textMuted,
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              {formatTime(booking.startAt)}–{formatTime(booking.endAt)}
            </span>

            <span
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          4,
                fontSize:     10,
                fontWeight:   t.typography.fontWeight.semibold,
                padding:      "2px 6px",
                borderRadius: 9999,
                background:   status.bg,
                color:        status.color,
                whiteSpace:   "nowrap",
                lineHeight:   1.5,
              }}
            >
              <span
                style={{
                  display:      "inline-block",
                  width:        6,
                  height:       6,
                  borderRadius: "50%",
                  background:   status.color,
                  flexShrink:   0,
                }}
              />
              {status.label}
            </span>
          </div>
        </>
      )}

      {/* ── Bottom resize handle ───────────────────────────────────── */}
      {!compact && !isDragging && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation()
            onResizeStart(e)
          }}
          style={{
            position:       "absolute",
            bottom:         0,
            left:           0,
            right:          0,
            height:         12,
            cursor:         "ns-resize",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            opacity:        hovered ? 1 : 0,
            transition:     `opacity ${t.motion.duration.fast} ${t.motion.easing.standard}`,
          }}
        >
          <div
            style={{
              width:        24,
              height:       3,
              borderRadius: 2,
              background:   staff.color,
              opacity:      0.55,
            }}
          />
        </div>
      )}
      </div>

      {/* ── Hover popover (portal, fixed positioning) ──────────────── */}
      {hovered && !isDragging && popoverPos && createPortal(
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
            {/* ── Header bar ───────────────────────────────────────── */}
            <div
              style={{
                background:    staff.color,
                padding:       "8px 12px",
                display:       "flex",
                alignItems:    "center",
                justifyContent: "space-between",
                gap:           8,
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
                  fontSize:     t.typography.fontSize.xs,
                  fontWeight:   t.typography.fontWeight.semibold,
                  color:        t.colors.semantic.textOnPrimary,
                  lineHeight:   1.3,
                }}
              >
                {status.label}
              </span>
            </div>

            {/* ── Body ─────────────────────────────────────────────── */}
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Status row with icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    width:        28,
                    height:       28,
                    borderRadius: t.radius.md,
                    background:   status.bg,
                    flexShrink:   0,
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
