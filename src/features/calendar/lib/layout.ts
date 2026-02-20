import { minutesSinceDayStart } from "@/features/calendar/lib/time"
import { DAY_END_HOUR } from "@/features/calendar/lib/grid-config"
import type { Booking } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PositionedBooking extends Booking {
  /** Pixel offset from the top of the day column. */
  top: number
  /** Pixel height (minimum 22 px). */
  height: number
  /** 0-based index of the lane this booking occupies within its cluster. */
  laneIndex: number
  /** Total number of lanes in this booking's overlap cluster. */
  laneCount: number
}

export interface LayoutOpts {
  dayStartHour: number
  dayStartMinute: number
  pxPerMinute: number
  slotMinutes: number
}

// ---------------------------------------------------------------------------
// layoutBookings
// ---------------------------------------------------------------------------

/**
 * Takes an unordered list of Booking objects and returns PositionedBooking[]
 * with pixel position, height, and lane information for overlap-free rendering.
 *
 * Algorithm overview
 * ──────────────────
 * 1. Filter bookings that are entirely outside the visible day range.
 * 2. Sort by startAt ascending; ties broken by longer duration first so that
 *    wider events claim lower lane indices.
 * 3. Greedy lane assignment: each booking goes into the first lane whose last
 *    occupant has already ended (lastEnd ≤ booking.startAt).
 * 4. Cluster sweep: scan sorted bookings and group consecutive ones that
 *    overlap with at least one neighbour. When a gap is found (next startAt
 *    ≥ current cluster's max endAt), finalise the cluster and record laneCount
 *    = (max lane index within cluster) + 1 for every booking in it.
 */
export function layoutBookings(
  bookings: Booking[],
  opts: LayoutOpts,
): PositionedBooking[] {
  const { dayStartHour, dayStartMinute, pxPerMinute } = opts
  const dayStartTotalMin = dayStartHour * 60 + dayStartMinute
  const visibleMinutes = DAY_END_HOUR * 60 - dayStartTotalMin

  /** Minutes elapsed since day-start for a given Date. */
  function off(d: Date): number {
    return minutesSinceDayStart(d, dayStartHour, dayStartMinute)
  }

  // ── 1. Filter ────────────────────────────────────────────────────────────
  const visible = bookings.filter(
    (b) => off(b.endAt) > 0 && off(b.startAt) < visibleMinutes,
  )
  if (visible.length === 0) return []

  // ── 2. Sort ──────────────────────────────────────────────────────────────
  const sorted = [...visible].sort((a, b) => {
    const startDiff = a.startAt.getTime() - b.startAt.getTime()
    if (startDiff !== 0) return startDiff
    // Equal start → longer duration first
    return b.endAt.getTime() - a.endAt.getTime()
  })

  // ── 3. Greedy lane assignment ─────────────────────────────────────────────
  // lanes[l] = the endAt offset (minutes from dayStart) of the last booking
  // placed in lane l. A lane is available when its end ≤ candidate's start.
  const lanes: number[] = []
  const laneOf: number[] = []

  for (const b of sorted) {
    const sMin = off(b.startAt)
    const eMin = off(b.endAt)
    const available = lanes.findIndex((end) => end <= sMin)
    const lane = available === -1 ? lanes.length : available
    if (available === -1) lanes.push(eMin)
    else lanes[lane] = eMin
    laneOf.push(lane)
  }

  // ── 4. Cluster sweep + finalisation ──────────────────────────────────────
  const result: PositionedBooking[] = []
  let clusterStart = 0
  let clusterMaxEnd = off(sorted[0].endAt)

  /**
   * Finalise bookings [clusterStart, endIdx) into PositionedBookings,
   * computing the shared laneCount from the max lane index in the cluster.
   */
  function finalizeCluster(endIdx: number): void {
    const laneCount = Math.max(...laneOf.slice(clusterStart, endIdx)) + 1
    for (let j = clusterStart; j < endIdx; j++) {
      const b = sorted[j]
      const sMin = Math.max(off(b.startAt), 0)
      const eMin = Math.min(off(b.endAt), visibleMinutes)
      result.push({
        ...b,
        top: sMin * pxPerMinute,
        height: Math.max((eMin - sMin) * pxPerMinute, 22),
        laneIndex: laneOf[j],
        laneCount,
      })
    }
  }

  for (let i = 1; i <= sorted.length; i++) {
    // Always finalise on the last iteration
    if (i === sorted.length) {
      finalizeCluster(i)
      break
    }

    const sMin = off(sorted[i].startAt)
    const eMin = off(sorted[i].endAt)

    if (sMin >= clusterMaxEnd) {
      // Gap found → close current cluster, open a new one starting at i
      finalizeCluster(i)
      clusterStart = i
      clusterMaxEnd = eMin
    } else {
      // Still inside the same cluster — extend its end boundary
      clusterMaxEnd = Math.max(clusterMaxEnd, eMin)
    }
  }

  return result
}
