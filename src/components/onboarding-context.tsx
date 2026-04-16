"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getSalonByOwnerId } from "@/lib/salon"

interface OnboardingContextValue {
  showModal: boolean
  openModal: () => void
  closeModal: () => void
  /** True when the user skipped onboarding (show banner) */
  wasSkipped: boolean
  markSkipped: () => void
  markCompleted: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [wasSkipped, setWasSkipped] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const salon = await getSalonByOwnerId(user.uid)
      if (!salon) {
        setChecked(true)
        return
      }
      if (salon.onboardingCompleted) {
        setChecked(true)
        return
      }
      if (salon.onboardingSkipped) {
        setWasSkipped(true)
      } else {
        setShowModal(true)
      }
      setChecked(true)
    })()
  }, [user])

  const openModal = useCallback(() => setShowModal(true), [])
  const closeModal = useCallback(() => setShowModal(false), [])
  const markSkipped = useCallback(() => {
    setShowModal(false)
    setWasSkipped(true)
  }, [])
  const markCompleted = useCallback(() => {
    setShowModal(false)
    setWasSkipped(false)
  }, [])

  if (!checked) return <>{children}</>

  return (
    <OnboardingContext.Provider value={{ showModal, openModal, closeModal, wasSkipped, markSkipped, markCompleted }}>
      {children}
    </OnboardingContext.Provider>
  )
}

const NOOP = () => {}
const DEFAULT_VALUE: OnboardingContextValue = {
  showModal: false,
  openModal: NOOP,
  closeModal: NOOP,
  wasSkipped: false,
  markSkipped: NOOP,
  markCompleted: NOOP,
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  return ctx ?? DEFAULT_VALUE
}
