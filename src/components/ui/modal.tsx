"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Sizes — panel max-width only; height is always content-driven
// ---------------------------------------------------------------------------
const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

type ModalSize = keyof typeof SIZE_CLASSES;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the user requests closing (overlay click, ESC, close button) */
  onOpenChange: (open: boolean) => void;
  /** Panel width preset */
  size?: ModalSize;
  /** Hides the default close (×) button in the top-right corner */
  hideCloseButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Root — Modal
// ---------------------------------------------------------------------------

function Modal({
  open,
  onOpenChange,
  size = "md",
  hideCloseButton = false,
  children,
  className,
}: ModalProps) {
  // ── ESC key handler ───────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // ── Scroll-lock ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  // Rendered into <body> so it always escapes stacking contexts
  return createPortal(
    <div
      role="presentation"
      // Overlay
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        // Overlay background — warm dark tint consistent with the app palette
        "bg-[rgba(46,33,28,0.45)] backdrop-blur-[2px]",
        // Enter animation — tw-animate-css utilities imported via globals.css
        "animate-in fade-in duration-200",
      )}
      onClick={(e) => {
        // Only close when the overlay itself (not the panel) is clicked
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          // Layout
          "relative w-full flex flex-col",
          // Shape — radius.2xl (28 px) for big surfaces, matching auth card / calendar close-day panel
          "rounded-[28px]",
          // Colours — bg-card maps to --color-card (#E5DACA)
          "bg-card text-foreground",
          // Border — same subtle line used across all Hooma panels
          "border border-[rgba(229,218,203,0.60)]",
          // Shadow — cardElevated from tokens
          "shadow-[0_12px_40px_rgba(90,60,30,0.08)]",
          // Size
          SIZE_CLASSES[size],
          // Enter animation
          "animate-in fade-in zoom-in-[0.97] duration-200",
          className,
        )}
        // Prevent clicks inside the panel from bubbling to the overlay
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {!hideCloseButton && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className={cn(
              "absolute top-4 right-4 z-10",
              "w-7 h-7 rounded-full flex items-center justify-center",
              "text-muted-foreground",
              "bg-transparent hover:bg-muted",
              "transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}

        {children}
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// ModalHeader
// ---------------------------------------------------------------------------

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders a divider below the header */
  divided?: boolean;
}

function ModalHeader({ className, divided = false, children, ...props }: ModalHeaderProps) {
  return (
    <div
      data-slot="modal-header"
      className={cn(
        "px-7 pt-7",
        // Right-pad extra to leave room for the close button
        "pr-12",
        "flex flex-col gap-1",
        divided && "pb-4 border-b border-border/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModalTitle
// ---------------------------------------------------------------------------

function ModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="modal-title"
      className={cn(
        "text-base font-semibold leading-snug text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ModalDescription
// ---------------------------------------------------------------------------

function ModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="modal-description"
      className={cn(
        "text-sm text-muted-foreground leading-normal",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ModalContent  (main body area — scrollable when content is tall)
// ---------------------------------------------------------------------------

function ModalContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="modal-content"
      className={cn(
        "px-7 py-5 flex-1 overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ModalActions  (footer button row)
// ---------------------------------------------------------------------------

export interface ModalActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders a divider above the actions */
  divided?: boolean;
}

function ModalActions({ className, divided = true, ...props }: ModalActionsProps) {
  return (
    <div
      data-slot="modal-actions"
      className={cn(
        "px-7 pb-7 flex items-center justify-end gap-2 flex-wrap",
        divided && "pt-4 border-t border-border/60",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalActions,
};
