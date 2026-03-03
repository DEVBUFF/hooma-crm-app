import { t } from "@/lib/tokens"
import { layoutBookings } from "@/features/calendar/lib/layout"
import { BookingCard } from "@/features/calendar/components/BookingCard"
import { BookingGhost } from "@/features/calendar/components/BookingGhost"
import { snapMinutes } from "@/features/calendar/lib/time"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"
import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  SLOT_MINUTES,
  SLOT_COUNT,
  slotHeightPx,
  totalHeightPx,
} from "@/features/calendar/lib/grid-config"

// ---------------------------------------------------------------------------
// Lane geometry constants
// ---------------------------------------------------------------------------

/** Maximum lanes rendered side-by-side. Cards in lanes ≥ this are clamped
 *  to the last visible lane and overlap visually. */
const MAX_VISIBLE_LANES = 3

/** Horizontal inset from the column edge to the card area (each side). */
const CARD_PADDING = 4 // px

/** Gap between adjacent lanes inside the same overlap cluster. */
const CARD_GAP = 3 // px

/** Total visible minutes in the day (08:00 → 20:00). */
const DAY_TOTAL_MIN = (DAY_END_HOUR - DAY_START_HOUR) * 60

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format minutes-since-day-start into "H:MM am/pm". */
function formatSlotTime(totalMinutes: number): string {
  const absMin = Math.max(0, totalMinutes)
  const h = DAY_START_HOUR + Math.floor(absMin / 60)
  const m = Math.round(absMin % 60)
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const ampm = h < 12 ? "am" : "pm"
  const mm = String(m).padStart(2, "0")
  return `${h12}:${mm} ${ampm}`
}

// ---------------------------------------------------------------------------
// Lane geometry — returns percentage-based left & width so cards stretch
// with the column.  CARD_PADDING & CARD_GAP are expressed in px and
// converted to % relative to the column using a CSS calc() string.
// ---------------------------------------------------------------------------

function laneGeometry(
  visLaneIndex: number,
  visLaneCount: number,
): { leftCss: string; widthCss: string } {
  // Total px consumed by padding + gaps
  const fixedPx    = 2 * CARD_PADDING + (visLaneCount - 1) * CARD_GAP
  // Each lane's width in CSS
  const laneWidthCss = `calc((100% - ${fixedPx}px) / ${visLaneCount})`
  // Left offset: padding + n × (laneWidth + gap)
  const leftOffsetPx = CARD_PADDING + visLaneIndex * CARD_GAP
  const leftParts    = visLaneIndex > 0
    ? `calc(${leftOffsetPx}px + ${visLaneIndex} * (100% - ${fixedPx}px) / ${visLaneCount})`
    : `${CARD_PADDING}px`

  return {
    leftCss:  leftParts,
    widthCss: laneWidthCss,
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GhostData {
  startAt: Date
  endAt: Date
  hasConflict: boolean
}

interface StaffDayColumnProps {
  staff: Staff
  /** Bookings already filtered to this staff member and the current week. */
  bookings: Booking[]
  /** Default day for click-to-create (today if visible, else weekStart). */
  defaultDay: Date
  /** Called when the user clicks empty space to open the create booking modal. */
  onColumnClick: (staff: Staff, startAt: Date) => void
  /** Live pxPerMinute from zoom. Controls all vertical pixel calculations. */
  pxPerMinute: number
  /** Snapped slot-start in minutes (multiple of 15). null = not hovering this column. */
  hoverSlotMin?: number | null
  /**
   * Non-null when this column is the current drag/resize ghost target.
   * The ghost renders at the given time span (full column width).
   */
  ghost: GhostData | null
  /**
   * The booking currently being dragged/resized (its original card is hidden
   * in the target column, or rendered faded in any other column).
   */
  draggedBookingId: string | null
  /** Called on pointerdown on a card body to initiate a drag. */
  onDragStart: (e: React.PointerEvent, booking: Booking) => void
  /** Called on pointerdown on a card's bottom resize handle. */
  onResizeStart: (e: React.PointerEvent, booking: Booking) => void
  /** Called when the user selects a quick-action status from the kebab dropdown. */
  onStatusChange: (id: string, status: BookingStatus) => void
  /** Called when the user clicks (taps) a booking card. */
  onBookingClick?: (booking: Booking) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StaffDayColumn({
  staff,
  bookings,
  defaultDay,
  onColumnClick,
  pxPerMinute,
  hoverSlotMin = null,
  ghost,
  draggedBookingId,
  onDragStart,
  onResizeStart,
  onStatusChange,
  onBookingClick,
}: StaffDayColumnProps) {
  const sh = slotHeightPx(pxPerMinute)
  const th = totalHeightPx(pxPerMinute)

  const layoutOpts = {
    dayStartHour:   DAY_START_HOUR,
    dayStartMinute: 0,
    pxPerMinute,
    slotMinutes:    SLOT_MINUTES,
  }
  const positioned = layoutBookings(bookings, layoutOpts)

  /**
   * Convert click Y into a snapped start time and open the create-booking
   * modal via the parent callback. Cards call e.stopPropagation() so this
   * handler is only reached for clicks on the empty grid background.
   */
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const rawMin    = (e.clientY - rect.top) / pxPerMinute
    const snappedMin = snapMinutes(rawMin, SLOT_MINUTES)
    const clampedMin = Math.max(0, Math.min(snappedMin, DAY_TOTAL_MIN))

    const startAt = new Date(defaultDay)
    startAt.setHours(
      DAY_START_HOUR + Math.floor(clampedMin / 60),
      clampedMin % 60,
      0,
      0,
    )
    onColumnClick(staff, startAt)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        flex: 1,
        minWidth: 0,
        position: "relative",
        height: th,
        borderLeft: `1px solid ${t.colors.semantic.divider}`,
        cursor: "cell",
      }}
    >
      {/* ── Background grid lines ──────────────────────────────────────
          Hour boundaries use a strong visible line;
          15-min marks use a lighter but still visible line.
      ──────────────────────────────────────────────────────────────── */}
      {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => {
        const isHour = i % 4 === 0
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left:   0,
              right:  0,
              top:    i * sh,
              height: 1,
              background: isHour
                ? t.colors.semantic.textSubtle
                : t.colors.semantic.divider,
              opacity:     isHour ? 0.4 : 0.7,
              pointerEvents: "none",
            }}
          />
        )
      })}

      {/* ── Booking cards ──────────────────────────────────────────────
          • If a booking is being dragged AND ghost is in this column →
            hide the original (the ghost replaces it visually).
          • If a booking is being dragged AND ghost is elsewhere →
            show it faded so the user can see the origin.
      ──────────────────────────────────────────────────────────────── */}
      {positioned.map((pb) => {
        if (pb.id === draggedBookingId && ghost !== null) return null

        const visLaneCount = Math.min(pb.laneCount, MAX_VISIBLE_LANES)
        const visLaneIndex = Math.min(pb.laneIndex, MAX_VISIBLE_LANES - 1)
        const { leftCss, widthCss } = laneGeometry(visLaneIndex, visLaneCount)

        return (
          <BookingCard
            key={pb.id}
            booking={pb}
            staff={staff}
            top={pb.top}
            height={pb.height}
            left={leftCss}
            width={widthCss}
            isDragging={pb.id === draggedBookingId}
            onDragStart={(e) => onDragStart(e, pb)}
            onResizeStart={(e) => onResizeStart(e, pb)}
            onStatusChange={(status) => onStatusChange(pb.id, status)}
            onBookingClick={onBookingClick}
          />
        )
      })}

      {/* ── Hover 15-min slot highlight ──────────────────────────── */}
      {hoverSlotMin !== null && (
        <div
          aria-hidden="true"
          style={{
            position:      "absolute",
            top:           hoverSlotMin * pxPerMinute,
            left:          0,
            right:         0,
            height:        sh,
            zIndex:        6,
            pointerEvents: "none",
            background:    `color-mix(in srgb, ${t.colors.semantic.accent} 8%, transparent)`,
            display:       "flex",
            alignItems:    "center",
            paddingLeft:   6,
          }}
        >
          <span
            style={{
              fontSize:    11,
              fontWeight:  t.typography.fontWeight.semibold,
              color:       t.colors.semantic.accent,
              lineHeight:  1,
              userSelect:  "none",
              whiteSpace:  "nowrap",
            }}
          >
            {formatSlotTime(hoverSlotMin)}
          </span>
        </div>
      )}

      {/* ── Ghost preview (drag / resize target) ───────────────────── */}
      {ghost && (
        <BookingGhost
          staff={staff}
          startAt={ghost.startAt}
          endAt={ghost.endAt}
          pxPerMinute={pxPerMinute}
          hasConflict={ghost.hasConflict}
        />
      )}
    </div>
  )
}
