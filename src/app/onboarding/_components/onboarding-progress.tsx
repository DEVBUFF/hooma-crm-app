"use client"

import { Check, Store, Sparkles, UserRound } from "lucide-react"
import { t } from "@/lib/tokens"

export type OnboardingStep = 1 | 2 | 3

const STEPS = [
  { label: "Salon", icon: Store },
  { label: "Service", icon: Sparkles },
  { label: "Staff", icon: UserRound },
] as const

export function OnboardingProgress({ currentStep }: { currentStep: OnboardingStep }) {
  return (
    <div className="flex items-center justify-between w-full max-w-xs mx-auto">
      {STEPS.map((step, i) => {
        const stepNum = (i + 1) as OnboardingStep
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        const Icon = step.icon

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isDone
                    ? t.colors.semantic.successBg
                    : isActive
                      ? t.colors.semantic.primary
                      : t.colors.semantic.surface,
                  color: isDone
                    ? t.colors.semantic.successStrong
                    : isActive
                      ? t.colors.semantic.textOnPrimary
                      : t.colors.semantic.placeholder,
                  boxShadow: isActive ? t.shadow.primaryLg : undefined,
                }}
              >
                {isDone ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={2} />}
              </div>
              <span
                className="text-[11px] font-semibold transition-colors duration-200"
                style={{
                  color: isActive
                    ? t.colors.semantic.text
                    : isDone
                      ? t.colors.semantic.successStrong
                      : t.colors.semantic.placeholder,
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-3 mt-[-18px] transition-colors duration-300"
                style={{
                  background: stepNum < currentStep
                    ? t.colors.semantic.successStrong
                    : t.colors.semantic.divider,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
