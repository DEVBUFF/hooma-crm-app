"use client"

import { useState } from "react"
import { t } from "@/lib/tokens"
import { formatTime } from "@/features/calendar/lib/time"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a 6-digit hex color to rgba(..., alpha). */
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
  confirmed: {
    bg:    t.colors.semantic.infoBg,
    color: t.colors.semantic.info,
    label: "Confirmed",
  },
  completed: {
    bg:    t.colors.semantic.successBg,
    color: t.colors.semantic.success,
    label: "Completed",
  },
  canceled: {
    bg:    t.colors.semantic.errorBg,
    color: t.colors.semantic.error,
    label: "Canceled",
  },
  no_show: {
    bg:    t.colors.semantic.errorBg,
    color: t.colors.semantic.error,
    label: "No show",
  },
}

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
}

export function BookingCard({ booking, staff, top, height }: BookingCardProps) {
  const [hovered, setHovered] = useState(false)

  // Subtract 2 px so adjacent bookings have a small visual gap; never go below 22 px.
  const cardHeight = Math.max(height - 2, 22)
  // Below 50 px (~25 min) there is only room for the name row.
  const compact = cardHeight < 50

  const status = STATUS_CONFIG[booking.status]
  const cardBg = hexToRgba(staff.color, 0.16)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        top,
        left: 4,
        right: 4,
        height: cardHeight,
        borderRadius: t.radius.lg,
        background: cardBg,
        borderLeft: `3px solid ${staff.color}`,
        boxShadow: hovered ? t.shadow.md : t.shadow.sm,
        overflow: "hidden",
        cursor: "pointer",
        padding: compact ? "3px 7px" : "6px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        transition: `box-shadow ${t.motion.duration.fast} ${t.motion.easing.standard}`,
      }}
    >
      {/* ── Top row: customer name + hover menu trigger ────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <p
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.semantic.textStrong,
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {booking.customerNameSnapshot}
        </p>

        {/* Placeholder "…" menu — visible only on hover */}
        {hovered && (
          <button
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 18,
              height: 18,
              borderRadius: t.radius.sm,
              background: hexToRgba(staff.color, 0.22),
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: 11,
              letterSpacing: 1,
              color: t.colors.semantic.textMuted,
              lineHeight: 1,
            }}
          >
            ···
          </button>
        )}
      </div>

      {/* ── Detail rows — hidden when compact ──────────────────────── */}
      {!compact && (
        <>
          {/* Service name */}
          <p
            style={{
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.semantic.textMuted,
              lineHeight: 1.25,
            }}
          >
            {booking.serviceNameSnapshot}
          </p>

          {/* Time range + status badge — pinned to bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: "auto",
              flexWrap: "nowrap",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.semantic.textMuted,
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              {formatTime(booking.startAt)}–{formatTime(booking.endAt)}
            </span>

            <span
              style={{
                fontSize: 10,
                fontWeight: t.typography.fontWeight.semibold,
                padding: "2px 6px",
                borderRadius: t.radius.full,
                background: status.bg,
                color: status.color,
                whiteSpace: "nowrap",
                lineHeight: 1.5,
              }}
            >
              {status.label}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
