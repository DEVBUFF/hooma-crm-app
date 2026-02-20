import { t } from "@/lib/tokens"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const STATUS_BG: Record<BookingStatus, string> = {
  confirmed: t.colors.semantic.primaryTint,
  completed: t.colors.semantic.successBg,
  canceled: t.colors.semantic.errorBg,
  no_show: t.colors.semantic.warningBg,
}

function pad2(n: number) {
  return n.toString().padStart(2, "0")
}

function fmt(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

interface BookingCardProps {
  booking: Booking
  staff: Staff
  top: number
  height: number
}

export function BookingCard({ booking, staff, top, height }: BookingCardProps) {
  const compact = height < 44
  const dayLabel = DAY_SHORT[booking.startAt.getDay()]

  return (
    <div
      className="absolute left-1 right-1 overflow-hidden cursor-pointer transition-all duration-150 hover:brightness-95"
      style={{
        top,
        height: Math.max(height - 2, 20),
        borderRadius: t.radius.sm,
        background: STATUS_BG[booking.status],
        borderLeft: `3px solid ${staff.color}`,
        padding: compact ? "2px 6px" : "5px 7px",
        boxShadow: t.shadow.sm,
      }}
    >
      <p
        className="font-semibold truncate leading-tight"
        style={{
          fontSize: t.typography.fontSize.xs,
          color: t.colors.semantic.textStrong,
        }}
      >
        {booking.customerNameSnapshot}
      </p>
      {!compact && (
        <p
          className="truncate leading-tight mt-0.5"
          style={{
            fontSize: t.typography.fontSize.xs,
            color: t.colors.semantic.textMuted,
          }}
        >
          {dayLabel} {fmt(booking.startAt)}–{fmt(booking.endAt)} ·{" "}
          {booking.serviceNameSnapshot}
        </p>
      )}
    </div>
  )
}
