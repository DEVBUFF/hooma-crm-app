"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/tokens"

interface CalendarToolbarProps {
  label: string
  view: "day" | "week"
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: "day" | "week") => void
  /** Current zoom multiplier (0.75 | 1 | 1.25 | 1.5). */
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  canZoomIn: boolean
  canZoomOut: boolean
}

export function CalendarToolbar({
  label,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  zoom,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
}: CalendarToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3"
      style={{
        background: t.colors.semantic.panel,
        borderBottom: `1px solid ${t.colors.semantic.border}`,
      }}
    >
      {/* Left: page title — hidden on mobile (already shown in topbar/header) */}
      <h1
        className="hidden sm:block text-base font-semibold shrink-0"
        style={{ color: t.colors.semantic.textStrong }}
      >
        Calendar
      </h1>

      {/* Center: week range label */}
      <span
        className="text-xs sm:text-sm font-medium"
        style={{ color: t.colors.semantic.text }}
      >
        {label}
      </span>

      {/* Right: nav controls + zoom pill + view segmented control */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Prev / Today / Next */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            aria-label="Previous week"
          >
            <ChevronLeft size={15} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday} className="hidden sm:inline-flex">
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            aria-label="Next week"
          >
            <ChevronRight size={15} />
          </Button>
        </div>

        {/* ── Zoom pill: [−] 100% [+] — hidden on small screens ──────── */}
        <div
          className="hidden sm:flex"
          style={{
            display: "flex",
            alignItems: "center",
            background: t.colors.semantic.surface,
            borderRadius: t.radius.md,
            border: `1px solid ${t.colors.semantic.border}`,
            padding: "2px 3px",
            gap: 1,
          }}
        >
          <button
            onClick={onZoomOut}
            disabled={!canZoomOut}
            aria-label="Zoom out"
            style={{
              width: 22,
              height: 22,
              borderRadius: t.radius.sm,
              border: "none",
              background: "transparent",
              cursor: canZoomOut ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              lineHeight: 1,
              color: t.colors.semantic.textMuted,
              opacity: canZoomOut ? 1 : 0.35,
              fontFamily: t.typography.fontFamily.sans,
            }}
          >
            −
          </button>

          <span
            style={{
              minWidth: 36,
              textAlign: "center",
              fontSize: 11,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.semantic.textMuted,
              userSelect: "none",
              fontFamily: t.typography.fontFamily.sans,
            }}
          >
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={onZoomIn}
            disabled={!canZoomIn}
            aria-label="Zoom in"
            style={{
              width: 22,
              height: 22,
              borderRadius: t.radius.sm,
              border: "none",
              background: "transparent",
              cursor: canZoomIn ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              lineHeight: 1,
              color: t.colors.semantic.textMuted,
              opacity: canZoomIn ? 1 : 0.35,
              fontFamily: t.typography.fontFamily.sans,
            }}
          >
            +
          </button>
        </div>

        {/* Segmented control: Day / Week */}
        <div
          className="flex items-center p-0.5"
          style={{
            background: t.colors.semantic.surface,
            borderRadius: t.radius.md,
            border: `1px solid ${t.colors.semantic.border}`,
          }}
        >
          {(["day", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className="capitalize text-[11px] font-semibold px-3.5 py-1.5 transition-all duration-[180ms]"
              style={{
                borderRadius: t.radius.sm,
                background:
                  view === v ? t.colors.semantic.panel : "transparent",
                color:
                  view === v
                    ? t.colors.semantic.textStrong
                    : t.colors.semantic.textMuted,
                boxShadow: view === v ? t.shadow.sm : "none",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
