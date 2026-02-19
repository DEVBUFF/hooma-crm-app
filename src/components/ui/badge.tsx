import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// badgeVariants
//
// Colour mapping — every pair below comes directly from tokens.ts semantics:
//
//   default  → primary bg tint   (infoBg / info)        #E4EEF6 / #4A7EA8
//   success  → successBg / success                       #E8EFE7 / #4A7A4A
//   error    → errorBg / error                           #F0D8D3 / #A04040
//   info     → infoBg / info                             #E4EEF6 / #4A7EA8
//   warning  → warningBg / warning                       #F5EFE6 / #A8998C
//   neutral  → surfaceMuted / textMuted                  #F0E8DC / #7A655A
//
// All CSS var references match the @theme inline block in globals.css.
// ---------------------------------------------------------------------------

const badgeVariants = cva(
  // Base — pill shape, text, icon sizing, no pointer-events on SVGs
  [
    "inline-flex items-center justify-center gap-1",
    "rounded-full px-2.5 py-0.5",
    "text-[11px] font-semibold leading-none whitespace-nowrap",
    "w-fit shrink-0 select-none",
    "[&>svg]:size-3 [&>svg]:pointer-events-none [&>svg]:shrink-0",
    "transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        // Calm-blue tint — confirmed bookings, general "primary" state
        default:
          "bg-[#E4EEF6] text-[#4A7EA8]",

        // Sage-green tint — completed, active, success
        success:
          "bg-[#E8EFE7] text-[#4A7A4A]",

        // Dusty-red tint — canceled, error, destructive
        error:
          "bg-[#F0D8D3] text-[#A04040]",

        // Same as default but semantically "informational"
        info:
          "bg-[#E4EEF6] text-[#4A7EA8]",

        // Warm-sand tint — warnings, no-show
        warning:
          "bg-[#F5EFE6] text-[#A8998C]",

        // Muted surface — inactive, neutral, secondary labels
        neutral:
          "bg-[#F0E8DC] text-[#7A655A]",
      },

      // Dot prefix — renders a small coloured circle before the label
      dot: {
        true:  "",   // handled by before: pseudo via data-dot
        false: "",
      },
    },

    defaultVariants: {
      variant: "default",
      dot: false,
    },
  }
);

// Dot colour — inherits the badge's text colour via currentColor
const DOT_VARIANT_CLASS: Record<string, string> = {
  default: "before:bg-[#4A7EA8]",
  success: "before:bg-[#4A7A4A]",
  error:   "before:bg-[#A04040]",
  info:    "before:bg-[#4A7EA8]",
  warning: "before:bg-[#A8998C]",
  neutral: "before:bg-[#7A655A]",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Prepends a small filled circle that matches the variant colour */
  dot?: boolean;
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", dot = false, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      data-variant={variant}
      className={cn(
        badgeVariants({ variant, dot }),
        // Dot pseudo-element — 5 px circle, vertically centred
        dot && [
          "before:content-[''] before:inline-block",
          "before:size-[5px] before:rounded-full before:shrink-0",
          DOT_VARIANT_CLASS[variant ?? "default"],
        ],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Badge, badgeVariants };
