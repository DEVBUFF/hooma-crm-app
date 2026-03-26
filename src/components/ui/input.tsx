import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Renders a 17 px icon absolutely positioned on the left of the field */
  leftIcon?: React.ReactNode;
  /** Shows a red helper text below the field and activates the error border */
  error?: string;
  /** Muted helper/hint text shown below the field (hidden when error is set) */
  helperText?: string;
  /** Label rendered above the field. Pass an `id` to the input for a11y. */
  label?: string;
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      leftIcon,
      error,
      helperText,
      label,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const inputId = id;

    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-xs font-semibold uppercase tracking-wide select-none",
              disabled ? "opacity-50 cursor-not-allowed" : "text-muted-foreground"
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper — hosts the icon + the native input */}
        <div className="relative w-full">
          {/* Left icon */}
          {leftIcon && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center",
                disabled ? "opacity-50" : "text-muted-foreground"
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-hint`
                : undefined
            }
            data-slot="input"
            className={cn(
              // Layout & spacing
              "w-full min-w-0 py-3.5 text-sm font-medium",
              leftIcon ? "pl-11 pr-5" : "px-5",
              // Shape — Apple-style subtle rounding
              "rounded-lg",
              // Colours
              "bg-[--color-input] text-foreground",
              "placeholder:text-[color:var(--color-muted-foreground)]",
              "selection:bg-primary/20 selection:text-foreground",
              // Border — subtle by default
              "border border-border/60",
              // Transitions
              "transition-[background-color,border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.2,0.0,0.0,1.0)]",
              // Remove default browser outline — we supply our own ring
              "outline-none",
              // Focus: primary ring, clean white bg
              "focus:bg-[--color-popover]",
              "focus:border-[var(--hooma-focus-border)]",
              "focus:shadow-[var(--hooma-focus-ring)]",
              // Error state: red border + red ring on focus
              hasError && [
                "border-destructive/60",
                "focus:border-destructive/60",
                "focus:shadow-[var(--hooma-focus-error-ring)]",
              ],
              // Disabled
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              // File input resets
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              className
            )}
            {...props}
          />
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs pl-1 text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
          >
            {error}
          </p>
        )}

        {/* Helper text (hidden when there's an error) */}
        {!hasError && helperText && (
          <p
            id={`${inputId}-hint`}
            className="text-xs pl-1 text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
