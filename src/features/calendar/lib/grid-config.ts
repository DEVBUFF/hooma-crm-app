// Shared grid constants — single source of truth for all calendar components.
// Change pxPerMinute here to uniformly rescale the entire grid.

export const GUTTER_WIDTH = 64    // px — time label column width
export const COLUMN_WIDTH = 160   // px — per-staff column width

export const DAY_START_HOUR = 8   // 08:00
export const DAY_END_HOUR   = 20  // 20:00

export const SLOT_MINUTES   = 15  // grid resolution
export const PX_PER_MINUTE  = 2   // vertical scale

export const HOUR_HEIGHT  = 60 * PX_PER_MINUTE                          // 120 px
export const SLOT_HEIGHT  = SLOT_MINUTES * PX_PER_MINUTE                // 30 px
export const HOUR_COUNT   = DAY_END_HOUR - DAY_START_HOUR               // 12
export const SLOT_COUNT   = (HOUR_COUNT * 60) / SLOT_MINUTES            // 48
export const TOTAL_HEIGHT = HOUR_COUNT * HOUR_HEIGHT                    // 1440 px

/** Pixel offset from the top of the grid for a given clock time. Returns null when out of range. */
export function minutesToPx(
  hours: number,
  minutes: number,
): number | null {
  const totalMin = hours * 60 + minutes
  const startMin = DAY_START_HOUR * 60
  const endMin   = DAY_END_HOUR   * 60
  if (totalMin < startMin || totalMin > endMin) return null
  return (totalMin - startMin) * PX_PER_MINUTE
}
