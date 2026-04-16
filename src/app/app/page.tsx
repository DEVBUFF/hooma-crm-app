"use client"

import { useEffect, useState, useCallback } from "react"
import { signOut } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/components/auth/AuthProvider"
import { getSalonByOwnerId } from "@/lib/salon"
import { useOnboarding } from "@/components/onboarding-context"
import { t } from "@/lib/tokens"
import { ArrowRight, Sparkles, Users, CalendarDays, X } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function AppHomePage() {
  const { user } = useAuth()
  const { wasSkipped, openModal } = useOnboarding()
  const [showBanner, setShowBanner] = useState(false)
  const [salonId, setSalonId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !wasSkipped) return
    ;(async () => {
      const salon = await getSalonByOwnerId(user.uid)
      if (salon) {
        const dismissals = salon.onboardingBannerDismissals ?? 0
        if (dismissals < 3) {
          setSalonId(salon.id)
          setShowBanner(true)
        }
      }
    })()
  }, [user, wasSkipped])

  const dismissBanner = useCallback(async () => {
    setShowBanner(false)
    if (!salonId) return
    const salon = await getSalonByOwnerId(user!.uid)
    const current = salon?.onboardingBannerDismissals ?? 0
    await updateDoc(doc(db, "salons", salonId), {
      onboardingBannerDismissals: current + 1,
    })
  }, [salonId, user])

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  })()

  const firstName = user?.email?.split("@")[0] ?? "there"

  const handleLogout = async () => {
    await signOut(auth)
    window.location.href = "/"
  }

  void handleLogout

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl">
      {/* Onboarding banner for skipped users */}
      {showBanner && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
          style={{
            background: t.colors.semantic.accentTint,
            border: `1px solid ${t.colors.semantic.borderSubtle}`,
          }}
        >
          <button
            onClick={openModal}
            className="flex-1 flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer text-left"
            style={{ color: t.colors.semantic.primary }}
          >
            Finish setting up your salon
            <ArrowRight size={14} />
          </button>
          <button
            onClick={dismissBanner}
            className="p-1 rounded-md transition-colors cursor-pointer"
            style={{ color: t.colors.semantic.textSubtle }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Welcome hero card */}
      <Card
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden"
      >
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.colors.semantic.primary }}>
            {greeting}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
            Let&apos;s take care<br />of today. 🐾
          </h2>
          <p className="text-sm max-w-md leading-relaxed text-muted-foreground">
            You&apos;re all set, <span className="font-semibold text-foreground">{firstName}</span>.
            Your schedule is ready — let&apos;s make it a wonderful day for every pet.
          </p>
        </div>
      </Card>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <QuickCard
          href="/app/services"
          icon={<Sparkles size={22} strokeWidth={1.6} style={{ color: t.colors.semantic.primary }} />}
          label="Services"
          description="Manage grooming & care"
          accentBg={t.colors.semantic.accentTint}
        />
        <QuickCard
          href="/app/customers"
          icon={<Users size={22} strokeWidth={1.6} style={{ color: t.colors.semantic.info }} />}
          label="Customers"
          description="Clients & their pets"
          accentBg={t.colors.semantic.infoBg}
        />
        <QuickCard
          href="/app/calendar"
          icon={<CalendarDays size={22} strokeWidth={1.6} style={{ color: t.colors.semantic.successAccent }} />}
          label="Calendar"
          description="Today's appointments"
          accentBg={t.colors.semantic.successBg}
        />
      </div>
    </div>
  )
}

function QuickCard({
  href,
  icon,
  label,
  description,
  accentBg,
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  accentBg: string
}) {
  return (
    <Link href={href} className="group block">
      <Card
        interactive
        className="items-center text-center gap-3 py-8 px-5"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mb-1"
          style={{ background: accentBg }}
        >
          {icon}
        </div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <ArrowRight
          size={14}
          className="mt-1 text-muted-foreground/40 group-hover:text-primary transition-colors duration-200"
        />
      </Card>
    </Link>
  )
}
