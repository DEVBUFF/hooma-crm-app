"use client"

import { useCallback, useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { t } from "@/lib/tokens"
import type { Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Color palette for calendar columns — cycles when there are more staff
// ---------------------------------------------------------------------------

const STAFF_COLORS = [
  t.colors.base.blue500,
  t.colors.base.coral500,
  t.colors.base.green600,
  t.colors.base.blue600,
  t.colors.base.brown500,
  t.colors.base.coral550,
  t.colors.base.green650,
  t.colors.base.blue550,
]

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetch active staff members from Firestore and map them to the calendar
 * `Staff` type (id + name + color). Colors are auto-assigned from a palette.
 */
export function useCalendarStaff(salonId: string | null | undefined) {
  const [staff, setStaff]     = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!salonId) {
      setStaff([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const q = query(
        collection(db, "salons", salonId, "staff"),
        orderBy("name"),
      )
      const snap = await getDocs(q)
      const items: Staff[] = snap.docs
        .filter((d) => d.data().isActive !== false)      // skip deactivated
        .map((d, i) => ({
          id:    d.id,
          name:  d.data().name as string,
          color: STAFF_COLORS[i % STAFF_COLORS.length],
        }))

      setStaff(items)
    } catch (err) {
      console.error("[useCalendarStaff] Error fetching staff:", err)
    } finally {
      setLoading(false)
    }
  }, [salonId])

  useEffect(() => { load() }, [load])

  return { staff, loading, reload: load } as const
}
