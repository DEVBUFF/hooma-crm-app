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
      className={cn(
        "hidden md:flex flex-col",
        "w-[220px] shrink-0",
        "m-3 rounded-[28px]",
        "bg-card",
        "shadow-[0_12px_40px_rgba(90,60,30,0.08)]",
        "py-6 px-3",
        "gap-1"
      )}
    >
      {/* Logo — plain bold text */}
      <div className="px-4 mb-6">
        <span className="text-2xl font-bold tracking-tight text-[#2E211C]">
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
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[18px]",
                "text-sm font-medium",
                "transition-all duration-200 ease-out",
                isActive
                  ? "bg-[#DFE1E0] text-[#3E2F2A] shadow-[0_2px_12px_rgba(62,47,42,0.08)]"
                  : "text-[#7A655A] hover:bg-[#E4D9CC]/[0.4] hover:text-[#3E2F2A]"
              )}
            >
              <Icon
                size={18}
                strokeWidth={1.6}
                className={isActive ? "text-[#3E2F2A]" : "text-[#A8998C]"}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="mx-3 border-t border-[#DDD4C4] mb-2" />

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-[18px] w-full",
          "text-sm font-medium text-[#7A655A]",
          "hover:bg-[#E4D9CC] hover:text-[#3E2F2A]",
          "transition-all duration-200 ease-out cursor-pointer"
        )}
      >
        <LogOut size={18} strokeWidth={1.6} className="text-[#A8998C]" />
        <span>Sign out</span>
      </button>
    </aside>
  )
}
