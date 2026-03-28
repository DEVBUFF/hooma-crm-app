"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { t } from "@/lib/tokens"

const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/services": "Services",
  "/app/staff": "Staff",
  "/app/customers": "Customers",
  "/app/calendar": "Calendar",
  "/app/settings": "Settings",
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  for (const key of Object.keys(pageTitles).reverse()) {
    if (pathname.startsWith(key)) return pageTitles[key]
  }
  return "Hooma"
}

export function DashboardTopbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const title = getPageTitle(pathname)

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "HM"

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b"
      style={{ background: t.colors.component.card.bg, borderColor: t.colors.semantic.borderSubtle }}
    >
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: t.colors.semantic.text }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold select-none cursor-pointer transition-all duration-200 hover:scale-105"
          style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary, boxShadow: t.shadow.primaryLg }}
          title={user?.email ?? ""}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}

