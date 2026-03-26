"use client"

import { useCallback, useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { CalendarCustomer, CalendarPet } from "@/features/calendar/types"

/**
 * Fetch customers and their pets from Firestore for calendar dropdowns.
 * Returns a flat customer array where each customer includes a `pets` array.
 */
export function useCalendarCustomers(salonId: string | null | undefined) {
  const [customers, setCustomers] = useState<CalendarCustomer[]>([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    if (!salonId) {
      setCustomers([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const custQ = query(
        collection(db, "salons", salonId, "customers"),
        orderBy("name"),
      )
      const custSnap = await getDocs(custQ)

      const items: CalendarCustomer[] = await Promise.all(
        custSnap.docs.map(async (d) => {
          const data = d.data()

          // Fetch pets sub-collection
          const petsSnap = await getDocs(
            collection(db, "salons", salonId, "customers", d.id, "pets"),
          )
          const pets: CalendarPet[] = petsSnap.docs.map((p) => ({
            id:        p.id,
            name:      p.data().name as string,
            breed:     (p.data().breed as string | null) ?? null,
            allergies: (p.data().allergies as string | null) ?? null,
          }))
          pets.sort((a, b) => a.name.localeCompare(b.name))

          return {
            id:    d.id,
            name:  data.name as string,
            phone: (data.phone as string | null) ?? null,
            pets,
          }
        }),
      )

      setCustomers(items)
    } catch (err) {
      console.error("[useCalendarCustomers] Error:", err)
    } finally {
      setLoading(false)
    }
  }, [salonId])

  useEffect(() => { load() }, [load])

  return { customers, loading, reload: load } as const
}
