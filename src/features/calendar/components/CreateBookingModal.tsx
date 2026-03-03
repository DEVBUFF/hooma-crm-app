"use client"

import { useEffect, useState } from "react"
import { t } from "@/lib/tokens"
import { formatTime } from "@/features/calendar/lib/time"
import { DAY_END_HOUR } from "@/features/calendar/lib/grid-config"
import type { Booking, Staff } from "@/features/calendar/types"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DURATION_OPTIONS = [30, 45, 60, 90, 120] as const
type Duration = (typeof DURATION_OPTIONS)[number]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_INPUT: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: t.radius.md,
  border: `1px solid ${t.colors.component.input.border}`,
  background: t.colors.component.input.bg,
  fontSize: t.typography.fontSize.sm,
  fontFamily: t.typography.fontFamily.sans,
  color: t.colors.component.input.text,
  outline: "none",
  boxSizing: "border-box",
  transition: `border-color ${t.motion.duration.fast} ${t.motion.easing.standard},
               background  ${t.motion.duration.fast} ${t.motion.easing.standard}`,
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.medium,
          color: t.colors.semantic.textMuted,
          textTransform: "uppercase",
          letterSpacing: t.typography.letterSpacing.label,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CreateBookingModalProps {
  staff: Staff
  /** Snapped, clamped start time for the new booking. */
  startAt: Date
  onClose: () => void
  onCreate: (booking: Omit<Booking, "id">) => void
}

export function CreateBookingModal({
  staff,
  startAt,
  onClose,
  onCreate,
}: CreateBookingModalProps) {
  const [customerName, setCustomerName] = useState("")
  const [serviceName, setServiceName] = useState("")
  const [duration, setDuration] = useState<Duration>(60)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Close on Escape.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  // Compute endAt, clamped to DAY_END_HOUR.
  const endAt = (() => {
    const raw = new Date(startAt.getTime() + duration * 60_000)
    const ceiling = new Date(startAt)
    ceiling.setHours(DAY_END_HOUR, 0, 0, 0)
    return raw > ceiling ? ceiling : raw
  })()

  const canCreate = customerName.trim().length > 0 && serviceName.trim().length > 0

  function handleCreate() {
    if (!canCreate) return
    onCreate({
      staffId: staff.id,
      startAt,
      endAt,
      customerNameSnapshot: customerName.trim(),
      serviceNameSnapshot: serviceName.trim(),
      status: "confirmed",
    })
  }

  function inputStyle(field: string): React.CSSProperties {
    const focused = focusedField === field
    return {
      ...BASE_INPUT,
      borderColor: focused
        ? t.colors.component.input.borderFocus
        : t.colors.component.input.border,
      background: focused
        ? t.colors.component.input.bgFocus
        : t.colors.component.input.bg,
      boxShadow: focused ? t.shadow.inner : "none",
    }
  }

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: t.zIndex.modal,
          background: "rgba(46, 33, 28, 0.40)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      {/* ── Modal card ───────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create booking"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: t.zIndex.modal + 1,
          width: "min(440px, calc(100vw - 32px))",
          background: t.colors.semantic.panelWarm,
          border: `1px solid ${t.colors.semantic.borderSubtle}`,
          borderRadius: t.radius["2xl"],
          boxShadow: t.shadow.cardElevated,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.semantic.textStrong,
                lineHeight: t.typography.lineHeight.tight,
              }}
            >
              New Booking
            </h2>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: t.typography.fontSize.sm,
                color: t.colors.semantic.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Staff colour dot */}
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: t.radius.full,
                  background: staff.color,
                  flexShrink: 0,
                }}
              />
              {staff.name} · {formatDateLabel(startAt)}
            </p>
          </div>

          {/* Close button */}
          <button
            aria-label="Close modal"
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: t.radius.sm,
              border: `1px solid ${t.colors.semantic.borderSubtle}`,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              lineHeight: 1,
              color: t.colors.semantic.textMuted,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div
          style={{ height: 1, background: t.colors.semantic.borderSubtle }}
        />

        {/* ── Form fields ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Customer name */}
          <Field label="Customer name">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
              onFocus={() => setFocusedField("customer")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Emma Wilson"
              autoFocus
              style={inputStyle("customer")}
            />
          </Field>

          {/* Service name */}
          <Field label="Service">
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
              onFocus={() => setFocusedField("service")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Haircut"
              style={inputStyle("service")}
            />
          </Field>

          {/* Start time — readonly */}
          <Field label="Start time">
            <div
              style={{
                ...BASE_INPUT,
                color: t.colors.semantic.textMuted,
                cursor: "default",
                userSelect: "none",
              }}
            >
              {formatTime(startAt)}
            </div>
          </Field>

          {/* Duration */}
          <Field label="Duration">
            <div style={{ position: "relative" }}>
              <select
                value={duration}
                onChange={(e) =>
                  setDuration(Number(e.target.value) as Duration)
                }
                onFocus={() => setFocusedField("duration")}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...inputStyle("duration"),
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  paddingRight: 32,
                }}
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  fontSize: 10,
                  color: t.colors.semantic.textMuted,
                }}
              >
                ▾
              </span>
            </div>
          </Field>
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 4,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: t.radius.md,
              border: `1px solid ${t.colors.semantic.borderSubtle}`,
              background: "transparent",
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.medium,
              fontFamily: t.typography.fontFamily.sans,
              color: t.colors.semantic.textMuted,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={!canCreate}
            style={{
              padding: "9px 22px",
              borderRadius: t.radius.md,
              border: "none",
              background: t.colors.semantic.primary,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              fontFamily: t.typography.fontFamily.sans,
              color: "#fff",
              cursor: canCreate ? "pointer" : "not-allowed",
              opacity: canCreate ? 1 : 0.45,
              boxShadow: canCreate ? t.shadow.primary : "none",
              transition: `opacity ${t.motion.duration.fast} ${t.motion.easing.standard}`,
            }}
          >
            Create
          </button>
        </div>
      </div>
    </>
  )
}
