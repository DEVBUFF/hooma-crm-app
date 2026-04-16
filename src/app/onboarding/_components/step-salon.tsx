"use client"

import { useState } from "react"
import { Store, MapPin, Hash, ArrowRight, Loader2 } from "lucide-react"
import { t } from "@/lib/tokens"

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i

export const CURRENCY_OPTIONS = [
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
] as const

export type CurrencyCode = typeof CURRENCY_OPTIONS[number]["code"]

export function getCurrencySymbol(code: string): string {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol ?? "£"
}

interface StepSalonProps {
  initialData?: { salonName: string; city: string; postcode: string; currency: CurrencyCode }
  onNext: (data: { salonName: string; city: string; postcode: string; currency: CurrencyCode }) => Promise<void>
  onSkip: () => void
}

export function StepSalon({ initialData, onNext, onSkip }: StepSalonProps) {
  const [salonName, setSalonName] = useState(initialData?.salonName ?? "")
  const [city, setCity] = useState(initialData?.city ?? "")
  const [postcode, setPostcode] = useState(initialData?.postcode ?? "")
  const [currency, setCurrency] = useState<CurrencyCode>(initialData?.currency ?? "GBP")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<"salonName" | "city" | "postcode", string>>>({})

  function validate(): boolean {
    const next: typeof errors = {}
    if (salonName.trim().length < 2) next.salonName = "Salon name must be at least 2 characters"
    if (salonName.trim().length > 60) next.salonName = "Salon name must be 60 characters or fewer"
    if (city.trim().length < 2) next.city = "City must be at least 2 characters"
    if (city.trim().length > 50) next.city = "City must be 50 characters or fewer"
    if (postcode.trim() && !UK_POSTCODE_RE.test(postcode.trim())) {
      next.postcode = "Enter a valid UK postcode"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onNext({ salonName: salonName.trim(), city: city.trim(), postcode: postcode.trim(), currency })
    } catch {
      setErrors({ salonName: "Something went wrong. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold" style={{ color: t.colors.semantic.text }}>
          Tell us about your salon
        </h2>
        <p className="text-sm" style={{ color: t.colors.semantic.textSubtle }}>
          We&apos;ll use this to set up your workspace.
        </p>
      </div>

      <div className="space-y-3.5">
        <FieldGroup label="Salon name" htmlFor="salonName" error={errors.salonName}>
          <OnboardingInput
            id="salonName"
            value={salonName}
            onChange={(v) => { setSalonName(v); setErrors((p) => ({ ...p, salonName: undefined })) }}
            placeholder="e.g. Paws & Claws Grooming"
            icon={<Store size={16} strokeWidth={2} />}
            error={!!errors.salonName}
            autoFocus
          />
        </FieldGroup>

        <FieldGroup label="City / town" htmlFor="city" error={errors.city}>
          <OnboardingInput
            id="city"
            value={city}
            onChange={(v) => { setCity(v); setErrors((p) => ({ ...p, city: undefined })) }}
            placeholder="e.g. Bristol"
            icon={<MapPin size={16} strokeWidth={2} />}
            error={!!errors.city}
          />
        </FieldGroup>

        <FieldGroup label="Postcode" htmlFor="postcode" error={errors.postcode} optional>
          <OnboardingInput
            id="postcode"
            value={postcode}
            onChange={(v) => { setPostcode(v); setErrors((p) => ({ ...p, postcode: undefined })) }}
            placeholder="e.g. BS1 4DJ"
            icon={<Hash size={16} strokeWidth={2} />}
            error={!!errors.postcode}
          />
        </FieldGroup>

        <FieldGroup label="Currency" htmlFor="currency">
          <div className="relative">
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full pl-4 pr-5 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none appearance-none cursor-pointer"
              style={{
                background: t.colors.component.input.bg,
                color: t.colors.component.input.text,
                border: `1px solid ${t.colors.semantic.borderSubtle}`,
                borderRadius: `${t.radius.md}px`,
              }}
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </FieldGroup>
      </div>

      <button
        type="submit"
        disabled={saving || !salonName.trim() || !city.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg font-bold text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary, boxShadow: t.shadow.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryHover }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.shadow.primary }}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <>Next <ArrowRight size={15} /></>}
      </button>

      <p className="text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs cursor-pointer transition-colors"
          style={{ color: t.colors.semantic.textSubtle }}
          onMouseEnter={(e) => { e.currentTarget.style.color = t.colors.semantic.text }}
          onMouseLeave={(e) => { e.currentTarget.style.color = t.colors.semantic.textSubtle }}
        >
          Skip for now
        </button>
      </p>
    </form>
  )
}

/* ---- Shared field helpers (local to onboarding) ---- */

function FieldGroup({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wide"
        style={{ color: t.colors.semantic.textMuted }}
      >
        {label}
        {optional && <span className="ml-1 normal-case font-normal" style={{ color: t.colors.semantic.placeholder }}>(optional)</span>}
      </label>
      {children}
      {error && (
        <p
          className="text-xs pl-1 animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ color: t.colors.semantic.error }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export function OnboardingInput({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  autoFocus,
  inputMode,
  prefix,
}: {
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon: React.ReactNode
  error?: boolean
  autoFocus?: boolean
  inputMode?: "text" | "numeric" | "decimal"
  prefix?: string
}) {
  return (
    <div className="relative">
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2"
        style={{ color: t.colors.semantic.textSubtle }}
      >
        {icon}
      </span>
      {prefix && (
        <span
          className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-semibold"
          style={{ color: t.colors.semantic.textMuted }}
        >
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none"
        style={{
          paddingLeft: prefix ? "3.5rem" : "2.75rem",
          paddingRight: "1.25rem",
          background: t.colors.component.input.bg,
          color: t.colors.component.input.text,
          border: `1px solid ${error ? t.colors.semantic.errorBorder : t.colors.semantic.borderSubtle}`,
          borderRadius: `${t.radius.md}px`,
        }}
        onFocus={(e) => { e.currentTarget.style.background = t.colors.component.input.bgFocus }}
        onBlur={(e) => { e.currentTarget.style.background = t.colors.component.input.bg }}
      />
    </div>
  )
}

export { FieldGroup }
