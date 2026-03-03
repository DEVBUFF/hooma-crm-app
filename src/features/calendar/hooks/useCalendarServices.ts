"use client"

import { useCallback, useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { CalendarService } from "@/features/calendar/types"

/**
 * Fetch services from Firestore for calendar dropdowns.
 */
export function useCalendarServices(salonId: string | null | undefined) {
  const [services, setServices] = useState<CalendarService[]>([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    if (!salonId) {
      setServices([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const q = query(
        collection(db, "salons", salonId, "services"),
        orderBy("name"),
      )
      const snap = await getDocs(q)

      const items: CalendarService[] = snap.docs
        .filter((d) => d.data().isActive !== false)
        .map((d) => {
          const data = d.data()
          return {
            id:              d.id,
            name:            data.name as string,
            durationMinutes: (data.durationMinutes as number) ?? 60,
            price:           (data.price as number) ?? 0,
          }
        })

      setServices(items)
    } catch (err) {
      console.error("[useCalendarServices] Error:", err)
    } finally {
      setLoading(false)
    }
  }, [salonId])

  useEffect(() => { load() }, [load])

  return { services, loading, reload: load } as const
}
