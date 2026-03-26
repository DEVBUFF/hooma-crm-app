"use client"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCalendar = pathname.startsWith("/app/calendar")

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--hooma-bg-base)" }}>
      {/* Left sidebar — desktop only */}
      <DashboardSidebar />

      {/* Right: topbar + content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar — hidden on calendar */}
        {!isCalendar && <DashboardTopbar />}

        {/* Calendar: show a minimal mobile-only header with hamburger */}
        {isCalendar && (
          <div className="md:hidden flex items-center px-3 py-2 border-b" style={{ borderColor: "var(--hooma-border-subtle)" }}>
            <MobileSidebar />
          </div>
        )}

        {/* Content — no padding on calendar so it fills all space; responsive padding elsewhere */}
        <main className={isCalendar ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto p-4 sm:p-6"}>
          {children}
        </main>
      </div>
    </div>
  )
}
