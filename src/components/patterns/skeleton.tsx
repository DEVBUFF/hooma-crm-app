// ─── Skeleton pattern ──────────────────────────────────────────────────────────
// Lightweight shimmer blocks for loading states.
// All shades come from tokens — no hardcoded hex.
//
// Usage:
//   <Skeleton h="h-5" w="w-48" />                    // single block
//   <Skeleton rounded="rounded-full" h="h-10" w="w-10" />  // avatar circle
//
//   <SkeletonList rows={4} />                         // quick list placeholder
//
//   <SkeletonCard />                                  // card with avatar + lines
// ──────────────────────────────────────────────────────────────────────────────
import * as React from 'react'
import { cn } from '@/lib/utils'
import { t } from '@/lib/tokens'

// ── Keyframe injection ────────────────────────────────────────────────────────
// Injected once into <head> so we don't need a globals.css edit.
// The shimmer sweeps a very faint highlight across the base surface colour.

const STYLE_ID = 'hooma-skeleton-keyframes'

function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  // base: t.colors.semantic.surface  (#EDE4D8)
  // highlight: t.colors.semantic.surfaceMuted (#F0E8DC) — one step lighter
  style.textContent = `
    @keyframes hooma-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .hooma-skeleton {
      background: linear-gradient(
        90deg,
        ${t.colors.semantic.surface}        0%,
        ${t.colors.semantic.surfaceMuted}   40%,
        ${t.colors.semantic.surface}        60%,
        ${t.colors.semantic.surface}       100%
      );
      background-size: 200% 100%;
      animation: hooma-shimmer 1.6s ease-in-out infinite;
    }
  `
  document.head.appendChild(style)
}

// ── Base Skeleton block ───────────────────────────────────────────────────────

export interface SkeletonProps {
  /** Tailwind height class, e.g. "h-4", "h-5", "h-10". Default: "h-4" */
  h?: string
  /** Tailwind width class, e.g. "w-full", "w-32". Default: "w-full" */
  w?: string
  /** Tailwind border-radius class. Default: "rounded-[10px]" */
  rounded?: string
  className?: string
}

export function Skeleton({
  h = 'h-4',
  w = 'w-full',
  rounded = 'rounded-[10px]',
  className,
}: SkeletonProps) {
  // Inject keyframes on first render (client only)
  React.useEffect(() => { ensureKeyframes() }, [])

  return (
    <div
      aria-hidden="true"
      className={cn('hooma-skeleton', h, w, rounded, className)}
    />
  )
}

// ── SkeletonList ──────────────────────────────────────────────────────────────
// Renders a stack of rows, each with a narrower last word — mimics text lines.

export interface SkeletonListProps {
  /** Number of rows. Default: 3 */
  rows?: number
  /** Gap between rows. Default: "gap-2.5" */
  gap?: string
  className?: string
}

export function SkeletonList({
  rows = 3,
  gap = 'gap-2.5',
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('flex flex-col', gap, className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => {
        // Last row is slightly narrower to mimic natural text widths
        const isLast = i === rows - 1
        return (
          <Skeleton
            key={i}
            h="h-4"
            w={isLast ? 'w-3/4' : 'w-full'}
          />
        )
      })}
    </div>
  )
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────
// A card-shaped placeholder: square avatar + two text lines + optional footer.

export interface SkeletonCardProps {
  /** Show a footer line (e.g. for action buttons placeholder). Default: false */
  footer?: boolean
  className?: string
}

export function SkeletonCard({ footer = false, className }: SkeletonCardProps) {
  React.useEffect(() => { ensureKeyframes() }, [])

  return (
    <div
      aria-hidden="true"
      className={cn('rounded-[20px] p-5 space-y-4', className)}
      style={{
        background: t.colors.semantic.bg,
        border: `1px solid ${t.colors.semantic.border}`,
        boxShadow: t.shadow.card,
      }}
    >
      {/* Header row: avatar + two meta lines */}
      <div className="flex items-center gap-3">
        <Skeleton h="h-10" w="w-10" rounded="rounded-[12px]" />
        <div className="flex-1 space-y-2">
          <Skeleton h="h-4" w="w-2/3" />
          <Skeleton h="h-3" w="w-1/3" />
        </div>
      </div>

      {/* Body lines */}
      <SkeletonList rows={2} gap="gap-2" />

      {/* Optional footer pill row */}
      {footer && (
        <div className="flex gap-2 pt-1">
          <Skeleton h="h-6" w="w-20" rounded="rounded-full" />
          <Skeleton h="h-6" w="w-16" rounded="rounded-full" />
        </div>
      )}
    </div>
  )
}
