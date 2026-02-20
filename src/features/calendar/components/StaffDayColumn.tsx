import { t } from "@/lib/tokens"
import { BookingCard } from "@/features/calendar/components/BookingCard"
import type { Booking, Staff } from "@/features/calendar/types"
import {
  COLUMN_WIDTH,
  DAY_START_HOUR,
  DAY_END_HOUR,
  PX_PER_MINUTE,
  SLOT_HEIGHT,
  SLOT_COUNT,
  TOTAL_HEIGHT,
} from "@/features/calendar/lib/grid-config"

const DAY_START_MINUTES = DAY_START_HOUR * 60
const DAY_END_MINUTES   = DAY_END_HOUR   * 60

/**
 * Returns the pixel position and height for a booking within the day grid.
 * Returns null if the booking falls entirely outside the visible day range.
 */
function getPosition(
  booking: Booking,
): { top: number; height: number } | null {
  const startMin =
    booking.startAt.getHours() * 60 + booking.startAt.getMinutes()
  const endMin =
    booking.endAt.getHours() * 60 + booking.endAt.getMinutes()

  if (endMin <= DAY_START_MINUTES || startMin >= DAY_END_MINUTES) return null

  const clampedStart = Math.max(startMin, DAY_START_MINUTES)
  const clampedEnd   = Math.min(endMin,   DAY_END_MINUTES)

  return {
    top:    (clampedStart - DAY_START_MINUTES) * PX_PER_MINUTE,
    height: (clampedEnd   - clampedStart)      * PX_PER_MINUTE,
  }
}

interface StaffDayColumnProps {
  staff: Staff
  /** Bookings already filtered to this staff member and the current week. */
  bookings: Booking[]
}

export function StaffDayColumn({ staff, bookings }: StaffDayColumnProps) {
  return (
    <div
      style={{
        width: COLUMN_WIDTH,
        flexShrink: 0,
        position: "relative",
        height: TOTAL_HEIGHT,
        // Left border separates staff columns; matches the header cell border
        borderLeft: `1px solid ${t.colors.semantic.borderSubtle}`,
      }}
    >
      {/* ── Background grid lines ──────────────────────────────────────
          Render one line per 15-min slot (SLOT_COUNT + 1 includes the bottom
          boundary at TOTAL_HEIGHT). Hour lines use the divider token (slightly
          stronger); quarter-hour lines use borderSubtle at reduced opacity.
      ──────────────────────────────────────────────────────────────── */}
      {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => {
        const isHour = i % 4 === 0
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: i * SLOT_HEIGHT,
              height: 1,
              background: isHour
                ? t.colors.semantic.divider       // ~stronger — hour boundary
                : t.colors.semantic.borderSubtle,  // subtle  — 15-min mark
              opacity: isHour ? 1 : 0.55,
              pointerEvents: "none",
            }}
          />
        )
      })}

      {/* ── Booking cards ──────────────────────────────────────────── */}
      {bookings.map((b) => {
        const pos = getPosition(b)
        if (!pos) return null
        return (
          <BookingCard
            key={b.id}
            booking={b}
            staff={staff}
            top={pos.top}
            height={pos.height}
          />
        )
      })}
    </div>
  )
}
