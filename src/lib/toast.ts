// ─── Hooma imperative toast singleton ─────────────────────────────────────────
// Usage anywhere in the app (no hooks, no context):
//   import { toast } from '@/lib/toast'
//   toast.success('Saved!', 'Your changes have been saved.')
//   toast.error('Something went wrong')
//   toast.info('Tip', 'You can drag to reorder.')
// ──────────────────────────────────────────────────────────────────────────────

import type { ToastVariant } from '@/components/ui/toast'

export interface ToastInput {
  variant: ToastVariant
  title: string
  description?: string
  /** Duration in ms before auto-dismiss. Default: 3500 */
  duration?: number
}

type ToastListener = (input: ToastInput) => void

const listeners: ToastListener[] = []

/** Called by <Toaster> once on mount to subscribe to imperative calls. */
export function subscribeToast(fn: ToastListener): void {
  listeners.push(fn)
}

/** Called by <Toaster> on unmount to clean up. */
export function unsubscribeToast(fn: ToastListener): void {
  const idx = listeners.indexOf(fn)
  if (idx !== -1) listeners.splice(idx, 1)
}

function emit(input: ToastInput): void {
  for (const fn of listeners) fn(input)
}

export const toast = {
  success(title: string, description?: string, duration?: number): void {
    emit({ variant: 'success', title, description, duration })
  },
  error(title: string, description?: string, duration?: number): void {
    emit({ variant: 'error', title, description, duration })
  },
  info(title: string, description?: string, duration?: number): void {
    emit({ variant: 'info', title, description, duration })
  },
}
