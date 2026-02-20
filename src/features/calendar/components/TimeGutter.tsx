import { t } from "@/lib/tokens"

const DAY_START = 8
const DAY_END = 20

function formatHour(h: number): string {
  if (h === 12) return "12 pm"
  return h < 12 ? `${h} am` : `${h - 12} pm`
}

interface TimeGutterProps {
  hourHeight: number
}

export function TimeGutter({ hourHeight }: TimeGutterProps) {
  const hours = Array.from(
    { length: DAY_END - DAY_START },
    (_, i) => i + DAY_START,
  )

  return (
    <div style={{ width: 52, flexShrink: 0 }}>
      {hours.map((hour) => (
        <div
          key={hour}
          className="flex items-start justify-end pr-3 select-none"
          style={{ height: hourHeight, paddingTop: 4 }}
        >
          <span
            style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.semantic.textSubtle,
            }}
          >
            {formatHour(hour)}
          </span>
        </div>
      ))}
    </div>
  )
}
