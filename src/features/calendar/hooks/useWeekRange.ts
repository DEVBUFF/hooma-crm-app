"use client"

import { useState, useMemo } from "react"
import {
  startOfWeekMonday,
  endOfWeekSunday,
  formatWeekRangeLabel,
} from "@/features/calendar/lib/time"

export interface WeekRange {
  weekStart: Date
  weekEnd: Date
  label: string
  goPrevWeek: () => void
  goNextWeek: () => void
  goToday: () => void
}

export function useWeekRange(): WeekRange {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())

  const weekStart = useMemo(() => startOfWeekMonday(currentDate), [currentDate])
  const weekEnd = useMemo(() => endOfWeekSunday(currentDate), [currentDate])
  const label = useMemo(
    () => formatWeekRangeLabel(weekStart, weekEnd),
    [weekStart, weekEnd],
  )

  function goPrevWeek() {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() - 7)
      return next
    })
  }

  function goNextWeek() {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 7)
      return next
    })
  }

  function goToday() {
    setCurrentDate(new Date())
  }

  return { weekStart, weekEnd, label, goPrevWeek, goNextWeek, goToday }
}
