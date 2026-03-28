"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Heart,
  Scissors,
  MoreVertical,
} from "lucide-react"
import { t } from "@/lib/tokens"

const tabs = [
  { href: "/app", label: "Home", icon: LayoutDashboard },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/customers", label: "Clients", icon: Heart },
  { href: "/app/services", label: "Services", icon: Scissors },
  { href: "/app/settings", label: "More", icon: MoreVertical },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-start pt-2 pb-7"
      style={{
        background: t.colors.semantic.panel,
        borderTop: `1px solid ${t.colors.semantic.borderSubtle}`,
      }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/app" ? pathname === "/app" : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 min-w-[60px] relative"
            style={{ color: isActive ? t.colors.semantic.primary : t.colors.semantic.textSubtle }}
          >
            {isActive && (
              <span
                className="absolute -top-2 w-5 h-[3px] rounded-sm"
                style={{ background: t.colors.semantic.primary }}
              />
            )}
            <Icon size={22} strokeWidth={1.5} />
            <span
              className="text-[11px]"
              style={{ fontWeight: isActive ? 500 : 400 }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
