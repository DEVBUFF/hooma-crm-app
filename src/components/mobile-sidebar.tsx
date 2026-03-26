"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Scissors,
  Heart,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from "lucide-react"
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

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut(auth)
    router.push("/auth/login")
  }

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-muted cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={20} style={{ color: t.colors.semantic.text }} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col py-6 px-3 gap-1 md:hidden transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: t.colors.component.card.bg,
          borderRight: `1px solid ${t.colors.semantic.borderSubtle}`,
          boxShadow: open ? "var(--hooma-shadow-sidebar)" : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-6">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: t.colors.semantic.textStrong }}
          >
            hooma
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} style={{ color: t.colors.semantic.textMuted }} />
          </button>
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
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out"
                style={
                  isActive
                    ? {
                        background: t.colors.semantic.navActiveBg,
                        color: t.colors.semantic.navActiveFg,
                        boxShadow: t.shadow.sm,
                      }
                    : { color: t.colors.semantic.textMuted }
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.6}
                  style={{
                    color: isActive
                      ? t.colors.semantic.navActiveFg
                      : t.colors.semantic.textSubtle,
                  }}
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div
          className="mx-3 border-t mb-2"
          style={{ borderColor: t.colors.semantic.divider }}
        />

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sm font-medium transition-all duration-200 ease-out cursor-pointer"
          style={{ color: t.colors.semantic.textMuted }}
        >
          <LogOut
            size={18}
            strokeWidth={1.6}
            style={{ color: t.colors.semantic.textSubtle }}
          />
          <span>Sign out</span>
        </button>
      </div>
    </>
  )
}
