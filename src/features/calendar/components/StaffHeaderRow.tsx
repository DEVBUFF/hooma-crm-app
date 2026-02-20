import { t } from "@/lib/tokens"
import { GUTTER_WIDTH, COLUMN_WIDTH } from "@/features/calendar/lib/grid-config"
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
  // Semi-transparent variant of card.bg for the frosted-glass effect.
  // "e0" hex suffix = ~88 % opacity so backdrop-filter blur shows through.
  const headerBg = t.colors.component.card.bg + "e0"

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: t.zIndex.sticky, // 10 — above TimeGutter (5) and body content (0)
        display: "flex",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: headerBg,
        borderBottom: `1px solid ${t.colors.semantic.border}`,
      }}
    >
      {/* Corner cell: pins to the top-left when scrolling both axes */}
      <div
        style={{
          width: GUTTER_WIDTH,
          flexShrink: 0,
          position: "sticky",
          left: 0,
          // Solid background so scrolled grid content doesn't show through
          background: t.colors.component.card.bg,
          borderRight: `1px solid ${t.colors.semantic.border}`,
          // Raise above sibling staff cells so it covers them when scrolling right
          zIndex: 1,
        }}
      />

      {/* Staff name cells */}
      {staff.map((s) => (
        <div
          key={s.id}
          style={{
            width: COLUMN_WIDTH,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderLeft: `1px solid ${t.colors.semantic.borderSubtle}`,
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
