// ─── Hooma Toast ─────────────────────────────────────────────────────────────
// Pure visual layer: a single toast pill + dismiss icon.
// State management lives in toaster.tsx; imperative API in lib/toast.ts.
// ─────────────────────────────────────────────────────────────────────────────
'use client'

import * as React from 'react'
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Variant definitions ────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface VariantConfig {
  bg: string
  border: string
  text: string
  icon: React.ReactNode
}

const VARIANTS: Record<ToastVariant, VariantConfig> = {
  success: {
    bg: 'bg-[var(--color-success-bg)]',
    border: 'border-[var(--color-success-border)]/20',
    text: 'text-[var(--color-success-text)]',
    icon: (
      <CheckCircle2
        size={18}
        strokeWidth={2}
        className="text-[var(--color-success-border)] shrink-0"
        aria-hidden="true"
      />
    ),
  },
  error: {
    bg: 'bg-[var(--color-error-bg)]',
    border: 'border-[var(--color-error-border)]/20',
    text: 'text-[var(--color-error-text)]',
    icon: (
      <XCircle
        size={18}
        strokeWidth={2}
        className="text-[var(--color-error-border)] shrink-0"
        aria-hidden="true"
      />
    ),
  },
  warning: {
    bg: 'bg-[var(--color-warning-bg)]',
    border: 'border-[var(--color-warning-border)]/20',
    text: 'text-[var(--color-warning-text)]',
    icon: (
      <AlertTriangle
        size={18}
        strokeWidth={2}
        className="text-[var(--color-warning-border)] shrink-0"
        aria-hidden="true"
      />
    ),
  },
  info: {
    bg: 'bg-[var(--color-info-bg)]',
    border: 'border-[var(--color-info-border)]/20',
    text: 'text-[var(--color-info-text)]',
    icon: (
      <Info
        size={18}
        strokeWidth={2}
        className="text-[var(--color-info-border)] shrink-0"
        aria-hidden="true"
      />
    ),
  },
}

// ── ToastItem props ────────────────────────────────────────────────────────

export interface ToastItemProps {
  id: string
  variant?: ToastVariant
  title: string
  description?: string
  duration?: number
  onDismiss: (id: string) => void
  leaving?: boolean
}

// ── ToastItem ──────────────────────────────────────────────────────────────

export function ToastItem({
  id,
  variant = 'info',
  title,
  description,
  duration = 3500,
  onDismiss,
  leaving = false,
}: ToastItemProps) {
  const cfg = VARIANTS[variant]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-leaving={leaving || undefined}
      className={cn(
        'relative flex items-center gap-3 w-full overflow-hidden',
        'rounded-[var(--radius-lg)]',
        'border',
        cfg.bg,
        cfg.border,
        cfg.text,
        'px-5 py-4 pr-10',
        'shadow-[var(--shadow-sm)]',
        'animate-in fade-in slide-in-from-bottom-3 duration-300',
        leaving &&
          'animate-out fade-out slide-out-to-right-4 duration-250 fill-mode-forwards',
      )}
    >
      {/* Icon */}
      {cfg.icon}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium leading-snug">
          {title}
          {description && (
            <span className="font-normal opacity-80"> {description}</span>
          )}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(id)}
        className={cn(
          'absolute top-3.5 right-3.5',
          'w-5 h-5 rounded-full flex items-center justify-center',
          'opacity-40 hover:opacity-70',
          'transition-opacity duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        )}
      >
        <X size={12} strokeWidth={2.5} aria-hidden="true" />
      </button>

      {/* Auto-dismiss progress bar */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-0 left-0 h-[2px] rounded-full opacity-25',
        )}
        style={{
          backgroundColor: 'currentColor',
          animation: `hooma-toast-shrink ${duration}ms linear forwards`,
          width: '100%',
        }}
      />
    </div>
  )
}

// ── Legacy type re-exports (backward-compat) ─────────────────────────────

export type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive'
}
export type ToastActionElement = React.ReactElement
