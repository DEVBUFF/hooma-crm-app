import { t } from "@/lib/tokens"
import { minutesSinceDayStart, diffMinutes } from "@/features/calendar/lib/time"
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

const VISIBLE_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60

/**
 * Compute pixel position and height for a booking within the visible day range.
 *
 * - top    = minutesSinceDayStart(startAt) * PX_PER_MINUTE  (clamped to 0)
 * - height = max(visibleDurationMinutes * PX_PER_MINUTE, 22)
 *
 * Returns null when the booking falls entirely outside 08:00–20:00.
 */
function getPosition(
  booking: Booking,
): { top: number; height: number } | null {
  const startOffset = minutesSinceDayStart(booking.startAt, DAY_START_HOUR)
  const endOffset   = minutesSinceDayStart(booking.endAt,   DAY_START_HOUR)

  // Entirely before day start or after day end → skip
  if (endOffset <= 0 || startOffset >= VISIBLE_MINUTES) return null

  const clampedStart = Math.max(startOffset, 0)
  const clampedEnd   = Math.min(endOffset, VISIBLE_MINUTES)

  return {
    top:    clampedStart * PX_PER_MINUTE,
    height: Math.max((clampedEnd - clampedStart) * PX_PER_MINUTE, 22),
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
        borderLeft: `1px solid ${t.colors.semantic.borderSubtle}`,
      }}
    >
      {/* ── Background grid lines ──────────────────────────────────────
          49 lines spanning 08:00 → 20:00.
          Every 4th line (hour boundary) uses the stronger divider token;
          intermediate 15-min lines use borderSubtle at reduced opacity.
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
                ? t.colors.semantic.divider      // stronger — hour boundary
                : t.colors.semantic.borderSubtle, // subtle   — 15-min mark
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
