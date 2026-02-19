"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome he rocard */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] p-10",
          "bg-card",
          "shadow-[0_12px_40px_rgba(90,60,30,0.08)]"
        )}
      >
        <div className="relative z-10 space-y-3">
          <p className="text-sm font-medium text-[#A8998C] uppercase tracking-widest">
            {greeting}
          </p>
          <h2 className="text-4xl font-bold text-[#3E2F2A] leading-tight">
            Let&apos;s take care<br />of today. 🐾
          </h2>
          <p className="text-[#7A655A] text-base max-w-md leading-relaxed">
            You&apos;re all set, <span className="font-semibold text-[#3E2F2A]">{firstName}</span>.
            Your schedule is ready — let&apos;s make it a wonderful day for every pet.
          </p>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickCard
          href="/app/services"
          icon={<Sparkles size={20} strokeWidth={1.8} className="text-[#7FA6C9]" />}
          label="Services"
          description="Manage grooming & care"
          accent="bg-[#FAEAE4]"
        />
        <QuickCard
          href="/app/customers"
          icon={<Users size={20} strokeWidth={1.8} className="text-[#7FA6C9]" />}
          label="Customers"
          description="Clients & their pets"
          accent="bg-[#E4EEF6]"
        />
        <QuickCard
          href="/app/calendar"
          icon={<CalendarDays size={20} strokeWidth={1.8} className="text-[#A8BBA3]" />}
          label="Calendar"
          description="Today's appointments"
          accent="bg-[#E8EFE7]"
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
  accent,
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 p-5 rounded-[22px]",
        "bg-card",
        "shadow-[0_12px_40px_rgba(90,60,30,0.08)]",
        "hover:shadow-[0_12px_40px_rgba(90,60,30,0.1)]",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5"
      )}
    >
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", accent)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#3E2F2A]">{label}</p>
        <p className="text-xs text-[#A8998C] truncate">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="text-[#C8B9AF] group-hover:text-[#7FA6C9] transition-colors duration-200"
      />
    </Link>
  )
}
