"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Scissors,
  Heart,
  Users,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { HoomaLogo } from "@/components/brand/logo"

type NavItem = { href: string; label: string; icon: LucideIcon }

const workspaceNav: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/customers", label: "Clients", icon: Heart },
]

const setupNav: NavItem[] = [
  { href: "/app/services", label: "Services", icon: Scissors },
  { href: "/app/staff", label: "Staff", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function handleSignOut() {
    await signOut(auth)
    setOpen(false)
    router.push("/auth/login")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-md transition-colors cursor-pointer"
        style={{ color: "#0A0A1A" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        aria-label="Open menu"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ background: "rgba(10,10,26,0.35)" }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col md:hidden transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
          boxShadow: "4px 0 24px rgba(10,10,26,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5"
          style={{ height: 64, borderBottom: "1px solid #F3F4F6" }}
        >
          <Link
            href="/app"
            aria-label="Hooma home"
            onClick={() => setOpen(false)}
          >
            <HoomaLogo />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-md transition-colors cursor-pointer"
            style={{ color: "#374151" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavGroup
            label="Workspace"
            items={workspaceNav}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
          <NavGroup
            label="Setup"
            items={setupNav}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </div>

        {/* Sign out */}
        <div style={{ borderTop: "1px solid #F3F4F6", padding: 12 }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors"
            style={{ color: "#1A1A2E" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={16} strokeWidth={1.75} style={{ color: "#6B7280" }} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string
  items: NavItem[]
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div className="pt-4">
      <div
        className="px-3 mb-2 text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color: "#9CA3AF" }}
      >
        {label}
      </div>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors"
              style={{
                color: isActive ? "#0A0A1A" : "#374151",
                background: isActive ? "#F3F4F6" : "transparent",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: -12,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: 3,
                    background: "#6B72C9",
                  }}
                />
              )}
              <Icon
                size={17}
                strokeWidth={1.75}
                style={{ color: isActive ? "#5A61B8" : "#6B7280" }}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
