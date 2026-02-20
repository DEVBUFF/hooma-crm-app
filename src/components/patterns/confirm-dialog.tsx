// ─── ConfirmDialog pattern ─────────────────────────────────────────────────────
// A focused confirmation overlay built on top of <Modal>.
// Used for destructive or consequential actions: delete service, remove staff,
// cancel booking, etc.
//
// Usage:
//   const [open, setOpen] = useState(false)
//
//   <ConfirmDialog
//     open={open}
//     onOpenChange={setOpen}
//     title="Delete service?"
//     description="This will permanently remove Grooming Full. This cannot be undone."
//     confirmText="Delete"
//     tone="danger"
//     onConfirm={handleDelete}
//   />
// ──────────────────────────────────────────────────────────────────────────────
'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalActions,
} from '@/components/ui/modal'
import { t } from '@/lib/tokens'

// ── Tone config ───────────────────────────────────────────────────────────────

type Tone = 'danger' | 'default'

interface ToneConfig {
  iconBg: string
  iconColor: string
  confirmBg: string
  confirmHover: string
  confirmText: string
  confirmShadow: string
}

const TONE: Record<Tone, ToneConfig> = {
  danger: {
    iconBg: t.colors.semantic.errorBg,
    iconColor: t.colors.semantic.error,
    confirmBg: t.colors.semantic.error,
    confirmHover: t.colors.semantic.errorHover,
    confirmText: '#fff',
    confirmShadow: '0 2px 10px rgba(160,64,64,0.25)',
  },
  default: {
    iconBg: t.colors.semantic.infoBg,
    iconColor: t.colors.semantic.primary,
    confirmBg: t.colors.semantic.primary,
    confirmHover: t.colors.semantic.primaryHover,
    confirmText: '#fff',
    confirmShadow: '0 2px 10px rgba(127,166,201,0.25)',
  },
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Short headline — "Delete service?" / "Cancel booking?" */
  title: string
  /** One or two sentences of context. Rendered below the title. */
  description?: string
  /** Label for the destructive / primary confirm button. Default: "Confirm" */
  confirmText?: string
  /** Label for the cancel button. Default: "Cancel" */
  cancelText?: string
  /** Visual tone. `danger` = red confirm; `default` = primary blue. Default: "danger" */
  tone?: Tone
  /** Called when the user clicks the confirm button */
  onConfirm: () => void | Promise<void>
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'danger',
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const cfg = TONE[tone]

  // Reset loading state whenever the dialog opens
  React.useEffect(() => {
    if (open) setLoading(false)
  }, [open])

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="sm" hideCloseButton>
      <ModalHeader className="items-center text-center pt-8">
        {/* Icon badge */}
        <div
          className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-1 mx-auto shrink-0"
          style={{ background: cfg.iconBg }}
          aria-hidden="true"
        >
          <AlertTriangle
            size={22}
            strokeWidth={1.75}
            style={{ color: cfg.iconColor }}
          />
        </div>

        <ModalTitle className="text-center">{title}</ModalTitle>

        {description && (
          <ModalDescription className="text-center mt-0.5">
            {description}
          </ModalDescription>
        )}
      </ModalHeader>

      <ModalActions divided={false} className="flex-col-reverse sm:flex-row pb-7 pt-5 gap-2.5">
        {/* Cancel — always on the left / bottom */}
        <button
          type="button"
          disabled={loading}
          onClick={() => onOpenChange(false)}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          style={{
            background: t.colors.semantic.surface,
            color: t.colors.semantic.textMuted,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = t.colors.semantic.surfaceHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = t.colors.semantic.surface)
          }
        >
          {cancelText}
        </button>

        {/* Confirm */}
        <button
          type="button"
          disabled={loading}
          onClick={handleConfirm}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 active:scale-[0.97]"
          style={{
            background: cfg.confirmBg,
            color: cfg.confirmText,
            boxShadow: cfg.confirmShadow,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = cfg.confirmHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = cfg.confirmBg)
          }
        >
          {loading ? 'Please wait…' : confirmText}
        </button>
      </ModalActions>
    </Modal>
  )
}
