import { t } from "@/lib/tokens"
import { minutesSinceDayStart, formatTime } from "@/features/calendar/lib/time"
import {
  DAY_START_HOUR,
} from "@/features/calendar/lib/grid-config"
import type { Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CARD_PADDING = 4 // must match StaffDayColumn.CARD_PADDING

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BookingGhostProps {
  staff: Staff
  startAt: Date
  endAt: Date
  /** Live pxPerMinute from zoom. */
  pxPerMinute: number
  /**
   * When true the ghost is rendered in error colours to signal that
   * dropping here would create a conflict.
   */
  hasConflict?: boolean
}

/**
 * Translucent dashed preview shown while dragging or resizing a booking.
 * Renders absolutely inside its StaffDayColumn (position: relative).
 * Always full column width (ignoring lane layout) for maximum visibility.
 */
export function BookingGhost({
  staff,
  startAt,
  endAt,
  pxPerMinute,
  hasConflict = false,
}: BookingGhostProps) {
  const startMin = Math.max(minutesSinceDayStart(startAt, DAY_START_HOUR), 0)
  const endMin   = minutesSinceDayStart(endAt, DAY_START_HOUR)
  const top      = startMin * pxPerMinute
  const height   = Math.max((endMin - startMin) * pxPerMinute, 22)

  const borderColor = hasConflict ? t.colors.semantic.error  : staff.color
  const bgColor     = hasConflict
    ? hexToRgba(t.colors.semantic.error, 0.10)
    : hexToRgba(staff.color, 0.10)
  const labelColor  = hasConflict ? t.colors.semantic.error  : staff.color

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top,
        left: CARD_PADDING,
        right: CARD_PADDING,
        height,
        borderRadius: t.radius.sm,
        background: bgColor,
        border: `2px dashed ${borderColor}`,
        // z-index 7 — above booking cards (no explicit z-index) and grid lines,
        // below the now line (8) and sticky header (12).
        zIndex: 7,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.semibold,
          color: labelColor,
          opacity: 0.9,
          userSelect: "none",
          letterSpacing: 0.2,
        }}
      >
        {hasConflict ? "Conflict" : formatTime(startAt)}
      </span>
    </div>
  )
}
