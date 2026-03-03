import { t } from "@/lib/tokens"
import {
  GUTTER_WIDTH,
  DAY_START_HOUR,
  HOUR_COUNT,
  SLOT_COUNT,
  hourHeightPx,
  slotHeightPx,
  totalHeightPx,
} from "@/features/calendar/lib/grid-config"

function formatHour(h: number): string {
  if (h === 12) return "12 pm"
  return h < 12 ? `${h} am` : `${h - 12} pm`
}

interface TimeGutterProps {
  /** Live pixels-per-minute value derived from current zoom. */
  pxPerMinute: number
}

/**
 * Sticky-left time-label column.
 * Renders hour labels aligned to grid lines plus subtle 15-min tick marks.
 * Accepts pxPerMinute so vertical scale stays in sync with zoom.
 */
export function TimeGutter({ pxPerMinute }: TimeGutterProps) {
  const hh = hourHeightPx(pxPerMinute)
  const sh = slotHeightPx(pxPerMinute)
  const th = totalHeightPx(pxPerMinute)

  return (
    <div
      style={{
        width: GUTTER_WIDTH,
        flexShrink: 0,
        // Sticks to the left edge of the scroll container when scrolling horizontally
        position: "sticky",
        left: 0,
        // Above ghost (7) and now-line (8); below sticky header (12)
        zIndex: 9,
        background: t.colors.semantic.panel,
        borderRight: `1px solid ${t.colors.semantic.border}`,
      }}
    >
      <div style={{ position: "relative", height: th }}>
        {/* ── Hour labels ───────────────────────────────────────────── */}
        {Array.from({ length: HOUR_COUNT }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * hh,
              left: 0,
              right: 0,
              // Nudge label 4 px below the grid line so it doesn't sit on it
              paddingTop: 4,
              paddingRight: 8,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.semantic.textSubtle,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {formatHour(DAY_START_HOUR + i)}
            </span>
          </div>
        ))}

        {/* ── 15-min tick marks on the right edge (skip hour boundaries) ── */}
        {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => {
          const isHour = i % 4 === 0
          if (isHour) return null
          return (
            <div
              key={`tick-${i}`}
              style={{
                position: "absolute",
                right: 0,
                top: i * sh,
                width: 6,
                height: 1,
                background: t.colors.semantic.borderSubtle,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
