"use client"

import { useState } from "react"
import { Sparkles, Clock, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { t } from "@/lib/tokens"
import { OnboardingInput, FieldGroup } from "./step-salon"

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hr", value: 60 },
  { label: "1.5 hrs", value: 90 },
  { label: "2 hrs", value: 120 },
  { label: "2.5 hrs", value: 150 },
  { label: "3 hrs", value: 180 },
]

interface StepServiceProps {
  initialData?: { serviceName: string; duration: number; price: string }
  currencySymbol?: string
  onNext: (data: { serviceName: string; duration: number; price: number }) => Promise<void>
  onBack: () => void
  onSkip: () => void
}

export function StepService({ initialData, currencySymbol = "£", onNext, onBack, onSkip }: StepServiceProps) {
  const [serviceName, setServiceName] = useState(initialData?.serviceName ?? "")
  const [duration, setDuration] = useState(initialData?.duration ?? 60)
  const [price, setPrice] = useState(initialData?.price ?? "")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<"serviceName" | "price", string>>>({})

  function validate(): boolean {
    const next: typeof errors = {}
    if (serviceName.trim().length < 2) next.serviceName = "Service name must be at least 2 characters"
    if (serviceName.trim().length > 60) next.serviceName = "Service name must be 60 characters or fewer"
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0 || priceNum > 999.99) {
      next.price = "Enter a valid price (0 – 999.99)"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onNext({
        serviceName: serviceName.trim(),
        duration,
        price: Math.round(parseFloat(price) * 100), // store in pence
      })
    } catch {
      setErrors({ serviceName: "Something went wrong. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold" style={{ color: t.colors.semantic.text }}>
          Add your first service
        </h2>
        <p className="text-sm" style={{ color: t.colors.semantic.textSubtle }}>
          What&apos;s the main grooming service you offer?
        </p>
      </div>

      <div className="space-y-3.5">
        <FieldGroup label="Service name" htmlFor="serviceName" error={errors.serviceName}>
          <OnboardingInput
            id="serviceName"
            value={serviceName}
            onChange={(v) => { setServiceName(v); setErrors((p) => ({ ...p, serviceName: undefined })) }}
            placeholder="e.g. Full Groom"
            icon={<Sparkles size={16} strokeWidth={2} />}
            error={!!errors.serviceName}
            autoFocus
          />
        </FieldGroup>

        <FieldGroup label="Duration" htmlFor="duration">
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: t.colors.semantic.textSubtle }}
            >
              <Clock size={16} strokeWidth={2} />
            </span>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full pl-11 pr-5 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none appearance-none cursor-pointer"
              style={{
                background: t.colors.component.input.bg,
                color: t.colors.component.input.text,
                border: `1px solid ${t.colors.semantic.borderSubtle}`,
                borderRadius: `${t.radius.md}px`,
              }}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </FieldGroup>

        <FieldGroup label="Price" htmlFor="price" error={errors.price}>
          <OnboardingInput
            id="price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(v) => {
              // Allow only digits and one decimal point
              if (/^\d*\.?\d{0,2}$/.test(v) || v === "") {
                setPrice(v)
                setErrors((p) => ({ ...p, price: undefined }))
              }
            }}
            placeholder="e.g. 45"
            icon={<Sparkles size={16} strokeWidth={2} className="opacity-0" />}
            prefix={currencySymbol}
            error={!!errors.price}
          />
        </FieldGroup>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40"
          style={{ background: t.colors.semantic.surface, color: t.colors.semantic.textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.colors.semantic.surfaceHover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = t.colors.semantic.surface }}
        >
          <ArrowLeft size={15} />
        </button>
        <button
          type="submit"
          disabled={saving || !serviceName.trim() || !price}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg font-bold text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary, boxShadow: t.shadow.primary }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryHover }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.shadow.primary }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <>Next <ArrowRight size={15} /></>}
        </button>
      </div>

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
