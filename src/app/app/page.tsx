"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth/AuthProvider"
import { t } from "@/lib/tokens"
import { ArrowRight, Sparkles, Users, CalendarDays } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function AppHomePage() {
  const { user } = useAuth()

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
    <div className="space-y-6 max-w-5xl">
      {/* Welcome hero card */}
      <Card
        variant="elevated"
        className="relative overflow-hidden p-10"
      >
        <div className="relative z-10 space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {greeting}
          </p>
          <h2 className="text-4xl font-bold leading-tight text-foreground">
            Let&apos;s take care<br />of today. 🐾
          </h2>
          <p className="text-base max-w-md leading-relaxed text-muted-foreground">
            You&apos;re all set, <span className="font-semibold text-foreground">{firstName}</span>.
            Your schedule is ready — let&apos;s make it a wonderful day for every pet.
          </p>
        </div>
      </Card>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickCard
          href="/app/services"
          icon={<Sparkles size={20} strokeWidth={1.8} style={{ color: t.colors.semantic.primary }} />}
          label="Services"
          description="Manage grooming & care"
          accentBg={t.colors.semantic.accentTint}
        />
        <QuickCard
          href="/app/customers"
          icon={<Users size={20} strokeWidth={1.8} style={{ color: t.colors.semantic.primary }} />}
          label="Customers"
          description="Clients & their pets"
          accentBg={t.colors.semantic.infoBg}
        />
        <QuickCard
          href="/app/calendar"
          icon={<CalendarDays size={20} strokeWidth={1.8} style={{ color: t.colors.semantic.successAccent }} />}
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
        className="flex-row items-center gap-4 p-5"
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: accentBg }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs truncate text-muted-foreground">{description}</p>
        </div>
        <ArrowRight
          size={16}
          className="transition-colors duration-200 text-border shrink-0"
        />
      </Card>
    </Link>
  )
}
