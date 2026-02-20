import { t } from "@/lib/tokens"
import type { Staff } from "@/features/calendar/types"

/** Width must match TimeGutter's fixed width. */
const GUTTER_WIDTH = 52

interface StaffHeaderRowProps {
  staff: Staff[]
}

export function StaffHeaderRow({ staff }: StaffHeaderRowProps) {
  return (
    <div
      className="flex"
      style={{
        background: t.colors.component.card.bg,
        borderBottom: `1px solid ${t.colors.semantic.border}`,
      }}
    >
      {/* Spacer aligns header with the TimeGutter */}
      <div style={{ width: GUTTER_WIDTH, flexShrink: 0 }} />

      {staff.map((s) => (
        <div
          key={s.id}
          className="flex-1 flex items-center gap-2 px-3 py-2.5"
          style={{
            borderLeft: `1px solid ${t.colors.semantic.borderSubtle}`,
            minWidth: 120,
          }}
        >
          {/* Staff color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: s.color }}
          />
          <span
            className="text-sm font-semibold truncate"
            style={{ color: t.colors.semantic.text }}
          >
            {s.name}
          </span>
        </div>
      ))}
    </div>
  )
}
