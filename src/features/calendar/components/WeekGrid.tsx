"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { t } from "@/lib/tokens"
import { StaffHeaderRow } from "@/features/calendar/components/StaffHeaderRow"
import { StaffDayColumn } from "@/features/calendar/components/StaffDayColumn"
import { TimeGutter } from "@/features/calendar/components/TimeGutter"
import {
  snapMinutes,
  minutesSinceDayStart,
  diffMinutes,
  clampDragPreserveDuration,
} from "@/features/calendar/lib/time"
import { useToast } from "@/components/ui/use-toast"
import type { Booking, BookingStatus, Staff } from "@/features/calendar/types"
import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  SLOT_MINUTES,
  GUTTER_WIDTH,
  minutesToPx,
} from "@/features/calendar/lib/grid-config"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GhostState {
  bookingId:   string
  staffId:     string
  startAt:     Date
  endAt:       Date
  hasConflict: boolean
}

interface DragState {
  mode:          "drag" | "resize-bottom"
  bookingId:     string
  staffId:       string
  startAt:       Date
  endAt:         Date
  pointerStartX: number
  pointerStartY: number
}

// ---------------------------------------------------------------------------
// Module-level helpers
// ---------------------------------------------------------------------------

/** Returns true when the candidate slot overlaps any existing booking for
 *  the same staff member, excluding the booking being moved. */
function hasConflict(
  bookings: Booking[],
  excludeId: string,
  staffId:   string,
  startAt:   Date,
  endAt:     Date,
): boolean {
  return bookings.some(
    (b) =>
      b.id !== excludeId &&
      b.staffId === staffId &&
      b.startAt < endAt &&
      b.endAt   > startAt,
  )
}

/**
 * Edge-triggered auto-scroll driven by rAF.
 * Scrolls when the pointer is within EDGE_PX of any container boundary.
 * Stops automatically when dragRef becomes null.
 */
const EDGE_PX   = 48
const MAX_SPEED = 18

function scheduleAutoScroll(
  rafRef:     React.MutableRefObject<number | null>,
  scrollRef:  React.MutableRefObject<HTMLDivElement | null>,
  dragRef:    React.MutableRefObject<DragState | null>,
  pointerRef: React.MutableRefObject<{ x: number; y: number }>,
): void {
  if (rafRef.current !== null) return

  function frame() {
    const el = scrollRef.current
    if (!el || dragRef.current === null) {
      rafRef.current = null
      return
    }

    const rect = el.getBoundingClientRect()
    const { x: px, y: py } = pointerRef.current

    const topDist  = py - rect.top
    const botDist  = rect.bottom - py
    let dy = 0
    if (topDist < EDGE_PX && topDist >= 0) dy = -MAX_SPEED * (1 - topDist / EDGE_PX)
    if (botDist < EDGE_PX && botDist >= 0) dy =  MAX_SPEED * (1 - botDist / EDGE_PX)

    const leftDist  = px - rect.left
    const rightDist = rect.right - px
    let dx = 0
    if (leftDist  < EDGE_PX && leftDist  >= 0) dx = -MAX_SPEED * (1 - leftDist  / EDGE_PX)
    if (rightDist < EDGE_PX && rightDist >= 0) dx =  MAX_SPEED * (1 - rightDist / EDGE_PX)

    if (dy !== 0) el.scrollTop  = Math.max(0, Math.min(el.scrollTop  + dy, el.scrollHeight - el.clientHeight))
    if (dx !== 0) el.scrollLeft = Math.max(0, Math.min(el.scrollLeft + dx, el.scrollWidth  - el.clientWidth))

    rafRef.current = requestAnimationFrame(frame)
  }

  rafRef.current = requestAnimationFrame(frame)
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WeekGridProps {
  staff:      Staff[]
  bookings:   Booking[]
  weekStart:  Date
  weekEnd:    Date
  pxPerMinute: number
  onColumnClick:   (staff: Staff, startAt: Date) => void
  onUpdateBooking: (id: string, updates: { staffId: string; startAt: Date; endAt: Date }) => void
  onStatusChange:  (id: string, status: BookingStatus) => void
  onBookingClick?: (booking: Booking) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Layout strategy
 * ───────────────
 * One `overflow: auto` container scrolls both axes.
 *
 * Sticky top  → StaffHeaderRow   (z-index: 12)
 * Sticky left → TimeGutter       (z-index: 9)
 * Now line    → z-index 8 (inside staff-columns wrapper)
 * Ghost       → z-index 7 (inside StaffDayColumn)
 *
 * Drag / resize use document-level pointer + keydown listeners.
 * All mutable values consumed in those closures live in refs.
 *
 * Snap & jitter
 * ─────────────
 * Movement is snapped to the nearest absolute 15-min boundary so bookings
 * always land on :00/:15/:30/:45. Ghost state is only updated when the
 * snapped position or target column actually changes (lastSnappedRef key).
 */
export function WeekGrid({
  staff,
  bookings,
  weekStart,
  weekEnd,
  pxPerMinute,
  onColumnClick,
  onUpdateBooking,
  onStatusChange,
  onBookingClick,
}: WeekGridProps) {
  const scrollRef  = useRef<HTMLDivElement>(null)
  const { toast }  = useToast()

  // ── Stable refs ──────────────────────────────────────────────────────────
  const pxPerMinuteRef     = useRef(pxPerMinute)
  const staffRef           = useRef(staff)
  const bookingsRef        = useRef(bookings)
  const onUpdateBookingRef = useRef(onUpdateBooking)
  const toastRef           = useRef(toast)

  useEffect(() => { pxPerMinuteRef.current     = pxPerMinute },    [pxPerMinute])
  useEffect(() => { staffRef.current           = staff },           [staff])
  useEffect(() => { bookingsRef.current        = bookings },        [bookings])
  useEffect(() => { onUpdateBookingRef.current = onUpdateBooking }, [onUpdateBooking])
  useEffect(() => { toastRef.current           = toast },           [toast])

  // ── Drag / resize state ──────────────────────────────────────────────────
  const dragRef        = useRef<DragState | null>(null)
  const ghostRef       = useRef<GhostState | null>(null)
  const pointerRef     = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const rafRef         = useRef<number | null>(null)
  /** Serialised key of the last snapped position; prevents ghost re-renders
   *  when the pointer moves within the same 15-min bucket. */
  const lastSnappedRef = useRef<string | null>(null)
  const [ghost, setGhost] = useState<GhostState | null>(null)

  // ── Hover time indicator ───────────────────────────────────────────────
  // Stores the snapped slot-start in minutes (always a multiple of SLOT_MINUTES).
  const [hoverSlotMin, setHoverSlotMin] = useState<number | null>(null)
  const [hoverStaffId, setHoverStaffId] = useState<string | null>(null)
  const columnsRef = useRef<HTMLDivElement>(null)

  const handleColumnsMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't show hover indicator while dragging
      if (dragRef.current) return

      // Don't show hover indicator when cursor is over a booking card
      const target = e.target as HTMLElement
      if (target.closest("[data-booking-card]")) {
        setHoverSlotMin(null)
        setHoverStaffId(null)
        return
      }

      const colEl = columnsRef.current
      const scrollEl = scrollRef.current
      if (!colEl || !scrollEl) return
      const rect = colEl.getBoundingClientRect()
      const y = e.clientY - rect.top
      const rawMin = y / pxPerMinuteRef.current
      const totalMin = (DAY_END_HOUR - DAY_START_HOUR) * 60
      if (rawMin < 0 || rawMin > totalMin) {
        setHoverSlotMin(null)
        setHoverStaffId(null)
        return
      }

      // Snap to the 15-minute slot that contains the cursor
      const snapped = Math.floor(rawMin / SLOT_MINUTES) * SLOT_MINUTES

      // Determine which staff column the cursor is in
      const staffArr = staffRef.current
      const x = e.clientX - rect.left
      const colW = rect.width / staffArr.length
      const colIdx = Math.max(0, Math.min(Math.floor(x / colW), staffArr.length - 1))
      const sid = staffArr[colIdx]?.id ?? null

      setHoverSlotMin(snapped)
      setHoverStaffId(sid)
    },
    [],
  )

  const handleColumnsMouseLeave = useCallback(() => {
    setHoverSlotMin(null)
    setHoverStaffId(null)
  }, [])

  // Clear hover indicator when dragging starts
  useEffect(() => {
    if (ghost) {
      setHoverSlotMin(null)
      setHoverStaffId(null)
    }
  }, [ghost])

  // ── Now line ─────────────────────────────────────────────────────────────
  const [nowPx, setNowPx] = useState<number | null>(() =>
    minutesToPx(new Date().getHours(), new Date().getMinutes(), pxPerMinute),
  )

  const showNowLine = useMemo(() => {
    const now = new Date()
    return now >= weekStart && now <= weekEnd
  }, [weekStart, weekEnd])

  useEffect(() => {
    const now = new Date()
    setNowPx(minutesToPx(now.getHours(), now.getMinutes(), pxPerMinute))
  }, [pxPerMinute])

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setNowPx(minutesToPx(now.getHours(), now.getMinutes(), pxPerMinuteRef.current))
    }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Default day for click-to-create ─────────────────────────────────────
  const defaultDay = useMemo(() => {
    const now = new Date()
    if (now >= weekStart && now <= weekEnd) {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      return d
    }
    return new Date(weekStart)
  }, [weekStart, weekEnd])

  // ── Auto-scroll on week/zoom change ──────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const now = new Date()
    let targetPx = 0
    if (now >= weekStart && now <= weekEnd) {
      const minSinceStart = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes()
      targetPx = Math.max(0, (minSinceStart - 60) * pxPerMinute)
    }
    el.scrollTop = targetPx
  }, [weekStart, pxPerMinute])

  // ── Drag ─────────────────────────────────────────────────────────────────
  const startDrag = useCallback(
    (e: React.PointerEvent, booking: Booking, bookingStaff: Staff) => {
      e.preventDefault()

      const durationMin = diffMinutes(booking.startAt, booking.endAt)

      dragRef.current = {
        mode:          "drag",
        bookingId:     booking.id,
        staffId:       bookingStaff.id,
        startAt:       booking.startAt,
        endAt:         booking.endAt,
        pointerStartX: e.clientX,
        pointerStartY: e.clientY,
      }
      lastSnappedRef.current = null

      const init: GhostState = {
        bookingId:   booking.id,
        staffId:     bookingStaff.id,
        startAt:     booking.startAt,
        endAt:       booking.endAt,
        hasConflict: false,
      }
      ghostRef.current = init
      setGhost(init)

      // ── Shared cleanup: tears down all listeners, optionally commits ──
      function cleanup(commit: boolean) {
        document.removeEventListener("pointermove",   move)
        document.removeEventListener("pointerup",     up)
        document.removeEventListener("pointercancel", cancel)
        document.removeEventListener("keydown",       keydown)

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }

        if (commit) {
          const g = ghostRef.current
          if (g) {
            if (g.hasConflict) {
              toastRef.current({
                variant:     "destructive",
                title:       "Time slot conflict",
                description: "That slot overlaps an existing booking.",
              })
            } else {
              onUpdateBookingRef.current(g.bookingId, {
                staffId: g.staffId,
                startAt: g.startAt,
                endAt:   g.endAt,
              })
            }
          }
        }

        dragRef.current        = null
        ghostRef.current       = null
        lastSnappedRef.current = null
        setGhost(null)
      }

      function move(ev: PointerEvent) {
        const ds       = dragRef.current
        const scrollEl = scrollRef.current
        if (!ds || !scrollEl) return

        pointerRef.current = { x: ev.clientX, y: ev.clientY }

        const ppm      = pxPerMinuteRef.current
        const staffArr = staffRef.current

        // ── Horizontal: which staff column? ──────────────────────────────
        const rect   = scrollEl.getBoundingClientRect()
        const columnsW = scrollEl.scrollWidth - GUTTER_WIDTH
        const colW     = columnsW / staffArr.length
        const x      = ev.clientX - rect.left + scrollEl.scrollLeft - GUTTER_WIDTH
        const colIdx = Math.max(0, Math.min(Math.floor(x / colW), staffArr.length - 1))
        const newStaffId = staffArr[colIdx]?.id ?? ds.staffId

        // ── Vertical: snap to absolute 15-min boundary ───────────────────
        const originStart     = minutesSinceDayStart(ds.startAt, DAY_START_HOUR)
        const rawNewStartMin  = originStart + (ev.clientY - ds.pointerStartY) / ppm
        const snappedStartMin = snapMinutes(rawNewStartMin, SLOT_MINUTES)

        // Skip re-render when nothing changed (jitter prevention)
        const key = `${snappedStartMin}:${newStaffId}`
        if (lastSnappedRef.current === key) return
        lastSnappedRef.current = key

        // Build raw start date from snapped minutes; clamp preserves duration
        const rawStart = new Date(ds.startAt)
        rawStart.setHours(
          DAY_START_HOUR + Math.floor(snappedStartMin / 60),
          ((snappedStartMin % 60) + 60) % 60, // handle negative modulo
          0, 0,
        )
        const { startAt: newStartAt, endAt: newEndAt } = clampDragPreserveDuration(
          rawStart,
          durationMin,
          DAY_START_HOUR,
          DAY_END_HOUR,
        )

        const conflict = hasConflict(bookingsRef.current, ds.bookingId, newStaffId, newStartAt, newEndAt)

        const next: GhostState = {
          bookingId:   ds.bookingId,
          staffId:     newStaffId,
          startAt:     newStartAt,
          endAt:       newEndAt,
          hasConflict: conflict,
        }
        ghostRef.current = next
        setGhost(next)

        scheduleAutoScroll(rafRef, scrollRef, dragRef, pointerRef)
      }

      function up()     { cleanup(true)  }
      function cancel() { cleanup(false) }
      function keydown(ev: KeyboardEvent) { if (ev.key === "Escape") cleanup(false) }

      document.addEventListener("pointermove",   move)
      document.addEventListener("pointerup",     up)
      document.addEventListener("pointercancel", cancel)
      document.addEventListener("keydown",       keydown)
    },
    [],
  )

  // ── Resize ───────────────────────────────────────────────────────────────
  const startResize = useCallback(
    (e: React.PointerEvent, booking: Booking, bookingStaff: Staff) => {
      e.preventDefault()

      const DAY_TOTAL_MIN = (DAY_END_HOUR - DAY_START_HOUR) * 60

      dragRef.current = {
        mode:          "resize-bottom",
        bookingId:     booking.id,
        staffId:       bookingStaff.id,
        startAt:       booking.startAt,
        endAt:         booking.endAt,
        pointerStartX: e.clientX,
        pointerStartY: e.clientY,
      }
      lastSnappedRef.current = null

      const init: GhostState = {
        bookingId:   booking.id,
        staffId:     bookingStaff.id,
        startAt:     booking.startAt,
        endAt:       booking.endAt,
        hasConflict: false,
      }
      ghostRef.current = init
      setGhost(init)

      function cleanup(commit: boolean) {
        document.removeEventListener("pointermove",   move)
        document.removeEventListener("pointerup",     up)
        document.removeEventListener("pointercancel", cancel)
        document.removeEventListener("keydown",       keydown)

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }

        if (commit) {
          const g = ghostRef.current
          if (g) {
            if (g.hasConflict) {
              toastRef.current({
                variant:     "destructive",
                title:       "Time slot conflict",
                description: "That slot overlaps an existing booking.",
              })
            } else {
              onUpdateBookingRef.current(g.bookingId, {
                staffId: g.staffId,
                startAt: g.startAt,
                endAt:   g.endAt,
              })
            }
          }
        }

        dragRef.current        = null
        ghostRef.current       = null
        lastSnappedRef.current = null
        setGhost(null)
      }

      function move(ev: PointerEvent) {
        const ds = dragRef.current
        if (!ds) return

        pointerRef.current = { x: ev.clientX, y: ev.clientY }

        const ppm            = pxPerMinuteRef.current
        const originStartMin = minutesSinceDayStart(ds.startAt, DAY_START_HOUR)
        const originEndMin   = minutesSinceDayStart(ds.endAt,   DAY_START_HOUR)
        const rawNewEndMin   = originEndMin + (ev.clientY - ds.pointerStartY) / ppm
        const snappedEndMin  = snapMinutes(rawNewEndMin, SLOT_MINUTES)
        const clampedEndMin  = Math.max(
          originStartMin + SLOT_MINUTES,
          Math.min(snappedEndMin, DAY_TOTAL_MIN),
        )

        // Jitter check
        const key = String(clampedEndMin)
        if (lastSnappedRef.current === key) return
        lastSnappedRef.current = key

        const newEndAt = new Date(ds.startAt)
        newEndAt.setHours(
          DAY_START_HOUR + Math.floor(clampedEndMin / 60),
          clampedEndMin % 60,
          0, 0,
        )

        const conflict = hasConflict(bookingsRef.current, ds.bookingId, ds.staffId, ds.startAt, newEndAt)

        const next: GhostState = {
          bookingId:   ds.bookingId,
          staffId:     ds.staffId,
          startAt:     ds.startAt,
          endAt:       newEndAt,
          hasConflict: conflict,
        }
        ghostRef.current = next
        setGhost(next)

        scheduleAutoScroll(rafRef, scrollRef, dragRef, pointerRef)
      }

      function up()     { cleanup(true)  }
      function cancel() { cleanup(false) }
      function keydown(ev: KeyboardEvent) { if (ev.key === "Escape") cleanup(false) }

      document.addEventListener("pointermove",   move)
      document.addEventListener("pointerup",     up)
      document.addEventListener("pointercancel", cancel)
      document.addEventListener("keydown",       keydown)
    },
    [],
  )

  return (
    <div
      ref={scrollRef}
      style={{
        overflow:  "auto",
        width:     "100%",
        minWidth:  0,
        // allow the parent flex container to size this scrollable area
        // (removing the fixed viewport calc prevents unexpected bottom gaps
        // when the app header/topbar is hidden or its height changes)
        flex: 1,
        minHeight: 0,
        border:       `1px solid ${t.colors.semantic.border}`,
        background:   t.colors.semantic.panel,
        position: "relative",
      }}
    >
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <StaffHeaderRow staff={staff} />

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex" }}>
        <TimeGutter pxPerMinute={pxPerMinute} />

        <div
          ref={columnsRef}
          onMouseMove={handleColumnsMouseMove}
          onMouseLeave={handleColumnsMouseLeave}
          style={{ position: "relative", display: "flex", flex: 1, minWidth: 0 }}
        >

          {/* ── Now line ─────────────────────────────────────────────── */}
          {showNowLine && nowPx !== null && (
            <div
              aria-hidden="true"
              style={{
                position:      "absolute",
                top:           nowPx,
                left:          0,
                right:         0,
                zIndex:        8,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position:     "absolute",
                  left:         -4,
                  top:          -4,
                  width:        8,
                  height:       8,
                  borderRadius: t.radius.full,
                  background:   t.colors.semantic.accent,
                }}
              />
              <div
                style={{
                  height:     1,
                  background: t.colors.semantic.accent,
                }}
              />
            </div>
          )}

          {/* ── Staff columns ─────────────────────────────────────── */}
          {staff.map((s) => {
            const isGhostTarget = ghost?.staffId === s.id
            const isHovered = hoverStaffId === s.id
            return (
              <StaffDayColumn
                key={s.id}
                staff={s}
                bookings={bookings.filter(
                  (b) =>
                    b.staffId === s.id &&
                    b.startAt >= weekStart &&
                    b.startAt <= weekEnd,
                )}
                defaultDay={defaultDay}
                onColumnClick={onColumnClick}
                pxPerMinute={pxPerMinute}
                hoverSlotMin={isHovered ? hoverSlotMin : null}
                ghost={
                  isGhostTarget
                    ? {
                        startAt:     ghost!.startAt,
                        endAt:       ghost!.endAt,
                        hasConflict: ghost!.hasConflict,
                      }
                    : null
                }
                draggedBookingId={ghost?.bookingId ?? null}
                onDragStart={(e, booking) => startDrag(e, booking, s)}
                onResizeStart={(e, booking) => startResize(e, booking, s)}
                onStatusChange={onStatusChange}
                onBookingClick={onBookingClick}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
