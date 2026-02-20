import { t } from "@/lib/tokens"
import { layoutBookings } from "@/features/calendar/lib/layout"
import { BookingCard } from "@/features/calendar/components/BookingCard"
import type { Booking, Staff } from "@/features/calendar/types"
import {
  COLUMN_WIDTH,
  DAY_START_HOUR,
  PX_PER_MINUTE,
  SLOT_MINUTES,
  SLOT_HEIGHT,
  SLOT_COUNT,
  TOTAL_HEIGHT,
} from "@/features/calendar/lib/grid-config"

// ---------------------------------------------------------------------------
// Lane geometry constants
// ---------------------------------------------------------------------------

/** Maximum lanes rendered side-by-side. Cards in lanes ≥ this are clamped
 *  to the last visible lane and overlap visually — keeps cards readable. */
const MAX_VISIBLE_LANES = 3

/** Horizontal inset from the column edge to the card area (each side). */
const CARD_PADDING = 4 // px

/** Gap between adjacent lanes inside the same overlap cluster. */
const CARD_GAP = 3 // px

/** Options passed to the layout engine — matches grid-config. */
const LAYOUT_OPTS = {
  dayStartHour:   DAY_START_HOUR,
  dayStartMinute: 0,
  pxPerMinute:    PX_PER_MINUTE,
  slotMinutes:    SLOT_MINUTES,
}

// ---------------------------------------------------------------------------
// Lane width helper
// ---------------------------------------------------------------------------

/**
 * Returns the { left, width } in pixels for a card inside a column, given its
 * visual lane index and the total number of visual lanes.
 *
 * Cards are distributed evenly across the available column width (minus
 * CARD_PADDING on each side), separated by CARD_GAP.
 */
function laneGeometry(
  visLaneIndex: number,
  visLaneCount: number,
): { left: number; width: number } {
  const available = COLUMN_WIDTH - 2 * CARD_PADDING
  const laneWidth = (available - (visLaneCount - 1) * CARD_GAP) / visLaneCount
  const left = CARD_PADDING + visLaneIndex * (laneWidth + CARD_GAP)
  return { left, width: laneWidth }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StaffDayColumnProps {
  staff: Staff
  /** Bookings already filtered to this staff member and the current week. */
  bookings: Booking[]
}

export function StaffDayColumn({ staff, bookings }: StaffDayColumnProps) {
  const positioned = layoutBookings(bookings, LAYOUT_OPTS)

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
                ? t.colors.semantic.divider       // stronger — hour boundary
                : t.colors.semantic.borderSubtle,  // subtle   — 15-min mark
              opacity: isHour ? 1 : 0.55,
              pointerEvents: "none",
            }}
          />
        )
      })}

      {/* ── Booking cards ──────────────────────────────────────────────
          Clamp to MAX_VISIBLE_LANES visual lanes.
          Cards in lanes ≥ MAX_VISIBLE_LANES share the last visual lane and
          overlap slightly — acceptable for dense schedules on a scaffold.
      ──────────────────────────────────────────────────────────────── */}
      {positioned.map((pb) => {
        const visLaneCount = Math.min(pb.laneCount, MAX_VISIBLE_LANES)
        const visLaneIndex = Math.min(pb.laneIndex, MAX_VISIBLE_LANES - 1)
        const { left, width } = laneGeometry(visLaneIndex, visLaneCount)

        return (
          <BookingCard
            key={pb.id}
            booking={pb}
            staff={staff}
            top={pb.top}
            height={pb.height}
            left={left}
            width={width}
          />
        )
      })}
    </div>
  )
}
