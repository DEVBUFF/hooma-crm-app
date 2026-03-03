import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// buttonVariants
// All colour values reference CSS custom-properties that are defined in
// globals.css / @theme inline, so no hardcoded hex values appear here.
// Pill shape is achieved with rounded-full (maps to border-radius: 9999px).
// ---------------------------------------------------------------------------
const buttonVariants = cva(
  // Base — shared by every variant
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-semibold text-sm leading-none",
    "rounded-lg",                               // Apple-style: subtle rounded, not pill
    "transition-all duration-[180ms] ease-[cubic-bezier(0.2,0.0,0.0,1.0)]",
    "active:scale-[0.98]",
    "select-none shrink-0",
    // Icon sizing
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    // Focus ring using the project ring token
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      // ------------------------------------------------------------------
      // visual style
      // ------------------------------------------------------------------
      variant: {
        /** Blue filled — primary CTA (Apple style) */
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_4px_rgba(0,113,227,0.20)] " +
          "hover:bg-[color-mix(in_srgb,var(--color-primary)_85%,black)] hover:shadow-[0_2px_8px_rgba(0,113,227,0.30)]",

        /** Green filled — secondary CTA */
        secondary:
          "bg-secondary text-secondary-foreground " +
          "hover:bg-[color-mix(in_srgb,var(--color-secondary)_85%,black)]",

        /** No background, no border — subtle action inside cards / toolbars */
        ghost:
          "bg-transparent text-muted-foreground " +
          "hover:bg-muted hover:text-foreground",

        /** Transparent with a visible border */
        outline:
          "border border-border bg-transparent text-foreground " +
          "hover:bg-muted hover:border-[color-mix(in_srgb,var(--color-border)_70%,black)]",

        /** Accent orange — matches the calendar "Book" button */
        accent:
          "bg-[var(--terra)] text-white shadow-[0_1px_4px_rgba(255,107,61,0.20)] " +
          "hover:bg-[color-mix(in_srgb,var(--terra)_85%,black)] hover:shadow-[0_2px_8px_rgba(255,107,61,0.30)]",

        /** Destructive */
        destructive:
          "bg-destructive text-destructive-foreground " +
          "hover:bg-[color-mix(in_srgb,var(--color-destructive)_85%,black)] " +
          "focus-visible:ring-destructive/40",
      },

      // ------------------------------------------------------------------
      // size
      // ------------------------------------------------------------------
      size: {
        sm:      "h-8  px-4  text-[11px] gap-1.5",
        default: "h-10 px-5  text-sm",
        md:      "h-10 px-5  text-sm",
        lg:      "h-12 px-7  text-base",
        icon:    "h-9  w-9  p-0",
      },

      // ------------------------------------------------------------------
      // full width
      // ------------------------------------------------------------------
      fullWidth: {
        true:  "w-full",
        false: "w-auto",
      },
    },

    defaultVariants: {
      variant:   "primary",
      size:      "md",
      fullWidth: false,
    },
  }
);

// ---------------------------------------------------------------------------
// ButtonProps
// ---------------------------------------------------------------------------
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child component (Radix Slot) */
  asChild?: boolean;
  /** Shows a spinner and blocks interaction — does NOT change disabled attr */
  loading?: boolean;
  /** Render as full-width block */
  fullWidth?: boolean;
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-slot="button"
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
            {/* Keep children so the button doesn't change width */}
            <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
