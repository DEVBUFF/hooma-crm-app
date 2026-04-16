"use client"

import { useEffect, useState, useCallback } from "react"
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth/AuthProvider"
import { getSalonByOwnerId } from "@/lib/salon"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { OnboardingProgress, type OnboardingStep } from "@/app/onboarding/_components/onboarding-progress"
import { StepSalon, getCurrencySymbol, type CurrencyCode } from "@/app/onboarding/_components/step-salon"
import { StepService } from "@/app/onboarding/_components/step-service"
import { StepStaff } from "@/app/onboarding/_components/step-staff"
import { t } from "@/lib/tokens"

interface OnboardingModalProps {
  open: boolean
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingModal({ open, onComplete, onSkip }: OnboardingModalProps) {
  const { user, loading: authLoading } = useAuth()

  const [step, setStep] = useState<OnboardingStep>(1)
  const [salonId, setSalonId] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [initialising, setInitialising] = useState(true)

  const [currency, setCurrency] = useState<CurrencyCode>("GBP")

  // Saved data for back-navigation pre-fill
  const [salonData, setSalonData] = useState<{ salonName: string; city: string; postcode: string; currency: CurrencyCode } | undefined>()
  const [serviceData, setServiceData] = useState<{ serviceName: string; duration: number; price: string } | undefined>()
  const [staffData, setStaffData] = useState<{ staffName: string; role: string; colour: string } | undefined>()

  // Determine starting step based on existing data
  useEffect(() => {
    if (!open || authLoading || !user) return

    ;(async () => {
      try {
        const salon = await getSalonByOwnerId(user.uid)
        if (!salon) {
          setInitialising(false)
          return
        }

        setSalonId(salon.id)

        if (salon.onboardingCompleted) {
          onComplete()
          return
        }

        // Check which steps are already done
        const hasSalonName = !!(salon.salonName || salon.name)
        const servicesSnap = await getDocs(query(collection(db, "salons", salon.id, "services"), limit(1)))
        const hasServices = !servicesSnap.empty
        const staffSnap = await getDocs(query(collection(db, "salons", salon.id, "staff"), limit(1)))
        const hasStaff = !staffSnap.empty

        // Pre-fill salon data if available
        const salonCurrency = (salon.settings?.currency as CurrencyCode) || "GBP"
        setCurrency(salonCurrency)
        if (hasSalonName) {
          setSalonData({
            salonName: salon.salonName || salon.name || "",
            city: salon.city || "",
            postcode: salon.postcode || "",
            currency: salonCurrency,
          })
        }

        // If all steps already have data, mark complete
        if (hasSalonName && hasServices && hasStaff) {
          await updateDoc(doc(db, "salons", salon.id), { onboardingCompleted: true })
          onComplete()
          return
        }

        // Find the right starting step
        if (!hasSalonName) setStep(1)
        else if (!hasServices) setStep(2)
        else if (!hasStaff) setStep(3)

        if (hasServices && !servicesSnap.empty) {
          setServiceId(servicesSnap.docs[0].id)
        }
      } catch (err) {
        console.error("[onboarding] init error", err)
      } finally {
        setInitialising(false)
      }
    })()
  }, [open, authLoading, user, onComplete])

  const handleSalonNext = useCallback(async (data: { salonName: string; city: string; postcode: string; currency: CurrencyCode }) => {
    if (!salonId) return
    await updateDoc(doc(db, "salons", salonId), {
      salonName: data.salonName,
      city: data.city,
      postcode: data.postcode || null,
      "settings.currency": data.currency,
    })
    setCurrency(data.currency)
    setSalonData(data)
    setStep(2)
  }, [salonId])

  const handleServiceNext = useCallback(async (data: { serviceName: string; duration: number; price: number }) => {
    if (!salonId) return
    const ref = await addDoc(collection(db, "salons", salonId, "services"), {
      name: data.serviceName,
      durationMinutes: data.duration,
      price: data.price,
      isActive: true,
    })
    setServiceId(ref.id)
    setServiceData({
      serviceName: data.serviceName,
      duration: data.duration,
      price: (data.price / 100).toString(),
    })
    setStep(3)
  }, [salonId])

  const handleStaffFinish = useCallback(async (data: { staffName: string; role: string; colour: string }) => {
    if (!salonId) return

    await addDoc(collection(db, "salons", salonId, "staff"), {
      name: data.staffName,
      role: data.role,
      color: data.colour,
      isActive: true,
      createdAt: serverTimestamp(),
      ...(serviceId ? { serviceIds: [serviceId] } : {}),
    })
    setStaffData(data)

    await updateDoc(doc(db, "salons", salonId), { onboardingCompleted: true, onboardingSkipped: false })

    toast.success("You're all set! Start adding your first booking.")
    onComplete()
  }, [salonId, serviceId, onComplete])

  const handleSkip = useCallback(async () => {
    if (!salonId) {
      onSkip()
      return
    }
    await updateDoc(doc(db, "salons", salonId), { onboardingSkipped: true })
    onSkip()
  }, [salonId, onSkip])

  return (
    <Dialog open={open} onOpenChange={() => { /* prevent closing by clicking overlay */ }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md p-0 border-0 overflow-hidden"
        style={{
          background: t.colors.component.card.bgAuth,
          borderRadius: `${t.radius["2xl"]}px`,
          boxShadow: t.shadow.authCard,
          border: `1px solid ${t.colors.semantic.borderSubtle}`,
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Set up your salon</DialogTitle>

        {initialising ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: t.colors.semantic.primary }} />
          </div>
        ) : (
          <div className="px-7 py-8 sm:px-8 sm:py-9">
            {/* Progress */}
            <div className="mb-8">
              <OnboardingProgress currentStep={step} />
            </div>

            {/* Steps */}
            {step === 1 && (
              <StepSalon
                initialData={salonData}
                onNext={handleSalonNext}
                onSkip={handleSkip}
              />
            )}
            {step === 2 && (
              <StepService
                initialData={serviceData}
                currencySymbol={getCurrencySymbol(currency)}
                onNext={handleServiceNext}
                onBack={() => setStep(1)}
                onSkip={handleSkip}
              />
            )}
            {step === 3 && (
              <StepStaff
                initialData={staffData}
                onFinish={handleStaffFinish}
                onBack={() => setStep(2)}
                onSkip={handleSkip}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
