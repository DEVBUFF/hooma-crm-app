// Shared grid constants — single source of truth for all calendar components.

export const BASE_PX_PER_MINUTE = 2  // px/min at zoom level 1.0

export const GUTTER_WIDTH  = 72   // px — time-label column width
export const COLUMN_WIDTH  = 240  // px — per-staff column width

export const DAY_START_HOUR = 8   // 08:00
export const DAY_END_HOUR   = 20  // 20:00

export const SLOT_MINUTES = 15    // grid resolution (15-min slots)
export const HOUR_COUNT   = DAY_END_HOUR - DAY_START_HOUR               // 12
export const SLOT_COUNT   = (HOUR_COUNT * 60) / SLOT_MINUTES            // 48

// Static heights at the default zoom (PX_PER_MINUTE = BASE_PX_PER_MINUTE).
// Components that support zoom should use the dynamic helpers below instead.
export const PX_PER_MINUTE = BASE_PX_PER_MINUTE                         // 2
export const HOUR_HEIGHT   = 60 * PX_PER_MINUTE                         // 120 px
export const SLOT_HEIGHT   = SLOT_MINUTES * PX_PER_MINUTE               // 30 px
export const TOTAL_HEIGHT  = HOUR_COUNT * HOUR_HEIGHT                   // 1440 px

// ---------------------------------------------------------------------------
// Dynamic helpers — pass the live pxPerMinute value from the zoom-aware layer
// ---------------------------------------------------------------------------

export function hourHeightPx(ppm: number): number {
  return 60 * ppm
}

export function slotHeightPx(ppm: number): number {
  return SLOT_MINUTES * ppm
}

export function totalHeightPx(ppm: number): number {
  return HOUR_COUNT * 60 * ppm
}

/**
 * Pixel offset from the top of the grid for a given clock time.
 * Returns null when the time falls outside [DAY_START_HOUR, DAY_END_HOUR].
 */
export function minutesToPx(
  hours: number,
  minutes: number,
  ppm: number = PX_PER_MINUTE,
): number | null {
  const totalMin = hours * 60 + minutes
  const startMin = DAY_START_HOUR * 60
  const endMin   = DAY_END_HOUR   * 60
  if (totalMin < startMin || totalMin > endMin) return null
  return (totalMin - startMin) * ppm
}
