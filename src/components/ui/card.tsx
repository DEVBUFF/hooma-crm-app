import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared token-based constants
//
// Every value maps to a CSS var defined in globals.css / @theme inline.
// Nothing here is a hardcoded hex colour — raw rgba() strings are the same
// values that tokens.ts already exposes (e.g. t.shadow.*).
// ---------------------------------------------------------------------------

// Variant → visual recipe
// "default"  — standard dashboard card  (bg-card, hairline shadow ring)
// "elevated" — hero / featured card     (bg-card, deeper shadow)
// "auth"     — login / register panel   (bg-card + backdrop-blur, auth shadow)
// "flat"     — no shadow, just bg       (for inline sections / list items)
const VARIANT_CLASSES = {
  default:
    "bg-card text-card-foreground " +
    "shadow-[var(--hooma-shadow-soft)] " +
    "rounded-2xl",

  elevated:
    "bg-card text-card-foreground " +
    "shadow-[var(--hooma-shadow-elevated)] " +
    "rounded-2xl",

  auth:
    "bg-card text-card-foreground " +
    "backdrop-blur-2xl " +
    "shadow-[var(--hooma-shadow-elevated-auth)] " +
    "rounded-2xl",

  flat:
    "bg-card text-card-foreground " +
    "rounded-2xl",
} as const;

// Padding → spacing applied to Card itself (overridable per-slot via className)
const PADDING_CLASSES = {
  sm: "p-5",   // tokens.spacing.cardPadding - 4 = 20-4 = 16 px → p-4; using p-5 matches calendar panels
  md: "p-6",   // tokens.spacing.cardPadding = 24 px
  lg: "p-8",   // generous, used by the welcome hero (p-10 = 40 px → we use lg = p-8 by default; callers can override)
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CardVariant  = keyof typeof VARIANT_CLASSES;
type CardPadding  = keyof typeof PADDING_CLASSES;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style recipe */
  variant?: CardVariant;
  /** Internal padding size */
  padding?: CardPadding;
  /**
   * When true: adds a subtle lift on hover (translate-y + deeper shadow).
   * Mirrors the QuickCard pattern from the dashboard.
   */
  interactive?: boolean;
  /** Render as a different element (e.g. "a", "article") */
  as?: React.ElementType;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      interactive = false,
      as: Tag = "div",
      ...props
    },
    ref
  ) => (
    <Tag
      ref={ref}
      data-slot="card"
      data-variant={variant}
      className={cn(
        // Base layout
        "flex flex-col",
        // Variant colours / shadow / radius
        VARIANT_CLASSES[variant],
        // Padding
        PADDING_CLASSES[padding],
        // Interactive hover — matches QuickCard style: lift + deeper shadow
        interactive && [
          "cursor-pointer",
          "transition-all duration-200 ease-out",
          "hover:-translate-y-px",
          "hover:shadow-[var(--hooma-shadow-interactive-hover)]",
        ],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// ---------------------------------------------------------------------------
// CardHeader
// ---------------------------------------------------------------------------

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders a horizontal rule below the header */
  divided?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divided = false, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1",
        // When the card has padding the header inherits it; the negative margin
        // trick lets a divided header bleed edge-to-edge without extra wrappers.
        divided && "pb-4 mb-2 border-b border-border/60",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// ---------------------------------------------------------------------------
// CardTitle
// ---------------------------------------------------------------------------

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn("text-base font-semibold leading-snug text-foreground", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// ---------------------------------------------------------------------------
// CardDescription
// ---------------------------------------------------------------------------

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground leading-normal", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// ---------------------------------------------------------------------------
// CardAction  (top-right slot, e.g. a button or badge)
// ---------------------------------------------------------------------------

const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn("ml-auto shrink-0 self-start", className)}
      {...props}
    />
  )
);
CardAction.displayName = "CardAction";

// ---------------------------------------------------------------------------
// CardContent
// ---------------------------------------------------------------------------

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("flex-1", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

// ---------------------------------------------------------------------------
// CardFooter
// ---------------------------------------------------------------------------

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders a horizontal rule above the footer */
  divided?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divided = false, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2",
        divided && "pt-4 mt-2 border-t border-border/60",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};

export type { CardVariant, CardPadding };
