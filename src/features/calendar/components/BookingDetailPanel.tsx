"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { t } from "@/lib/tokens"
import { formatTime, formatDuration, diffMinutes } from "@/features/calendar/lib/time"
import type {
  Booking,
  BookingStatus,
  Staff,
  CalendarCustomer,
  CalendarService,
} from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: Array<{ value: BookingStatus; label: string; color: string; bg: string }> = [
  { value: "confirmed", label: "Confirmed", color: t.colors.semantic.info,      bg: t.colors.semantic.infoBg },
  { value: "completed", label: "Completed", color: t.colors.semantic.success,   bg: t.colors.semantic.successBg },
  { value: "canceled",  label: "Canceled",  color: t.colors.semantic.error,     bg: t.colors.semantic.errorBg },
  { value: "no_show",   label: "No show",   color: t.colors.semantic.textMuted, bg: t.colors.semantic.surface },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatTimeForInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0")
  const m = String(date.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
  })
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const INPUT_STYLE: React.CSSProperties = {
  width:        "100%",
  padding:      "9px 12px",
  borderRadius: t.radius.md,
  border:       `1px solid ${t.colors.component.input.border}`,
  background:   t.colors.component.input.bg,
  fontSize:     t.typography.fontSize.sm,
  fontFamily:   t.typography.fontFamily.sans,
  color:        t.colors.component.input.text,
  outline:      "none",
  boxSizing:    "border-box" as const,
  transition:   `border-color ${t.motion.duration.fast} ${t.motion.easing.standard}`,
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize:      t.typography.fontSize.xs,
  fontWeight:    t.typography.fontWeight.medium,
  color:         t.colors.semantic.textMuted,
  textTransform: "uppercase",
  letterSpacing: t.typography.letterSpacing.label,
}

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  cursor:           "pointer",
  appearance:       "none",
  WebkitAppearance: "none",
  paddingRight:     32,
}

function SelectChevron() {
  return (
    <span
      aria-hidden="true"
      style={{
        position:      "absolute",
        right:         11,
        top:           "50%",
        transform:     "translateY(-50%)",
        pointerEvents: "none",
        fontSize:      10,
        color:         t.colors.semantic.textMuted,
      }}
    >
      ▾
    </span>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BookingDetailPanelProps {
  booking: Booking
  staff: Staff[]
  customers: CalendarCustomer[]
  services: CalendarService[]
  currency?: string
  onClose:  () => void
  onSave:   (updated: Booking) => void
  onDelete: (id: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookingDetailPanel({
  booking,
  staff,
  customers,
  services,
  currency = "GEL",
  onClose,
  onSave,
  onDelete,
}: BookingDetailPanelProps) {
  // ── Local editable state ──────────────────────────────────────────────
  const [customerId, setCustomerId]       = useState(booking.customerId ?? "")
  const [petId, setPetId]                 = useState(booking.petId ?? "")
  const [serviceId, setServiceId]         = useState(booking.serviceId ?? "")
  const [status, setStatus]               = useState<BookingStatus>(booking.status)
  const [staffId, setStaffId]             = useState(booking.staffId)
  const [startDate, setStartDate]         = useState(formatDateForInput(booking.startAt))
  const [startTime, setStartTime]         = useState(formatTimeForInput(booking.startAt))
  const [endTime, setEndTime]             = useState(formatTimeForInput(booking.endAt))

  // Sync when a different booking is selected
  useEffect(() => {
    setCustomerId(booking.customerId ?? "")
    setPetId(booking.petId ?? "")
    setServiceId(booking.serviceId ?? "")
    setStatus(booking.status)
    setStaffId(booking.staffId)
    setStartDate(formatDateForInput(booking.startAt))
    setStartTime(formatTimeForInput(booking.startAt))
    setEndTime(formatTimeForInput(booking.endAt))
  }, [booking])

  // ── Derived ───────────────────────────────────────────────────────────
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  )
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  )
  const pets = selectedCustomer?.pets ?? []

  // Reset pet when customer changes (unless it's the initial sync)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return }
    setPetId("")
  }, [customerId])

  const currentStaff = staff.find((s) => s.id === staffId) ?? staff[0]
  const statusCfg    = STATUS_OPTIONS.find((o) => o.value === status)!

  const durationMin = diffMinutes(booking.startAt, booking.endAt)
  const durationStr = formatDuration(durationMin)

  // ── Dirty check ───────────────────────────────────────────────────────
  const isDirty =
    customerId    !== (booking.customerId ?? "") ||
    petId         !== (booking.petId ?? "") ||
    serviceId     !== (booking.serviceId ?? "") ||
    status        !== booking.status ||
    staffId       !== booking.staffId ||
    startDate     !== formatDateForInput(booking.startAt) ||
    startTime     !== formatTimeForInput(booking.startAt) ||
    endTime       !== formatTimeForInput(booking.endAt)

  // ── Save handler ──────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const [y, mo, d] = startDate.split("-").map(Number)
    const [sh, sm]   = startTime.split(":").map(Number)
    const [eh, em]   = endTime.split(":").map(Number)

    const newStart = new Date(y, mo - 1, d, sh, sm, 0, 0)
    const newEnd   = new Date(y, mo - 1, d, eh, em, 0, 0)

    const customer = customers.find((c) => c.id === customerId)
    const service  = services.find((s) => s.id === serviceId)
    const pet      = pets.find((p) => p.id === petId)

    onSave({
      ...booking,
      customerId:           customerId || undefined,
      serviceId:            serviceId || undefined,
      petId:                pet?.id,
      customerNameSnapshot: customer?.name ?? booking.customerNameSnapshot,
      serviceNameSnapshot:  service?.name ?? booking.serviceNameSnapshot,
      petNameSnapshot:      pet?.name,
      priceSnapshot:        service ? `${currency} ${service.price}` : booking.priceSnapshot,
      status,
      staffId,
      startAt: newStart,
      endAt:   newEnd,
    })
  }, [booking, customerId, serviceId, petId, pets, customers, services, currency, status, staffId, startDate, startTime, endTime, onSave])

  // ── Close on Escape ───────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  // ── Slide-in animation state ──────────────────────────────────────────
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const panelRef = useRef<HTMLDivElement>(null)

  return createPortal(
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position:   "fixed",
          inset:      0,
          zIndex:     t.zIndex.modal,
          background: "rgba(0, 0, 0, 0.20)",
          transition: `opacity ${t.motion.duration.normal} ${t.motion.easing.standard}`,
          opacity:    visible ? 1 : 0,
        }}
      />

      {/* ── Panel ─────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
        style={{
          position:      "fixed",
          top:           0,
          right:         0,
          bottom:        0,
          zIndex:        t.zIndex.modal + 1,
          width:         "min(440px, 100vw)",
          background:    t.colors.semantic.panel,
          borderLeft:    `1px solid ${t.colors.semantic.border}`,
          boxShadow:     t.shadow.cardElevated,
          display:       "flex",
          flexDirection: "column",
          transform:     visible ? "translateX(0)" : "translateX(100%)",
          transition:    `transform ${t.motion.duration.slow} ${t.motion.easing.emphasized}`,
          overflowY:     "auto",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          style={{
            padding:        "20px 24px 16px",
            display:        "flex",
            alignItems:     "flex-start",
            justifyContent: "space-between",
            gap:            12,
            borderBottom:   `1px solid ${t.colors.semantic.borderSubtle}`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin:     0,
                fontSize:   t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.semibold,
                color:      t.colors.semantic.textStrong,
                lineHeight: t.typography.lineHeight.tight,
              }}
            >
              Booking Details
            </h2>
            <p
              style={{
                margin:   "4px 0 0",
                fontSize: t.typography.fontSize.sm,
                color:    t.colors.semantic.textMuted,
                display:  "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display:      "inline-block",
                  width:        8,
                  height:       8,
                  borderRadius: t.radius.sm,
                  background:   currentStaff.color,
                  flexShrink:   0,
                }}
              />
              {currentStaff.name} · {formatDateLabel(booking.startAt)}
            </p>
          </div>

          {/* Close button */}
          <button
            aria-label="Close panel"
            onClick={onClose}
            style={{
              flexShrink:     0,
              width:          30,
              height:         30,
              borderRadius:   t.radius.sm,
              border:         `1px solid ${t.colors.semantic.borderSubtle}`,
              background:     "transparent",
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       18,
              lineHeight:     1,
              color:          t.colors.semantic.textMuted,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Status badge strip ──────────────────────────────────────── */}
        <div
          style={{
            padding:    "12px 24px",
            display:    "flex",
            alignItems: "center",
            gap:        8,
            background: hexToRgba(currentStaff.color, 0.08),
            borderBottom: `1px solid ${t.colors.semantic.borderSubtle}`,
          }}
        >
          <span
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          6,
              fontSize:     t.typography.fontSize.sm,
              fontWeight:   t.typography.fontWeight.semibold,
              color:        t.colors.semantic.text,
            }}
          >
            {formatTime(booking.startAt)} – {formatTime(booking.endAt)}
          </span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontSize:     t.typography.fontSize.xs,
              fontWeight:   t.typography.fontWeight.semibold,
              padding:      "3px 10px",
              borderRadius: t.radius.sm,
              background:   statusCfg.bg,
              color:        statusCfg.color,
              lineHeight:   1.5,
            }}
          >
            {statusCfg.label}
          </span>
          <span
            style={{
              fontSize:   t.typography.fontSize.xs,
              color:      t.colors.semantic.textMuted,
            }}
          >
            {durationStr}
          </span>
        </div>

        {/* ── Form fields ─────────────────────────────────────────────── */}
        <div
          style={{
            flex:          1,
            padding:       "20px 24px",
            display:       "flex",
            flexDirection: "column",
            gap:           16,
          }}
        >
          {/* Customer dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={LABEL_STYLE}>Customer</label>
            <div style={{ position: "relative" }}>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={SELECT_STYLE}
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.phone ? ` · ${c.phone}` : ""}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          {/* Pet dropdown (only when customer has pets) */}
          {selectedCustomer && pets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={LABEL_STYLE}>Pet</label>
              <div style={{ position: "relative" }}>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  style={SELECT_STYLE}
                >
                  <option value="">No pet selected</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.breed ? ` (${p.breed})` : ""}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>
          )}

          {/* Service dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={LABEL_STYLE}>Service</label>
            <div style={{ position: "relative" }}>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                style={SELECT_STYLE}
              >
                <option value="">Select service…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.durationMinutes} min · {currency} {s.price}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          {/* Price (auto-filled, read-only) */}
          {selectedService && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={LABEL_STYLE}>Price</label>
              <div style={{ ...INPUT_STYLE, color: t.colors.semantic.textMuted, cursor: "default", userSelect: "none" }}>
                {currency} {selectedService.price}
              </div>
            </div>
          )}

          {/* Staff */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={LABEL_STYLE}>Staff</label>
            <div style={{ position: "relative" }}>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                style={SELECT_STYLE}
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          {/* Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={LABEL_STYLE}>Status</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    style={{
                      padding:      "5px 12px",
                      borderRadius: t.radius.sm,
                      border:       `1.5px solid ${active ? opt.color : t.colors.semantic.border}`,
                      background:   active ? opt.bg : "transparent",
                      color:        active ? opt.color : t.colors.semantic.textMuted,
                      fontSize:     t.typography.fontSize.xs,
                      fontWeight:   t.typography.fontWeight.semibold,
                      fontFamily:   t.typography.fontFamily.sans,
                      cursor:       "pointer",
                      transition:   `all ${t.motion.duration.fast} ${t.motion.easing.standard}`,
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date + Start time + End time */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={LABEL_STYLE}>Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ ...INPUT_STYLE, cursor: "pointer" }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={LABEL_STYLE}>Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ ...INPUT_STYLE, cursor: "pointer" }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={LABEL_STYLE}>End</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ ...INPUT_STYLE, cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        {/* ── Footer actions ──────────────────────────────────────────── */}
        <div
          style={{
            padding:       "16px 24px",
            display:       "flex",
            alignItems:    "center",
            gap:           10,
            borderTop:     `1px solid ${t.colors.semantic.borderSubtle}`,
          }}
        >
          {/* Delete button — left side */}
          <button
            onClick={() => onDelete(booking.id)}
            style={{
              padding:      "9px 16px",
              borderRadius: t.radius.md,
              border:       `1px solid ${t.colors.semantic.errorBorder}`,
              background:   "transparent",
              fontSize:     t.typography.fontSize.sm,
              fontWeight:   t.typography.fontWeight.medium,
              fontFamily:   t.typography.fontFamily.sans,
              color:        t.colors.semantic.error,
              cursor:       "pointer",
              transition:   `background ${t.motion.duration.fast} ${t.motion.easing.standard}`,
            }}
          >
            Delete
          </button>

          <span style={{ flex: 1 }} />

          {/* Cancel */}
          <button
            onClick={onClose}
            style={{
              padding:      "9px 18px",
              borderRadius: t.radius.md,
              border:       `1px solid ${t.colors.semantic.borderSubtle}`,
              background:   "transparent",
              fontSize:     t.typography.fontSize.sm,
              fontWeight:   t.typography.fontWeight.medium,
              fontFamily:   t.typography.fontFamily.sans,
              color:        t.colors.semantic.textMuted,
              cursor:       "pointer",
            }}
          >
            Cancel
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              padding:      "9px 22px",
              borderRadius: t.radius.md,
              border:       "none",
              background:   t.colors.semantic.primary,
              fontSize:     t.typography.fontSize.sm,
              fontWeight:   t.typography.fontWeight.semibold,
              fontFamily:   t.typography.fontFamily.sans,
              color:        "#fff",
              cursor:       isDirty ? "pointer" : "not-allowed",
              opacity:      isDirty ? 1 : 0.45,
              boxShadow:    isDirty ? t.shadow.primary : "none",
              transition:   `opacity ${t.motion.duration.fast} ${t.motion.easing.standard}`,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}
