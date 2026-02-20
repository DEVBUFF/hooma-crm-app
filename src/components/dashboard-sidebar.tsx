"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Scissors,
  Heart,
  Users,
  CalendarDays,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { t } from "@/lib/tokens"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/services", label: "Services", icon: Scissors },
  { href: "/app/staff", label: "Staff", icon: Users },
  { href: "/app/customers", label: "Customers", icon: Heart },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut(auth)
    router.push("/auth/login")
  }

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] shrink-0 m-3 rounded-[28px] py-6 px-3 gap-1"
      style={{ background: t.colors.component.card.bg, boxShadow: t.shadow.sidebar }}
    >
      {/* Logo */}
      <div className="px-4 mb-6">
        <span className="text-2xl font-bold tracking-tight" style={{ color: t.colors.semantic.textStrong }}>
          hooma
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/app" ? pathname === "/app" : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-[18px] text-sm font-medium transition-all duration-200 ease-out"
              style={isActive
                ? { background: t.colors.semantic.navActiveBg, color: t.colors.semantic.navActiveFg, boxShadow: t.shadow.sm }
                : { color: t.colors.semantic.textMuted }
              }
            >
              <Icon
                size={18}
                strokeWidth={1.6}
                style={{ color: isActive ? t.colors.semantic.navActiveFg : t.colors.semantic.textSubtle }}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="mx-3 border-t mb-2" style={{ borderColor: t.colors.semantic.divider }} />

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 rounded-[18px] w-full text-sm font-medium transition-all duration-200 ease-out cursor-pointer"
        style={{ color: t.colors.semantic.textMuted }}
      >
        <LogOut size={18} strokeWidth={1.6} style={{ color: t.colors.semantic.textSubtle }} />
        <span>Sign out</span>
      </button>
    </aside>
  )
}