// ─── Hooma Toast (Hooma-native, no Radix) ─────────────────────────────────
// This file is the pure visual layer: a single toast pill + its dismiss icon.
// State management lives in toaster.tsx; the imperative API lives in lib/toast.ts.
// The legacy Radix types below are kept for backward-compat with any existing
// code that imported ToastProps / ToastActionElement from this path.
// ──────────────────────────────────────────────────────────────────────────
'use client'

import * as React from 'react'
import { X, CheckCircle2, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Variant definitions ───────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info'

interface VariantConfig {
  /** Wrapper background + border */
  wrapperClass: string
  /** Left accent bar colour */
  accentClass: string
  /** Icon element */
  icon: React.ReactNode
}

const VARIANTS: Record<ToastVariant, VariantConfig> = {
  success: {
    wrapperClass:
      'bg-[#F5EEE4] border-[rgba(168,187,163,0.45)] text-[#3E2F2A]',
    accentClass: 'bg-[#A8BBA3]',
    icon: (
      <CheckCircle2
        size={16}
        strokeWidth={2}
        className="text-[#4A7A4A] shrink-0"
        aria-hidden="true"
      />
    ),
  },
  error: {
    wrapperClass:
      'bg-[#F5EEE4] border-[rgba(196,96,90,0.35)] text-[#3E2F2A]',
    accentClass: 'bg-[#C4605A]',
    icon: (
      <XCircle
        size={16}
        strokeWidth={2}
        className="text-[#A04040] shrink-0"
        aria-hidden="true"
      />
    ),
  },
  info: {
    wrapperClass:
      'bg-[#F5EEE4] border-[rgba(127,166,201,0.40)] text-[#3E2F2A]',
    accentClass: 'bg-[#7FA6C9]',
    icon: (
      <Info
        size={16}
        strokeWidth={2}
        className="text-[#4A7EA8] shrink-0"
        aria-hidden="true"
      />
    ),
  },
}

// ── ToastItem props ───────────────────────────────────────────────────────

export interface ToastItemProps {
  id: string
  variant?: ToastVariant
  title: string
  description?: string
  /** Duration in ms — used to drive the progress bar width animation */
  duration?: number
  onDismiss: (id: string) => void
  /** Controls mount/unmount for the leave animation */
  leaving?: boolean
}

// ── ToastItem ─────────────────────────────────────────────────────────────

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
        // Layout
        'relative flex items-start gap-3 w-full overflow-hidden',
        // Shape — rounded-[18px] matches the calendar inline panels
        'rounded-[18px]',
        // Border + background
        'border',
        cfg.wrapperClass,
        // Padding
        'px-4 py-3.5 pr-10',
        // Shadow — tokens.shadow.md
        'shadow-[0_4px_20px_rgba(62,47,42,0.09)]',
        // Enter animation
        'animate-in fade-in slide-in-from-bottom-3 duration-300',
        // Leave animation
        leaving &&
          'animate-out fade-out slide-out-to-right-4 duration-250 fill-mode-forwards',
      )}
    >
      {/* Left accent bar */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[18px]',
          cfg.accentClass,
        )}
      />

      {/* Icon */}
      <span className="mt-[1px]">{cfg.icon}</span>

      {/* Text */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-semibold leading-snug text-foreground">
          {title}
        </p>
        {description && (
          <p className="text-xs leading-normal text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(id)}
        className={cn(
          'absolute top-3 right-3',
          'w-5 h-5 rounded-full flex items-center justify-center',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted transition-colors duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        )}
      >
        <X size={11} strokeWidth={2.5} aria-hidden="true" />
      </button>

      {/* Auto-dismiss progress bar */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-0 left-0 h-[2px] rounded-full',
          cfg.accentClass,
          'opacity-30',
        )}
        style={{
          animation: `hooma-toast-shrink ${duration}ms linear forwards`,
          width: '100%',
        }}
      />
    </div>
  )
}

// ── Legacy type re-exports (backward-compat) ──────────────────────────────
// The old scaffolded toaster.tsx / use-toast.ts import these names from here.
// Keeping them as simple aliases prevents breaking those files.

export type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive'
}
export type ToastActionElement = React.ReactElement
