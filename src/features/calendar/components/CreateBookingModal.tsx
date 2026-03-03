"use client"

import { useEffect, useMemo, useState } from "react"
import { t } from "@/lib/tokens"
import { formatTime } from "@/features/calendar/lib/time"
import { DAY_END_HOUR } from "@/features/calendar/lib/grid-config"
import type {
  Booking,
  Staff,
  CalendarCustomer,
  CalendarService,
} from "@/features/calendar/types"

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

const LABEL_STYLE: React.CSSProperties = {
  fontSize: t.typography.fontSize.xs,
  fontWeight: t.typography.fontWeight.medium,
  color: t.colors.semantic.textMuted,
  textTransform: "uppercase",
  letterSpacing: t.typography.letterSpacing.label,
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  )
}

function SelectChevron() {
  return (
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
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CreateBookingModalProps {
  staff: Staff
  startAt: Date
  customers: CalendarCustomer[]
  services: CalendarService[]
  currency?: string
  onClose: () => void
  onCreate: (booking: Omit<Booking, "id">) => void
}

export function CreateBookingModal({
  staff,
  startAt,
  customers,
  services,
  currency = "GEL",
  onClose,
  onCreate,
}: CreateBookingModalProps) {
  // ── Form state ──────────────────────────────────────────────────────────
  const [customerId, setCustomerId] = useState("")
  const [petId, setPetId]           = useState("")
  const [serviceId, setServiceId]   = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // ── Derived ─────────────────────────────────────────────────────────────
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  )
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  )
  const pets = selectedCustomer?.pets ?? []

  // Reset pet when customer changes
  useEffect(() => { setPetId("") }, [customerId])

  // Compute endAt from service duration, clamped to DAY_END_HOUR
  const durationMin = selectedService?.durationMinutes ?? 60
  const endAt = useMemo(() => {
    const raw = new Date(startAt.getTime() + durationMin * 60_000)
    const ceiling = new Date(startAt)
    ceiling.setHours(DAY_END_HOUR, 0, 0, 0)
    return raw > ceiling ? ceiling : raw
  }, [startAt, durationMin])

  const canCreate = customerId.length > 0 && serviceId.length > 0

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  function handleCreate() {
    if (!canCreate || !selectedCustomer || !selectedService) return
    const selectedPet = pets.find((p) => p.id === petId)
    onCreate({
      staffId: staff.id,
      startAt,
      endAt,
      customerId,
      serviceId,
      petId: selectedPet?.id,
      customerNameSnapshot: selectedCustomer.name,
      serviceNameSnapshot: selectedService.name,
      petNameSnapshot: selectedPet?.name,
      priceSnapshot: `${currency} ${selectedService.price}`,
      status: "confirmed",
    })
  }

  function selectFocusStyle(field: string): React.CSSProperties {
    const focused = focusedField === field
    return {
      ...BASE_INPUT,
      cursor: "pointer",
      appearance: "none" as const,
      WebkitAppearance: "none" as const,
      paddingRight: 32,
      borderColor: focused ? t.colors.component.input.borderFocus : t.colors.component.input.border,
      background:  focused ? t.colors.component.input.bgFocus     : t.colors.component.input.bg,
      boxShadow:   focused ? t.shadow.inner : "none",
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
          background: "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
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
          background: t.colors.semantic.panel,
          border: `1px solid ${t.colors.semantic.border}`,
          borderRadius: t.radius.xl,
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
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: t.radius.sm,
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
        <div style={{ height: 1, background: t.colors.semantic.borderSubtle }} />

        {/* ── Form fields ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Customer dropdown */}
          <Field label="Customer">
            <div style={{ position: "relative" }}>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                onFocus={() => setFocusedField("customer")}
                onBlur={() => setFocusedField(null)}
                autoFocus
                style={selectFocusStyle("customer")}
              >
                <option value="" disabled>Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.phone ? ` · ${c.phone}` : ""}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </Field>

          {/* Pet dropdown (only when customer has pets) */}
          {selectedCustomer && pets.length > 0 && (
            <Field label="Pet">
              <div style={{ position: "relative" }}>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  onFocus={() => setFocusedField("pet")}
                  onBlur={() => setFocusedField(null)}
                  style={selectFocusStyle("pet")}
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
            </Field>
          )}

          {/* Service dropdown */}
          <Field label="Service">
            <div style={{ position: "relative" }}>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                onFocus={() => setFocusedField("service")}
                onBlur={() => setFocusedField(null)}
                style={selectFocusStyle("service")}
              >
                <option value="" disabled>Select service…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.durationMinutes} min · {currency} {s.price}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
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

          {/* Duration + Price summary (auto-filled from service) */}
          {selectedService && (
            <div style={{ display: "flex", gap: 10 }}>
              <Field label="Duration">
                <div style={{ ...BASE_INPUT, color: t.colors.semantic.textMuted, cursor: "default", userSelect: "none" }}>
                  {selectedService.durationMinutes} min
                </div>
              </Field>
              <Field label="Price">
                <div style={{ ...BASE_INPUT, color: t.colors.semantic.textMuted, cursor: "default", userSelect: "none" }}>
                  {currency} {selectedService.price}
                </div>
              </Field>
            </div>
          )}
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
