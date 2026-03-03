import { t } from "@/lib/tokens"
import { GUTTER_WIDTH } from "@/features/calendar/lib/grid-config"
import type { Staff } from "@/features/calendar/types"

interface StaffHeaderRowProps {
  staff: Staff[]
}

/**
 * Sticky header that shows one labeled cell per staff member.
 *
 * Sticky behaviour
 * ────────────────
 * The row itself is position: sticky; top: 0 so it pins vertically.
 * The corner cell is also position: sticky; left: 0 so it pins horizontally,
 * keeping a clean top-left anchor while the user scrolls in either direction.
 *
 * The translucent background + backdrop-filter gives a frosted-glass look
 * over the grid content that scrolls behind the header.
 */
export function StaffHeaderRow({ staff }: StaffHeaderRowProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        // z-index 12: above TimeGutter (9), now-line (8), ghost (7), body (0)
        zIndex: t.zIndex.sticky + 2,
        display: "flex",
        // Solid background prevents grid content from showing through on scroll
        background: t.colors.semantic.panel,
        borderBottom: `1px solid ${t.colors.semantic.border}`,
        // Force GPU compositing so the sticky row never becomes translucent
        isolation: "isolate",
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      {/* Corner cell: pins to the top-left when scrolling both axes */}
      <div
        style={{
          width: GUTTER_WIDTH,
          flexShrink: 0,
          position: "sticky",
          left: 0,
          background: t.colors.semantic.panel,
          borderRight: `1px solid ${t.colors.semantic.border}`,
          zIndex: 2,
        }}
      />

      {/* Staff name cells */}
      {staff.map((s) => (
        <div
          key={s.id}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderLeft: `1px solid ${t.colors.semantic.divider}`,
          }}
        >
          {/* Staff color dot */}
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: s.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.semantic.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {s.name}
          </span>
        </div>
      ))}
    </div>
  )
}
