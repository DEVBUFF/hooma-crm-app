"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth/AuthProvider"
import { t } from "@/lib/tokens"
import { ArrowRight, Sparkles, Users, CalendarDays } from "lucide-react"
import Link from "next/link"

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
      <div
        className="relative overflow-hidden p-10"
        style={{
          background: t.colors.component.card.bg,
          borderRadius: `${t.radius["2xl"]}px`,
          boxShadow: t.shadow.cardElevated,
        }}
      >
        <div className="relative z-10 space-y-3">
          <p
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color: t.colors.semantic.textSubtle }}
          >
            {greeting}
          </p>
          <h2
            className="text-4xl font-bold leading-tight"
            style={{ color: t.colors.semantic.text }}
          >
            Let&apos;s take care<br />of today. 🐾
          </h2>
          <p className="text-base max-w-md leading-relaxed" style={{ color: t.colors.semantic.textMuted }}>
            You&apos;re all set, <span className="font-semibold" style={{ color: t.colors.semantic.text }}>{firstName}</span>.
            Your schedule is ready — let&apos;s make it a wonderful day for every pet.
          </p>
        </div>
      </div>

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
    <Link
      href={href}
      className="group flex items-center gap-4 p-5 transition-all duration-200 ease-out hover:-translate-y-0.5"
      style={{
        background: t.colors.component.card.bg,
        borderRadius: `${t.radius.xl}px`,
        boxShadow: t.shadow.cardElevated,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.md }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.cardElevated }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: accentBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: t.colors.semantic.text }}>{label}</p>
        <p className="text-xs truncate" style={{ color: t.colors.semantic.textSubtle }}>{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="transition-colors duration-200"
        style={{ color: t.colors.semantic.divider }}
      />
    </Link>
  )
}
