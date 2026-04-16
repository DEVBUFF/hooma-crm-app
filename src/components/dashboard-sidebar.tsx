"use client"

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
  ChevronUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth/AuthProvider"
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

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col w-[240px] shrink-0"
      style={{
        background: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
      }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ height: 64 }}>
        <Link href="/app" aria-label="Hooma home" className="inline-flex">
          <HoomaLogo />
        </Link>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 pb-4"
        style={{ borderTop: "1px solid #F3F4F6" }}
      >
        <NavGroup label="Workspace" items={workspaceNav} pathname={pathname} />
        <NavGroup label="Setup" items={setupNav} pathname={pathname} />
      </div>

      <UserMenu />
    </aside>
  )
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string
  items: NavItem[]
  pathname: string
}) {
  return (
    <div className="pt-5">
      <div
        className="px-3 mb-2 text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color: "#9CA3AF" }}
      >
        {label}
      </div>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </div>
  )
}

export function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate?: () => void
}) {
  const isActive =
    item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
      style={{
        color: isActive ? "#0A0A1A" : "#374151",
        background: isActive ? "#F3F4F6" : "transparent",
        fontWeight: isActive ? 600 : 500,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "#F9FAFB"
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent"
      }}
    >
      {isActive && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: -12,
            top: 6,
            bottom: 6,
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
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function UserMenu() {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const email = user?.email ?? ""
  const initials = email ? email.slice(0, 2).toUpperCase() : "HM"
  const name = email.split("@")[0] || "Signed in"

  async function handleSignOut() {
    await signOut(auth)
    router.push("/auth/login")
  }

  return (
    <div
      ref={ref}
      className="relative"
      style={{ borderTop: "1px solid #F3F4F6", padding: 12 }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors cursor-pointer"
        style={{ background: open ? "#F3F4F6" : "transparent" }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "#F9FAFB"
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent"
        }}
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
          style={{ background: "#EEF0FA", color: "#5A61B8" }}
        >
          {initials}
        </span>
        <span className="flex-1 min-w-0 text-left">
          <span
            className="block truncate text-[13px] font-medium"
            style={{ color: "#0A0A1A" }}
          >
            {name}
          </span>
          <span
            className="block truncate text-[11px]"
            style={{ color: "#6B7280" }}
          >
            {email || "Not signed in"}
          </span>
        </span>
        <ChevronUp
          size={14}
          style={{
            color: "#9CA3AF",
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform .15s ease",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute bottom-[calc(100%-4px)] left-3 right-3 overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            boxShadow:
              "0 12px 32px rgba(10,10,26,.08), 0 4px 8px rgba(10,10,26,.04)",
          }}
        >
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors"
            style={{ color: "#1A1A2E" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={15} strokeWidth={1.75} style={{ color: "#6B7280" }} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}
