"use client"

import { useState } from "react"
import { UserRound, ArrowLeft, Loader2, Check } from "lucide-react"
import { t } from "@/lib/tokens"
import { OnboardingInput, FieldGroup } from "./step-salon"

const ROLE_OPTIONS = [
  { label: "Groomer", value: "groomer" },
  { label: "Bather", value: "bather" },
  { label: "Trainee", value: "trainee" },
  { label: "Owner", value: "owner" },
]

const PRESET_COLOURS = [
  { hex: "#6366F1", name: "Indigo" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#F59E0B", name: "Amber" },
  { hex: "#10B981", name: "Emerald" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#8B5CF6", name: "Violet" },
]

interface StepStaffProps {
  initialData?: { staffName: string; role: string; colour: string }
  onFinish: (data: { staffName: string; role: string; colour: string }) => Promise<void>
  onBack: () => void
  onSkip: () => void
}

export function StepStaff({ initialData, onFinish, onBack, onSkip }: StepStaffProps) {
  const [staffName, setStaffName] = useState(initialData?.staffName ?? "")
  const [role, setRole] = useState(initialData?.role ?? "groomer")
  const [colour, setColour] = useState(initialData?.colour ?? PRESET_COLOURS[0].hex)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<"staffName", string>>>({})

  function validate(): boolean {
    const next: typeof errors = {}
    if (staffName.trim().length < 2) next.staffName = "Name must be at least 2 characters"
    if (staffName.trim().length > 50) next.staffName = "Name must be 50 characters or fewer"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onFinish({ staffName: staffName.trim(), role, colour })
    } catch {
      setErrors({ staffName: "Something went wrong. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold" style={{ color: t.colors.semantic.text }}>
          Add your first team member
        </h2>
        <p className="text-sm" style={{ color: t.colors.semantic.textSubtle }}>
          This could be you or someone on your team.
        </p>
      </div>

      <div className="space-y-3.5">
        <FieldGroup label="Name" htmlFor="staffName" error={errors.staffName}>
          <OnboardingInput
            id="staffName"
            value={staffName}
            onChange={(v) => { setStaffName(v); setErrors((p) => ({ ...p, staffName: undefined })) }}
            placeholder="e.g. Sarah"
            icon={<UserRound size={16} strokeWidth={2} />}
            error={!!errors.staffName}
            autoFocus
          />
        </FieldGroup>

        <FieldGroup label="Role" htmlFor="role">
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: t.colors.semantic.textSubtle }}
            >
              <UserRound size={16} strokeWidth={2} className="opacity-0" />
            </span>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-4 pr-5 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none appearance-none cursor-pointer"
              style={{
                background: t.colors.component.input.bg,
                color: t.colors.component.input.text,
                border: `1px solid ${t.colors.semantic.borderSubtle}`,
                borderRadius: `${t.radius.md}px`,
              }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </FieldGroup>

        <FieldGroup label="Colour" htmlFor="colour">
          <div className="flex gap-3 pt-1">
            {PRESET_COLOURS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColour(c.hex)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  background: c.hex,
                  boxShadow: colour === c.hex ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : undefined,
                  transform: colour === c.hex ? "scale(1.1)" : "scale(1)",
                }}
                title={c.name}
                aria-label={`Select ${c.name} colour`}
              >
                {colour === c.hex && <Check size={16} strokeWidth={3} color="white" />}
              </button>
            ))}
          </div>
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
          disabled={saving || !staffName.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg font-bold text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary, boxShadow: t.shadow.primary }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryHover }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.shadow.primary }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <>Finish</>}
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
