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

  /** Firestore refs — used for dropdown selection. */
  customerId?: string
  serviceId?: string
  petId?: string

  /** Denormalized snapshots for display on cards (avoid extra reads). */
  customerNameSnapshot: string
  serviceNameSnapshot: string
  petNameSnapshot?: string
  /** Optional price snapshot for display, e.g. "GEL 25". */
  priceSnapshot?: string

  status: BookingStatus
}

// ---------------------------------------------------------------------------
// Lookup types used by calendar dropdowns
// ---------------------------------------------------------------------------

export interface CalendarCustomer {
  id: string
  name: string
  phone?: string | null
  pets: CalendarPet[]
}

export interface CalendarPet {
  id: string
  name: string
  breed?: string | null
}

export interface CalendarService {
  id: string
  name: string
  durationMinutes: number
  price: number
}
