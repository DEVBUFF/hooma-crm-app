import { t } from "@/lib/tokens"
import { BookingCard } from "@/features/calendar/components/BookingCard"
import type { Booking, Staff } from "@/features/calendar/types"

const DAY_START = 8 // 8 am
const DAY_END = 20 // 8 pm

function getPosition(
  booking: Booking,
  hourHeight: number,
): { top: number; height: number } | null {
  const sh = booking.startAt.getHours() + booking.startAt.getMinutes() / 60
  const eh = booking.endAt.getHours() + booking.endAt.getMinutes() / 60
  if (eh <= DAY_START || sh >= DAY_END) return null
  const cs = Math.max(sh, DAY_START)
  const ce = Math.min(eh, DAY_END)
  return {
    top: (cs - DAY_START) * hourHeight,
    height: (ce - cs) * hourHeight,
  }
}

interface StaffDayColumnProps {
  staff: Staff
  /** Bookings already filtered to this staff's week. */
  bookings: Booking[]
  hourHeight: number
}

export function StaffDayColumn({
  staff,
  bookings,
  hourHeight,
}: StaffDayColumnProps) {
  const totalHeight = (DAY_END - DAY_START) * hourHeight
  const hourCount = DAY_END - DAY_START

  return (
    <div
      className="flex-1 relative"
      style={{
        height: totalHeight,
        borderLeft: `1px solid ${t.colors.semantic.borderSubtle}`,
        minWidth: 120,
      }}
    >
      {/* Hour-line dividers */}
      {Array.from({ length: hourCount }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: i * hourHeight,
            height: 1,
            background: t.colors.semantic.borderSubtle,
          }}
        />
      ))}

      {/* Half-hour guide lines (lighter) */}
      {Array.from({ length: hourCount }, (_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: i * hourHeight + hourHeight / 2,
            height: 1,
            background: t.colors.semantic.borderSubtle,
            opacity: 0.4,
          }}
        />
      ))}

      {/* Booking cards */}
      {bookings.map((b) => {
        const pos = getPosition(b, hourHeight)
        if (!pos) return null
        return (
          <BookingCard
            key={b.id}
            booking={b}
            staff={staff}
            top={pos.top}
            height={pos.height}
          />
        )
      })}
    </div>
  )
}
