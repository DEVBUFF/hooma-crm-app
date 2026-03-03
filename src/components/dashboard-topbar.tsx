"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { t } from "@/lib/tokens"

const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/services": "Services",
  "/app/staff": "Staff",
  "/app/customers": "Customers",
  "/app/calendar": "Calendar",
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
      className="flex items-center justify-between px-6 py-4 rounded-[28px] m-3 mb-0"
      style={{ background: t.colors.component.card.bg, boxShadow: t.shadow.topbar }}
    >
      <h1 className="text-xl font-semibold tracking-tight" style={{ color: t.colors.semantic.text }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold select-none cursor-pointer transition-all duration-200 hover:scale-105"
          style={{ background: t.colors.semantic.primary, color: "#fff", boxShadow: t.shadow.primaryLg }}
          title={user?.email ?? ""}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}

