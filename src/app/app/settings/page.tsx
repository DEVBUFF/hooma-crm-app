"use client"

import { useCallback, useEffect, useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSalon } from "@/lib/useSalon"
import { toast } from "sonner"
import { Save } from "lucide-react"

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "27/03/2026" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "03/27/2026" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-03-27" },
]

const CURRENCIES = [
  { value: "GBP", label: "GBP — British Pound" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "GEL", label: "GEL — Georgian Lari" },
  { value: "TRY", label: "TRY — Turkish Lira" },
]

// ── Style primitives ────────────────────────────────────────────────────────

const PANEL: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
}

const INPUT: React.CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  color: "#0A0A1A",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { salon, loading: salonLoading } = useSalon()

  // Salon details
  const [salonName, setSalonName] = useState("")
  const [city, setCity] = useState("")
  const [postcode, setPostcode] = useState("")
  const [savingSalon, setSavingSalon] = useState(false)

  // Regional
  const [currency, setCurrency] = useState("")
  const [dateFormat, setDateFormat] = useState("")
  const [savingRegional, setSavingRegional] = useState(false)

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!salon || loaded) return
    setSalonName(salon.salonName || salon.name || "")
    setCity(salon.city || "")
    setPostcode(salon.postcode || "")
    setCurrency(salon.settings?.currency ?? "GBP")
    setDateFormat(salon.settings?.dateFormat ?? "DD/MM/YYYY")
    setLoaded(true)
  }, [salon, loaded])

  const hasSalonChanges = useCallback(() => {
    if (!salon) return false
    return (
      salonName.trim() !== (salon.salonName || salon.name || "") ||
      city.trim() !== (salon.city || "") ||
      postcode.trim() !== (salon.postcode || "")
    )
  }, [salon, salonName, city, postcode])

  const hasRegionalChanges = useCallback(() => {
    if (!salon) return false
    return (
      currency !== (salon.settings?.currency ?? "GBP") ||
      dateFormat !== (salon.settings?.dateFormat ?? "DD/MM/YYYY")
    )
  }, [salon, currency, dateFormat])

  async function handleSaveSalon() {
    if (!salon || !salonName.trim() || !city.trim()) return
    setSavingSalon(true)
    try {
      await updateDoc(doc(db, "salons", salon.id), {
        salonName: salonName.trim(),
        city: city.trim(),
        postcode: postcode.trim() || null,
      })
      toast.success("Salon details saved")
      setTimeout(() => window.location.reload(), 400)
    } catch (err) {
      console.error("[Settings] save salon error:", err)
      toast.error("Could not save. Please try again.")
    } finally {
      setSavingSalon(false)
    }
  }

  async function handleSaveRegional() {
    if (!salon) return
    setSavingRegional(true)
    try {
      await updateDoc(doc(db, "salons", salon.id), {
        "settings.currency": currency,
        "settings.dateFormat": dateFormat,
      })
      toast.success("Settings saved")
      setTimeout(() => window.location.reload(), 400)
    } catch (err) {
      console.error("[Settings] save error:", err)
      toast.error("Could not save settings. Please try again.")
    } finally {
      setSavingRegional(false)
    }
  }

  if (salonLoading) {
    return (
      <div className="max-w-2xl space-y-5">
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* ── Salon details ──────────────────────────────────────────── */}
      <Section
        title="Salon details"
        description="Your salon name and location — shown on bookings and receipts."
      >
        <Field label="Salon name">
          <input
            type="text"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            placeholder="e.g. Paws & Claws Grooming"
            style={INPUT}
          />
        </Field>

        <Field label="City / town">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Bristol"
            style={INPUT}
          />
        </Field>

        <Field label="Postcode" optional>
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="e.g. BS1 4DJ"
            style={INPUT}
          />
        </Field>

        <div className="flex justify-end pt-1">
          <SaveButton
            label={savingSalon ? "Saving…" : "Save changes"}
            onClick={handleSaveSalon}
            disabled={
              !hasSalonChanges() ||
              !salonName.trim() ||
              !city.trim() ||
              savingSalon
            }
          />
        </div>
      </Section>

      {/* ── Regional ──────────────────────────────────────────────── */}
      <Section
        title="Regional"
        description="Currency and date format used across the app."
      >
        <Field label="Currency">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ ...INPUT, cursor: "pointer" }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date format">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DATE_FORMATS.map((fmt) => {
              const selected = dateFormat === fmt.value
              return (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => setDateFormat(fmt.value)}
                  className="flex flex-col items-center gap-0.5 px-4 py-3 transition-colors cursor-pointer"
                  style={{
                    borderRadius: 10,
                    background: selected ? "#EEF0FA" : "#FFFFFF",
                    border: `1px solid ${selected ? "#6B72C9" : "#E5E7EB"}`,
                    color: selected ? "#4950A3" : "#0A0A1A",
                  }}
                >
                  <span className="text-[13px] font-semibold tabular-nums">
                    {fmt.value}
                  </span>
                  <span
                    className="text-[11px] tabular-nums"
                    style={{ color: selected ? "#5A61B8" : "#6B7280" }}
                  >
                    {fmt.example}
                  </span>
                </button>
              )
            })}
          </div>
        </Field>

        <div className="flex justify-end pt-1">
          <SaveButton
            label={savingRegional ? "Saving…" : "Save changes"}
            onClick={handleSaveRegional}
            disabled={!hasRegionalChanges() || savingRegional}
          />
        </div>
      </Section>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section style={PANEL} className="p-5 sm:p-6">
      <header className="mb-5">
        <h2
          className="text-[15px] font-semibold"
          style={{ color: "#0A0A1A" }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "#6B7280" }}
          >
            {description}
          </p>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-[12px] font-medium mb-1"
        style={{ color: "#374151" }}
      >
        {label}
        {optional && (
          <span
            className="ml-1 font-normal"
            style={{ color: "#9CA3AF" }}
          >
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  )
}

function SaveButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 transition-colors"
      style={{
        height: 38,
        padding: "0 14px",
        borderRadius: 8,
        background: disabled ? "#E5E7EB" : "#0A0A1A",
        color: disabled ? "#9CA3AF" : "#FFFFFF",
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
      }}
    >
      <Save size={14} strokeWidth={1.75} />
      {label}
    </button>
  )
}

function SectionSkeleton() {
  return (
    <div style={PANEL} className="p-5 sm:p-6">
      <div
        style={{
          height: 14,
          width: 140,
          background: "#F3F4F6",
          borderRadius: 4,
        }}
      />
      <div
        style={{
          height: 10,
          width: 240,
          background: "#F3F4F6",
          borderRadius: 4,
          marginTop: 8,
        }}
      />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div
              style={{
                height: 10,
                width: 80,
                background: "#F3F4F6",
                borderRadius: 4,
              }}
            />
            <div
              style={{
                height: 40,
                width: "100%",
                background: "#F3F4F6",
                borderRadius: 8,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
