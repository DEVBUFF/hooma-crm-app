export type BookingStatus = "confirmed" | "canceled" | "completed" | "no_show"

export interface Staff {
  id: string
  name: string
  /** Hex color from t.colors.base.* */
  color: string
}

export interface Booking {
  id: string
  staffId: string
  startAt: Date
  endAt: Date
  customerNameSnapshot: string
  serviceNameSnapshot: string
  /** Optional price snapshot for display, e.g. "GEL 25". */
  priceSnapshot?: string
  status: BookingStatus
}
