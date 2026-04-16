"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { MobileSidebar } from "@/components/mobile-sidebar"

// ── Titles & subtitles per route ────────────────────────────────────────────

type Meta = { title: string; subtitle?: string }

const META: Record<string, Meta> = {
  "/app": { title: "Dashboard", subtitle: "Today at a glance" },
  "/app/calendar": { title: "Calendar" },
  "/app/customers": { title: "Clients", subtitle: "Owners and their pets" },
  "/app/services": { title: "Services", subtitle: "What you offer and pricing" },
  "/app/staff": { title: "Staff", subtitle: "Team and availability" },
  "/app/settings": { title: "Settings", subtitle: "Salon preferences" },
}

function getMeta(pathname: string): Meta {
  if (META[pathname]) return META[pathname]
  for (const key of Object.keys(META).sort((a, b) => b.length - a.length)) {
    if (pathname.startsWith(key)) return META[key]
  }
  return { title: "Hooma" }
}

// ── Topbar ──────────────────────────────────────────────────────────────────

export function DashboardTopbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const meta = getMeta(pathname)

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "HM"

  return (
    <header
      className="sticky top-0 z-30 flex items-center"
      style={{
        height: 64,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <div className="flex items-center justify-between w-full px-4 sm:px-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <MobileSidebar />
          <div className="min-w-0">
            <h1
              className="text-[17px] sm:text-[18px] font-semibold tracking-tight truncate"
              style={{ color: "#0A0A1A" }}
            >
              {meta.title}
            </h1>
            {meta.subtitle && (
              <p
                className="hidden sm:block text-[12px] truncate"
                style={{ color: "#6B7280" }}
              >
                {meta.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/calendar?new=1"
            className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors"
            style={{ background: "#0A0A1A", color: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#14142B")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0A0A1A")}
          >
            <Plus size={15} strokeWidth={2} />
            <span className="hidden sm:inline">New booking</span>
            <span className="sm:hidden">New</span>
          </Link>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold select-none"
            style={{ background: "#EEF0FA", color: "#5A61B8" }}
            title={user?.email ?? ""}
            aria-label="Account"
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
