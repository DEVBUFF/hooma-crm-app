"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Scissors,
  Plus,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react"
import {
  Timestamp,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth/AuthProvider"
import { useOnboarding } from "@/components/onboarding-context"
import { getSalonByOwnerId, type Salon } from "@/lib/salon"
import { bookingsCol, docToBooking } from "@/features/calendar/lib/bookings-service"
import type { Booking } from "@/features/calendar/types"
import { HoomaMark } from "@/components/brand/logo"

// ─── Utilities ──────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function formatGBP(pence: number): string {
  return `£${(pence / 100).toFixed(2).replace(/\.00$/, "")}`
}

function parsePrice(raw: string | undefined): number {
  if (!raw) return 0
  const n = Number.parseFloat(raw.replace(/[^0-9.\-]/g, ""))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function todayLabel(): string {
  const d = new Date()
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { user } = useAuth()
  const { wasSkipped, openModal } = useOnboarding()

  const [salon, setSalon] = useState<Salon | null>(null)
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [bannerVisible, setBannerVisible] = useState(false)

  // Load salon, bookings for today
  useEffect(() => {
    if (!user) return
    let cancelled = false

    ;(async () => {
      const s = await getSalonByOwnerId(user.uid)
      if (cancelled) return
      setSalon(s)

      // Banner visibility for skipped onboarding (max 3 dismissals)
      if (wasSkipped && s) {
        const dismissals = s.onboardingBannerDismissals ?? 0
        setBannerVisible(dismissals < 3)
      }

      if (!s) {
        setBookings([])
        return
      }

      try {
        const today = new Date()
        const q = query(
          bookingsCol(s.id),
          where("startAt", ">=", Timestamp.fromDate(startOfDay(today))),
          where("startAt", "<=", Timestamp.fromDate(endOfDay(today))),
          orderBy("startAt", "asc"),
        )
        const snap = await getDocs(q)
        if (cancelled) return
        setBookings(
          snap.docs.map((d) =>
            docToBooking(d.id, d.data() as Record<string, unknown>),
          ),
        )
      } catch (err) {
        console.error("[Dashboard] bookings load failed", err)
        if (!cancelled) setBookings([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, wasSkipped])

  const dismissBanner = useCallback(async () => {
    setBannerVisible(false)
    if (!salon) return
    const fresh = await getSalonByOwnerId(user!.uid)
    const current = fresh?.onboardingBannerDismissals ?? 0
    await updateDoc(doc(db, "salons", salon.id), {
      onboardingBannerDismissals: current + 1,
    })
  }, [salon, user])

  // Derived
  const firstName =
    salon?.ownerName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there"

  const salonName = salon?.salonName || salon?.name || "your salon"

  const now = new Date()
  const greeting = greetingFor(now.getHours())

  const upcoming = useMemo(() => {
    if (!bookings) return []
    return bookings
      .filter((b) => b.endAt.getTime() >= now.getTime())
      .slice(0, 5)
  }, [bookings, now])

  const nextBooking = upcoming[0]

  const todayRevenuePence = useMemo(() => {
    if (!bookings) return 0
    return bookings
      .filter((b) => b.status !== "canceled" && b.status !== "no_show")
      .reduce((acc, b) => acc + parsePrice(b.priceSnapshot), 0)
  }, [bookings])

  const todayCount =
    bookings?.filter((b) => b.status !== "canceled" && b.status !== "no_show").length ?? 0

  // Setup checklist
  const setupSteps = useMemo(() => {
    return [
      {
        key: "salon",
        label: "Name your salon",
        done: Boolean(salon?.salonName || salon?.name),
        href: "/app/settings",
      },
      {
        key: "services",
        label: "Add your services",
        done: Boolean(salon?.onboardingCompleted),
        href: "/app/services",
      },
      {
        key: "staff",
        label: "Add staff availability",
        done: Boolean(salon?.settings?.workHours),
        href: "/app/staff",
      },
    ]
  }, [salon])
  const setupProgress =
    setupSteps.filter((s) => s.done).length / setupSteps.length

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Banner for skipped onboarding ─── */}
      {bannerVisible && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{
            background: "#EEF0FA",
            border: "1px solid rgba(107,114,201,0.18)",
          }}
        >
          <button
            onClick={openModal}
            className="flex-1 flex items-center gap-2 text-sm font-medium text-left cursor-pointer"
            style={{ color: "#4950A3" }}
          >
            Finish setting up {salonName}
            <ArrowRight size={14} />
          </button>
          <button
            onClick={dismissBanner}
            className="p-1 rounded-md cursor-pointer"
            style={{ color: "#6B7280" }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── Greeting ─── */}
      <header>
        <p
          className="text-[12px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "#9CA3AF" }}
        >
          {todayLabel()}
        </p>
        <h1
          className="mt-1 text-[26px] sm:text-[32px] font-semibold tracking-tight leading-tight"
          style={{ color: "#0A0A1A" }}
        >
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-[15px]" style={{ color: "#6B7280" }}>
          {bookings === null
            ? "Checking today's schedule…"
            : todayCount === 0
              ? "A quiet day. Perfect time to tidy up pet notes."
              : todayCount === 1
                ? "One appointment today."
                : `${todayCount} appointments today.`}
        </p>
      </header>

      {/* ─── Today panel ─── */}
      <section
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <StatCard
          label="Bookings today"
          value={bookings === null ? "—" : String(todayCount)}
          hint="Confirmed + pending"
          href="/app/calendar"
        />
        <StatCard
          label="Revenue today"
          value={
            bookings === null
              ? "—"
              : todayRevenuePence > 0
                ? formatGBP(todayRevenuePence)
                : "£0"
          }
          hint="Price snapshots, net of cancellations"
        />
        <StatCard
          label="Up next"
          value={
            nextBooking
              ? formatTime(nextBooking.startAt)
              : bookings === null
                ? "—"
                : "—"
          }
          hint={
            nextBooking
              ? `${nextBooking.customerNameSnapshot}${
                  nextBooking.petNameSnapshot
                    ? ` · ${nextBooking.petNameSnapshot}`
                    : ""
                }`
              : bookings === null
                ? "Loading"
                : "Nothing scheduled"
          }
        />
      </section>

      {/* ─── Upcoming list + Setup ─── */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Today's schedule"
          action={
            <Link
              href="/app/calendar"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
              style={{ color: "#4950A3" }}
            >
              Open calendar <ArrowRight size={13} />
            </Link>
          }
        >
          {bookings === null ? (
            <SkeletonRows count={3} />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={<HoomaMark size={28} color="#C7CBF0" />}
              title="No bookings lined up"
              description="Tap “New booking” above to drop one into today."
              action={
                <Link
                  href="/app/calendar?new=1"
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium"
                  style={{ background: "#0A0A1A", color: "#FFFFFF" }}
                >
                  <Plus size={14} /> New booking
                </Link>
              }
            />
          ) : (
            <ul className="divide-y" style={{ borderColor: "#F3F4F6" }}>
              {upcoming.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Setup"
          action={
            <span className="text-[13px]" style={{ color: "#6B7280" }}>
              {Math.round(setupProgress * 100)}% complete
            </span>
          }
        >
          <div
            className="mb-4 h-[6px] w-full rounded-full overflow-hidden"
            style={{ background: "#F3F4F6" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${setupProgress * 100}%`,
                background: "#6B72C9",
                transition: "width .3s ease",
              }}
            />
          </div>
          <ul className="space-y-1">
            {setupSteps.map((step) => (
              <li key={step.key}>
                <Link
                  href={step.href}
                  className="flex items-center gap-3 px-2 py-2 rounded-md transition-colors"
                  style={{ color: step.done ? "#6B7280" : "#1A1A2E" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F9FAFB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {step.done ? (
                    <CheckCircle2
                      size={16}
                      strokeWidth={2}
                      style={{ color: "#5A61B8" }}
                    />
                  ) : (
                    <Circle
                      size={16}
                      strokeWidth={1.75}
                      style={{ color: "#D1D5DB" }}
                    />
                  )}
                  <span
                    className="text-sm"
                    style={{
                      textDecoration: step.done ? "line-through" : "none",
                    }}
                  >
                    {step.label}
                  </span>
                  <ArrowRight
                    size={13}
                    className="ml-auto"
                    style={{ color: "#9CA3AF" }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      {/* ─── Jump to ─── */}
      <section>
        <h2
          className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "#9CA3AF" }}
        >
          Jump to
        </h2>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <JumpCard
            href="/app/calendar"
            title="Calendar"
            subtitle="Drag, drop, done"
            icon={<CalendarDays size={18} strokeWidth={1.75} />}
          />
          <JumpCard
            href="/app/customers"
            title="Clients"
            subtitle="Owners and pet notes"
            icon={<Heart size={18} strokeWidth={1.75} />}
          />
          <JumpCard
            href="/app/services"
            title="Services"
            subtitle="Edit what you offer"
            icon={<Scissors size={18} strokeWidth={1.75} />}
          />
        </div>
      </section>
    </div>
  )
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-[15px] font-semibold"
          style={{ color: "#0A0A1A" }}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: string
  hint?: string
  href?: string
}) {
  const content = (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 20,
        minHeight: 112,
        height: "100%",
      }}
      className="flex flex-col justify-between transition-colors"
    >
      <span className="text-[12px]" style={{ color: "#6B7280" }}>
        {label}
      </span>
      <span
        className="text-[28px] font-semibold tracking-tight leading-none"
        style={{ color: "#0A0A1A", letterSpacing: "-0.02em" }}
      >
        {value}
      </span>
      {hint && (
        <span
          className="text-[12px] truncate"
          style={{ color: "#9CA3AF" }}
          title={hint}
        >
          {hint}
        </span>
      )}
    </div>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="block transition-colors"
        style={{ borderRadius: 12 }}
      >
        {content}
      </Link>
    )
  }
  return content
}

function BookingRow({ booking }: { booking: Booking }) {
  const isCancelled = booking.status === "canceled"
  return (
    <li className="flex items-center gap-3 py-3">
      <div
        className="w-12 shrink-0 text-[13px] font-semibold tabular-nums"
        style={{
          color: isCancelled ? "#9CA3AF" : "#0A0A1A",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(booking.startAt)}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[14px] font-medium truncate"
          style={{
            color: isCancelled ? "#9CA3AF" : "#1A1A2E",
            textDecoration: isCancelled ? "line-through" : "none",
          }}
        >
          {booking.customerNameSnapshot}
          {booking.petNameSnapshot && (
            <span style={{ color: "#9CA3AF" }}>
              {"  ·  "}
              {booking.petNameSnapshot}
            </span>
          )}
        </div>
        <div className="text-[12px] truncate" style={{ color: "#6B7280" }}>
          {booking.serviceNameSnapshot}
          {booking.priceSnapshot && `  ·  ${booking.priceSnapshot}`}
        </div>
      </div>
      <StatusChip status={booking.status} />
    </li>
  )
}

function StatusChip({ status }: { status: Booking["status"] }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    scheduled: { bg: "#EEF0FA", fg: "#5A61B8", label: "Scheduled" },
    confirmed: { bg: "#ECFEF0", fg: "#2E7D4A", label: "Confirmed" },
    in_progress: { bg: "#FFFBEB", fg: "#8A5A10", label: "In progress" },
    completed: { bg: "#F3F4F6", fg: "#374151", label: "Done" },
    canceled: { bg: "#FEF2F2", fg: "#B3261E", label: "Cancelled" },
    no_show: { bg: "#FEF2F2", fg: "#B3261E", label: "No-show" },
  }
  const cfg = map[status] || {
    bg: "#F3F4F6",
    fg: "#374151",
    label: status,
  }
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      {cfg.label}
    </span>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="py-8 text-center">
      <div className="inline-flex mb-3">{icon}</div>
      <p
        className="text-[15px] font-medium"
        style={{ color: "#1A1A2E" }}
      >
        {title}
      </p>
      <p className="mt-1 text-[13px]" style={{ color: "#6B7280" }}>
        {description}
      </p>
      {action && <div className="mt-4 inline-flex">{action}</div>}
    </div>
  )
}

function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-3 py-1">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3">
          <div
            className="w-12 h-3 rounded"
            style={{ background: "#F3F4F6" }}
          />
          <div className="flex-1 space-y-1.5">
            <div
              className="h-3 rounded"
              style={{ background: "#F3F4F6", width: "60%" }}
            />
            <div
              className="h-3 rounded"
              style={{ background: "#F9FAFB", width: "40%" }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function JumpCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string
  title: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 transition-all"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#D1D5DB"
        e.currentTarget.style.transform = "translateY(-1px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E5E7EB"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <span
        className="flex items-center justify-center rounded-md shrink-0"
        style={{
          width: 36,
          height: 36,
          background: "#EEF0FA",
          color: "#5A61B8",
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="text-[14px] font-semibold"
          style={{ color: "#0A0A1A" }}
        >
          {title}
        </div>
        <div
          className="text-[12px] truncate"
          style={{ color: "#6B7280" }}
        >
          {subtitle}
        </div>
      </div>
      <ArrowRight
        size={15}
        style={{ color: "#9CA3AF" }}
        className="group-hover:translate-x-0.5 transition-transform"
      />
    </Link>
  )
}
