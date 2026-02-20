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
}

export function CalendarToolbar({
  label,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: CalendarToolbarProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3"
      style={{
        background: t.colors.component.card.bg,
        borderRadius: t.radius.xl,
        boxShadow: t.shadow.card,
        border: `1px solid ${t.colors.semantic.borderSubtle}`,
      }}
    >
      {/* Left: page title */}
      <h1
        className="text-base font-semibold shrink-0"
        style={{ color: t.colors.semantic.textStrong }}
      >
        Calendar
      </h1>

      {/* Center: week range label */}
      <span
        className="text-sm font-medium"
        style={{ color: t.colors.semantic.text }}
      >
        {label}
      </span>

      {/* Right: nav controls + view segmented control */}
      <div className="flex items-center gap-2 shrink-0">
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
          <Button variant="ghost" size="sm" onClick={onToday}>
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

        {/* Segmented control: Day / Week */}
        <div
          className="flex items-center p-0.5"
          style={{
            background: t.colors.semantic.surface,
            borderRadius: t.radius.full,
          }}
        >
          {(["day", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className="capitalize text-[11px] font-semibold px-3.5 py-1.5 transition-all duration-[180ms]"
              style={{
                borderRadius: t.radius.full,
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
