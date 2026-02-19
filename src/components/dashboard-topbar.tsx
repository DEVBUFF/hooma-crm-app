"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/services": "Services",
  "/app/staff": "Staff",
  "/app/customers": "Customers",
  "/app/calendar": "Calendar",
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname]
  // Prefix match (e.g. /app/customers/[id])
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
      className={cn(
        "flex items-center justify-between",
        "px-6 py-4",
        "bg-card",
        "shadow-[0_2px_16px_rgba(62,47,42,0.06)]",
        "rounded-[28px]",
        "m-3 mb-0"
      )}
    >
      {/* Page title */}
      <h1 className="text-xl font-semibold text-[#3E2F2A] tracking-tight">
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center",
            "bg-[#7FA6C9] text-white text-xs font-bold",
            "shadow-[0_2px_8px_rgba(127,166,201,0.3)]",
            "select-none cursor-pointer",
            "transition-all duration-200 hover:shadow-[0_4px_16px_rgba(127,166,201,0.4)] hover:scale-105"
          )}
          title={user?.email ?? ""}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
