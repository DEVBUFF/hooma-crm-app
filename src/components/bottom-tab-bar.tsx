"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Heart,
  Scissors,
  MoreHorizontal,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app", label: "Home", icon: LayoutDashboard },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/customers", label: "Clients", icon: Heart },
  { href: "/app/services", label: "Services", icon: Scissors },
  { href: "/app/settings", label: "More", icon: MoreHorizontal },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderTop: "1px solid #E5E7EB",
        paddingBottom: "max(6px, env(safe-area-inset-bottom))",
        paddingTop: 6,
      }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/app" ? pathname === "/app" : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center justify-center gap-0.5 py-1 transition-colors"
            style={{ color: isActive ? "#0A0A1A" : "#6B7280" }}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute"
                style={{
                  top: -6,
                  width: 22,
                  height: 3,
                  borderRadius: 3,
                  background: "#6B72C9",
                }}
              />
            )}
            <Icon
              size={20}
              strokeWidth={isActive ? 2 : 1.6}
              style={{ color: isActive ? "#5A61B8" : "#9CA3AF" }}
            />
            <span
              className="text-[10.5px] leading-none"
              style={{ fontWeight: isActive ? 600 : 500 }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
