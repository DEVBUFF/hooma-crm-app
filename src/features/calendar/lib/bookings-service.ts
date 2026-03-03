import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Booking, BookingStatus } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Firestore document shape
// ---------------------------------------------------------------------------

/** What we store in Firestore (Dates become Timestamps). */
export interface BookingDoc {
  staffId:              string
  startAt:              Timestamp
  endAt:                Timestamp
  customerId?:          string
  serviceId?:           string
  petId?:               string
  customerNameSnapshot: string
  serviceNameSnapshot:  string
  petNameSnapshot?:     string
  priceSnapshot?:       string
  status:               BookingStatus
  createdAt?:           Timestamp
  updatedAt?:           Timestamp
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collection reference for bookings under a salon. */
export function bookingsCol(salonId: string) {
  return collection(db, "salons", salonId, "bookings")
}

/** Single doc reference. */
export function bookingDoc(salonId: string, bookingId: string) {
  return doc(db, "salons", salonId, "bookings", bookingId)
}

/** Convert a Firestore doc → our app-level Booking (Timestamps → Dates). */
export function docToBooking(
  id: string,
  data: Record<string, unknown>,
): Booking {
  return {
    id,
    staffId:              data.staffId as string,
    startAt:              (data.startAt as Timestamp).toDate(),
    endAt:                (data.endAt as Timestamp).toDate(),
    customerId:           (data.customerId as string | undefined) ?? undefined,
    serviceId:            (data.serviceId as string | undefined) ?? undefined,
    petId:                (data.petId as string | undefined) ?? undefined,
    customerNameSnapshot: data.customerNameSnapshot as string,
    serviceNameSnapshot:  data.serviceNameSnapshot as string,
    petNameSnapshot:      (data.petNameSnapshot as string | undefined) ?? undefined,
    priceSnapshot:        (data.priceSnapshot as string | undefined) ?? undefined,
    status:               data.status as BookingStatus,
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/** Create a new booking. Returns the generated Firestore doc ID. */
export async function createBooking(
  salonId: string,
  booking: Omit<Booking, "id">,
): Promise<string> {
  const ref = await addDoc(bookingsCol(salonId), {
    staffId:              booking.staffId,
    startAt:              Timestamp.fromDate(booking.startAt),
    endAt:                Timestamp.fromDate(booking.endAt),
    customerId:           booking.customerId ?? null,
    serviceId:            booking.serviceId ?? null,
    petId:                booking.petId ?? null,
    customerNameSnapshot: booking.customerNameSnapshot,
    serviceNameSnapshot:  booking.serviceNameSnapshot,
    petNameSnapshot:      booking.petNameSnapshot ?? null,
    priceSnapshot:        booking.priceSnapshot ?? null,
    status:               booking.status,
    createdAt:            serverTimestamp(),
    updatedAt:            serverTimestamp(),
  })
  return ref.id
}

/** Update an existing booking (partial). */
export async function updateBooking(
  salonId: string,
  bookingId: string,
  updates: Partial<Omit<Booking, "id">>,
): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }

  if (updates.staffId !== undefined)              payload.staffId = updates.staffId
  if (updates.startAt !== undefined)              payload.startAt = Timestamp.fromDate(updates.startAt)
  if (updates.endAt !== undefined)                payload.endAt   = Timestamp.fromDate(updates.endAt)
  if (updates.customerId !== undefined)           payload.customerId           = updates.customerId ?? null
  if (updates.serviceId !== undefined)            payload.serviceId            = updates.serviceId ?? null
  if (updates.petId !== undefined)                payload.petId                = updates.petId ?? null
  if (updates.customerNameSnapshot !== undefined) payload.customerNameSnapshot = updates.customerNameSnapshot
  if (updates.serviceNameSnapshot !== undefined)  payload.serviceNameSnapshot  = updates.serviceNameSnapshot
  if (updates.petNameSnapshot !== undefined)      payload.petNameSnapshot      = updates.petNameSnapshot ?? null
  if (updates.priceSnapshot !== undefined)        payload.priceSnapshot        = updates.priceSnapshot
  if (updates.status !== undefined)               payload.status               = updates.status

  await updateDoc(bookingDoc(salonId, bookingId), payload)
}

/** Delete a booking. */
export async function deleteBooking(
  salonId: string,
  bookingId: string,
): Promise<void> {
  await deleteDoc(bookingDoc(salonId, bookingId))
}
