// ─── Hooma Toaster ────────────────────────────────────────────────────────────
// Drop <Toaster /> into the root layout once.  Call toast.success/error/info()
// anywhere — no hooks or context required at the call site.
// ──────────────────────────────────────────────────────────────────────────────
'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { ToastItem } from '@/components/ui/toast'
import { subscribeToast, unsubscribeToast } from '@/lib/toast'
import type { ToastInput } from '@/lib/toast'

// ─── internal state shape ────────────────────────────────────────────────────

interface ToastEntry extends ToastInput {
  id: string
  leaving: boolean
}

// ─── keyframe injection (progress-bar shrink animation) ──────────────────────

const STYLE_ID = 'hooma-toast-keyframes'

function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    @keyframes hooma-toast-shrink {
      from { width: 100%; }
      to   { width: 0%;   }
    }
  `
  document.head.appendChild(style)
}

// ─── Toaster component ───────────────────────────────────────────────────────

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([])
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Inject keyframes once
  React.useEffect(() => { ensureKeyframes() }, [])

  // ── schedule auto-dismiss ────────────────────────────────────────────────
  const scheduleRemove = React.useCallback((id: string, duration: number) => {
    const t = setTimeout(() => {
      // 1. mark leaving (triggers exit animation)
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
      // 2. remove after animation (300 ms)
      const cleanup = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        timersRef.current.delete(id)
      }, 320)
      timersRef.current.set(id + '_cleanup', cleanup)
    }, duration)
    timersRef.current.set(id, t)
  }, [])

  // ── add a toast ──────────────────────────────────────────────────────────
  const add = React.useCallback((input: ToastInput) => {
    const id = Math.random().toString(36).slice(2, 9)
    const duration = input.duration ?? 3500
    setToasts(prev => [...prev, { ...input, id, leaving: false }])
    scheduleRemove(id, duration)
  }, [scheduleRemove])

  // ── dismiss immediately ──────────────────────────────────────────────────
  const dismiss = React.useCallback((id: string) => {
    const t = timersRef.current.get(id)
    if (t) { clearTimeout(t); timersRef.current.delete(id) }
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
    const cleanup = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      timersRef.current.delete(id + '_cleanup')
    }, 320)
    timersRef.current.set(id + '_cleanup', cleanup)
  }, [])

  // ── subscribe / unsubscribe imperative calls ────────────────────────────
  React.useEffect(() => {
    subscribeToast(add)
    return () => unsubscribeToast(add)
  }, [add])

  // ── clear all timers on unmount ─────────────────────────────────────────
  React.useEffect(() => {
    const ref = timersRef.current
    return () => { ref.forEach(clearTimeout); ref.clear() }
  }, [])

  if (toasts.length === 0) return null

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2"
      style={{ width: 'min(360px, calc(100vw - 2.5rem))' }}
    >
      {toasts.map(entry => (
        <ToastItem
          key={entry.id}
          id={entry.id}
          variant={entry.variant}
          title={entry.title}
          description={entry.description}
          duration={entry.duration ?? 3500}
          onDismiss={dismiss}
          leaving={entry.leaving}
        />
      ))}
    </div>,
    document.body,
  )
}
