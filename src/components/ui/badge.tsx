import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// badgeVariants
//
// Colours mapped to globals.css --color-status-* and --color-*-bg/text tokens.
// ---------------------------------------------------------------------------

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-full px-2.5 py-1",
    "text-[11px] font-semibold leading-none whitespace-nowrap",
    "w-fit shrink-0 select-none",
    "[&>svg]:size-3 [&>svg]:pointer-events-none [&>svg]:shrink-0",
    "transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        // Neutral — scheduled, default
        default:
          "bg-[var(--color-status-scheduled-bg)] text-[var(--color-text-body)]",

        // Green — confirmed, success, completed
        success:
          "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",

        // Periwinkle — in progress
        info:
          "bg-[var(--color-status-in-progress-bg)] text-[var(--color-text-primary)]",

        // Red — cancelled, error
        error:
          "bg-[var(--color-error-bg)] text-[var(--color-error-text)]",

        // Amber — warning, no-show
        warning:
          "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",

        // Muted neutral — inactive, secondary
        neutral:
          "bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
);

// Dot colour — matches the status border/accent colour
const DOT_VARIANT_CLASS: Record<string, string> = {
  default: "bg-[var(--color-status-scheduled)]",
  success: "bg-[var(--color-status-confirmed)]",
  info:    "bg-[var(--color-status-in-progress)]",
  error:   "bg-[var(--color-status-cancelled)]",
  warning: "bg-[var(--color-status-no-show)]",
  neutral: "bg-[var(--color-status-completed)]",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      <span
        className={cn(
          "inline-block size-[6px] rounded-full shrink-0",
          DOT_VARIANT_CLASS[variant ?? "default"],
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  )
);
Badge.displayName = "Badge";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Badge, badgeVariants };
