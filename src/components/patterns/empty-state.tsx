// ─── EmptyState pattern ────────────────────────────────────────────────────────
// Used on Services / Staff / Customers (and wherever a list can be empty).
// All colours and radii come from tokens.ts — no hardcoded hex.
// ──────────────────────────────────────────────────────────────────────────────
import * as React from 'react'
import { t } from '@/lib/tokens'
import { cn } from '@/lib/utils'

// ── Action button props ───────────────────────────────────────────────────────

export interface EmptyStateAction {
  /** Button label */
  label: string
  onClick: () => void
}

// ── Icon container accent colours ────────────────────────────────────────────

export type EmptyStateAccent = 'primary' | 'success' | 'warning' | 'neutral'

const ACCENT_BG: Record<EmptyStateAccent, string> = {
  primary: t.colors.semantic.infoBg,
  success: t.colors.semantic.successBg,
  warning: t.colors.semantic.accentTint,
  neutral: t.colors.semantic.bg,
}

const ACCENT_ICON: Record<EmptyStateAccent, string> = {
  primary: t.colors.semantic.primary,
  success: t.colors.semantic.successStrong,
  warning: t.colors.semantic.primary,
  neutral: t.colors.semantic.textMuted,
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Headline text — short, warm, human */
  title: string
  /** Supporting sentence — one line max */
  description?: string
  /** Primary CTA button. Omit when no action is available. */
  action?: EmptyStateAction
  /**
   * Icon node rendered inside the tinted square.
   * Pass a Lucide (or any) element — sizing is handled here.
   *
   * @example <Sparkles size={28} strokeWidth={1.5} />
   */
  icon?: React.ReactNode
  /** Colour palette for the icon background + icon fill. Default: 'primary' */
  accent?: EmptyStateAccent
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  description,
  action,
  icon,
  accent = 'primary',
  className,
}: EmptyStateProps) {
  const iconBg = ACCENT_BG[accent]
  const iconColor = ACCENT_ICON[accent]

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center gap-4 p-16',
        className,
      )}
      style={{
        background: t.colors.semantic.surface,
        borderRadius: `${t.radius['2xl']}px`,
        boxShadow: t.shadow.card,
        // Subtle border so the panel reads as a contained area on light bg
        border: `1px solid ${t.colors.semantic.border}`,
      }}
    >
      {/* Icon pill */}
      {icon && (
        <div
          className="w-16 h-16 flex items-center justify-center shrink-0"
          style={{
            background: iconBg,
            borderRadius: `${t.radius.lg}px`,
            // Colour cascades to SVG currentColor strokes
            color: iconColor,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Copy */}
      <div className="space-y-1.5 max-w-xs">
        <p
          className="text-lg font-semibold leading-snug"
          style={{ color: t.colors.semantic.text }}
        >
          {title}
        </p>
        {description && (
          <p
            className="text-sm leading-normal"
            style={{ color: t.colors.semantic.textSubtle }}
          >
            {description}
          </p>
        )}
      </div>

      {/* CTA */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer hover:opacity-90 active:scale-[0.97]"
          style={{
            background: t.colors.semantic.primary,
            color: t.colors.semantic.textOnPrimary,
            boxShadow: t.shadow.primaryLg,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
