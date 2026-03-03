"use client"

import { useCallback, useEffect, useState } from "react"
import { onSnapshot, query, orderBy } from "firebase/firestore"
import {
  bookingsCol,
  docToBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} from "@/features/calendar/lib/bookings-service"
import type { Booking } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Real-time bookings listener for a salon.
 *
 * Returns the live bookings array, a loading flag, and stable CRUD callbacks.
 * All writes go through the Firestore service layer; the `onSnapshot` listener
 * keeps the local array in sync automatically — no optimistic local mutations
 * needed.
 */
export function useBookings(salonId: string | null | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)

  // ── Real-time listener ──────────────────────────────────────────────────
  useEffect(() => {
    if (!salonId) {
      setBookings([])
      setLoading(false)
      return
    }

    setLoading(true)

    const q = query(bookingsCol(salonId), orderBy("startAt"))

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Booking[] = snap.docs.map((d) =>
          docToBooking(d.id, d.data() as Record<string, unknown>),
        )
        setBookings(items)
        setLoading(false)
      },
      (err) => {
        console.error("[useBookings] onSnapshot error:", err)
        setLoading(false)
      },
    )

    return () => unsub()
  }, [salonId])

  // ── CRUD (all fire-and-forget — snapshot auto-updates local state) ─────

  const add = useCallback(
    async (booking: Omit<Booking, "id">) => {
      if (!salonId) return
      await createBooking(salonId, booking)
    },
    [salonId],
  )

  const update = useCallback(
    async (bookingId: string, updates: Partial<Omit<Booking, "id">>) => {
      if (!salonId) return
      await updateBooking(salonId, bookingId, updates)
    },
    [salonId],
  )

  const remove = useCallback(
    async (bookingId: string) => {
      if (!salonId) return
      await deleteBooking(salonId, bookingId)
    },
    [salonId],
  )

  return { bookings, loading, add, update, remove } as const
}
