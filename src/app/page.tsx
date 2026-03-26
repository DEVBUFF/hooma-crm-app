import type { Metadata } from "next"
import Link from "next/link"
import { PawIcon } from "@/components/hooma-logo"

// ── SEO Metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Hooma CRM — Free CRM for Grooming Salons | Grooming Scheduling Software",
  description:
    "Manage bookings, staff and clients in one simple, calm system — completely free. No credit card needed. Pet grooming management software built specifically for grooming businesses.",
  keywords:
    "free grooming salon CRM, grooming scheduling software, pet grooming management software, salon booking system, grooming business tools",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Hooma CRM — Free CRM for Grooming Salons",
    description:
      "Manage bookings, staff and clients in one simple, calm system — completely free.",
    type: "website",
    siteName: "Hooma CRM",
  },
  alternates: { canonical: "/" },
}

// ── JSON-LD Structured Data ───────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hooma CRM",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Free CRM for grooming salons. Manage bookings, staff and clients in one calm system.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

type IconProps = { className?: string }

function IconCalendar({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconUsers({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconUser({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconScissors({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

function IconTrendingUp({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function IconBell({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconMapPin({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconArrowRight({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}


// ── Calendar Mock Component ───────────────────────────────────────────────────

function CalendarMock() {
  return (
    <div
      className="w-full max-w-[380px] bg-card rounded-[20px] border border-border/40 overflow-hidden select-none"
      style={{ boxShadow: "var(--hooma-shadow-card-hero)" }}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-[13px] font-semibold text-foreground">March 2026</span>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          <span className="px-2.5 py-1 text-[11px] rounded-md text-muted-foreground">Day</span>
          <span className="px-2.5 py-1 text-[11px] rounded-md bg-card font-medium text-foreground" style={{ boxShadow: "var(--hooma-shadow-btn-sm)" }}>Week</span>
        </div>
      </div>

      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-1.5 mb-2">
          <div />
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground">Mon</div>
            <div className="text-[12px] font-medium text-muted-foreground">2</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-primary font-medium">Tue</div>
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center mx-auto">3</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground">Wed</div>
            <div className="text-[12px] font-medium text-muted-foreground">4</div>
          </div>
        </div>

        {/* Time grid */}
        <div className="relative">
          {/* 9:00 */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-x-1.5 border-t border-border/25">
            <div className="text-[9px] text-muted-foreground pt-1 text-right pr-2">9:00</div>
            <div className="relative h-12 overflow-visible">
              <div className="absolute inset-x-0 top-1 rounded-lg p-1.5 bg-primary/10 border border-primary/15 z-10" style={{ height: 68 }}>
                <div className="text-[10px] font-semibold text-primary leading-tight">Luna</div>
                <div className="text-[9px] text-primary/70">Full Groom</div>
                <div className="text-[8px] text-primary/50 mt-0.5">9:00 – 10:30</div>
              </div>
            </div>
            <div className="h-12" />
            <div className="relative h-12 overflow-visible">
              <div className="absolute inset-x-0 top-1 rounded-lg p-1.5 border z-10" style={{ height: 36, backgroundColor: "var(--hooma-warm-accent-bg)", borderColor: "var(--hooma-warm-accent-border)" }}>
                <div className="text-[10px] font-semibold leading-tight" style={{ color: "var(--hooma-warm-accent)" }}>Bella</div>
                <div className="text-[9px]" style={{ color: "var(--hooma-warm-accent)", opacity: 0.7 }}>Nails</div>
              </div>
            </div>
          </div>

          {/* 10:00 */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-x-1.5 border-t border-border/25">
            <div className="text-[9px] text-muted-foreground pt-1 text-right pr-2">10:00</div>
            <div className="h-12" />
            <div className="relative h-12 overflow-visible">
              <div className="absolute inset-x-0 top-1 rounded-lg p-1.5 bg-secondary/10 border border-secondary/15 z-10" style={{ height: 58 }}>
                <div className="text-[10px] font-semibold text-secondary leading-tight">Max</div>
                <div className="text-[9px] text-secondary/70">Bath &amp; Trim</div>
                <div className="text-[8px] text-secondary/50 mt-0.5">10:00 – 11:15</div>
              </div>
            </div>
            <div className="h-12" />
          </div>

          {/* 11:00 */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-x-1.5 border-t border-border/25">
            <div className="text-[9px] text-muted-foreground pt-1 text-right pr-2">11:00</div>
            <div className="h-12" />
            <div className="h-12" />
            <div className="h-12" />
          </div>

          {/* 12:00 */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-x-1.5 border-t border-border/25">
            <div className="text-[9px] text-muted-foreground pt-1 text-right pr-2">12:00</div>
            <div className="h-12" />
            <div className="h-12" />
            <div className="relative h-12 overflow-visible">
              <div className="absolute inset-x-0 top-1 rounded-lg p-1.5 bg-chart-3/10 border border-chart-3/15 z-10" style={{ height: 44 }}>
                <div className="text-[10px] font-semibold text-chart-3 leading-tight">Coco</div>
                <div className="text-[9px] text-chart-3/70">Puppy Bath</div>
              </div>
            </div>
          </div>

          {/* 1:00 */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-x-1.5 border-t border-border/25">
            <div className="text-[9px] text-muted-foreground pt-1 text-right pr-2">1:00</div>
            <div className="h-6" />
            <div className="h-6" />
            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Feature Card ──────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description, badge }: {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}) {
  return (
    <div className="bg-card rounded-[20px] border border-border/40 p-6 transition-shadow duration-200 hover:shadow-[var(--hooma-shadow-feature-hover)]">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-foreground mb-1.5 flex items-center gap-2">
        {title}
        {badge && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--hooma-warm-accent-badge)", color: "var(--hooma-warm-accent)" }}
          >
            {badge}
          </span>
        )}
      </h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-border/40">
      <summary className="flex items-center justify-between py-5 cursor-pointer text-[15px] font-medium text-foreground hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
        {question}
        <svg
          className="w-4 h-4 shrink-0 ml-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="pb-5 text-[13px] text-muted-foreground leading-relaxed pr-8">
        {answer}
      </div>
    </details>
  )
}

// ── Roadmap Card ──────────────────────────────────────────────────────────────

function RoadmapCard() {
  const items = [
    { label: "Week view improvements", status: "done" as const },
    { label: "Auto-reminders", status: "progress" as const },
    { label: "Payments integration", status: "planned" as const },
  ]

  return (
    <div
      className="bg-card rounded-[20px] border border-border/40 p-5 w-full max-w-sm"
      style={{ boxShadow: "var(--hooma-shadow-sm)" }}
    >
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Roadmap
      </div>
      <div className="space-y-3.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                item.status === "done"
                  ? "bg-secondary"
                  : item.status === "progress"
                    ? "bg-primary"
                    : "bg-border"
              }`}
            />
            <span className="text-[13px] text-foreground">{item.label}</span>
            {item.status === "done" && (
              <span className="text-[10px] text-secondary font-medium ml-auto">Shipped</span>
            )}
            {item.status === "progress" && (
              <span className="text-[10px] text-primary font-medium ml-auto">In Progress</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-border/30">
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
        >
          Vote on features
          <IconArrowRight />
        </a>
      </div>
    </div>
  )
}

// ── Bullet Point ──────────────────────────────────────────────────────────────

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">
        <IconCheck className="text-secondary" />
      </span>
      <span className="text-[14px] text-foreground/90 leading-relaxed">{children}</span>
    </li>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[60]"
        aria-hidden="true"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-[800px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, var(--hooma-warm-accent-glow), transparent)",
        }}
      />

      {/* ─── Navigation ─────────────────────────────────────────────────── */}

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <nav className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 group" aria-label="Hooma CRM Home">
            <PawIcon className="w-10 h-10 text-primary transition-transform duration-200 group-hover:scale-110" />
            <span className="text-[18px] font-bold text-foreground tracking-tight">Hooma</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#for-who" className="hover:text-foreground transition-colors">For Who</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[13px] font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start Free</span>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ─── 1. Hero ────────────────────────────────────────────────── */}

        <section className="relative py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text */}
              <div>
                <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold tracking-tight leading-[1.1] text-foreground">
                  Free CRM for{" "}
                  <span className="text-primary">Grooming Salons</span>
                </h1>
                <p className="mt-5 text-[17px] sm:text-[19px] text-muted-foreground leading-relaxed max-w-lg">
                  Manage bookings, staff and clients in one simple, calm system — completely free.
                </p>
                <p className="mt-3 text-[13px] text-muted-foreground/80">
                  No credit card. Setup in minutes. Built specifically for grooming businesses.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center bg-primary text-primary-foreground px-7 py-3 rounded-2xl text-[15px] font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
                    style={{ boxShadow: "var(--hooma-shadow-primary-lg)" }}
                  >
                    Get Started Free
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center bg-card text-foreground border border-border/60 px-7 py-3 rounded-2xl text-[15px] font-medium hover:bg-muted/50 active:scale-[0.97] transition-all"
                  >
                    See How It Works
                  </a>
                </div>

                {/* Trust hints */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Free forever for early users
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    We ship improvements every week
                  </span>
                </div>
              </div>

              {/* Calendar Mock */}
              <div className="flex justify-center lg:justify-end">
                <CalendarMock />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. Why Hooma ───────────────────────────────────────────── */}

        <section className="py-16 lg:py-24 bg-card">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-foreground">
              Running a grooming salon shouldn&apos;t feel chaotic.
            </h2>
            <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Between juggling bookings in notebooks, dealing with double-bookings, tracking
              no-shows, and keeping your team in sync — things get messy fast. Hooma replaces
              the chaos with clarity.
            </p>
          </div>

          <div className="max-w-2xl mx-auto px-5 mt-10">
            <ul className="space-y-4">
              <BulletPoint>One calm calendar for all your bookings — day and week view</BulletPoint>
              <BulletPoint>No more double-bookings or scheduling conflicts</BulletPoint>
              <BulletPoint>Client history and notes always at your fingertips</BulletPoint>
              <BulletPoint>Your team&apos;s availability, always visible and up to date</BulletPoint>
            </ul>
          </div>
        </section>

        {/* ─── 3. Features ────────────────────────────────────────────── */}

        <section id="features" className="py-16 lg:py-24 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-foreground">
                Everything you need to manage your salon
              </h2>
              <p className="mt-3 text-[15px] text-muted-foreground max-w-lg mx-auto">
                Simple tools that work together. No bloat, no learning curve.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureCard
                icon={<IconCalendar />}
                title="Smart Calendar"
                description="Day and week views with drag & drop. Conflict detection keeps your schedule clean."
              />
              <FeatureCard
                icon={<IconUsers />}
                title="Staff Management"
                description="Set availability, assign bookings, and see who's working at a glance."
              />
              <FeatureCard
                icon={<IconUser />}
                title="Client Profiles"
                description="Full history, notes, and preferences for every client. Never ask twice."
              />
              <FeatureCard
                icon={<IconScissors />}
                title="Services & Pricing"
                description="Define your services with duration and pricing. Fast booking, no guesswork."
              />
              <FeatureCard
                icon={<IconTrendingUp />}
                title="Revenue Overview"
                description="Simple reports to see how your business is doing. Clear, not complicated."
              />
              <FeatureCard
                icon={<IconBell />}
                title="Reminders"
                description="Automated reminders to reduce no-shows and keep clients informed."
                badge="Coming Soon"
              />
            </div>
          </div>
        </section>

        {/* ─── 4. Who It's For ────────────────────────────────────────── */}

        <section id="for-who" className="py-16 lg:py-24 bg-card scroll-mt-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-foreground">
                Built for real grooming businesses
              </h2>
              <p className="mt-3 text-[15px] text-muted-foreground max-w-lg mx-auto">
                Whether you work solo or with a growing team, Hooma adapts to your workflow.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                {
                  icon: <IconScissors className="text-primary" />,
                  title: "Independent Groomers",
                  desc: "Solo professionals managing their own schedule and clients",
                },
                {
                  icon: <IconUsers className="text-primary" />,
                  title: "Small Salons",
                  desc: "Teams of 2–5 coordinating bookings and availability",
                },
                {
                  icon: <IconMapPin className="text-primary" />,
                  title: "Mobile Groomers",
                  desc: "On-the-go businesses that need simple, reliable tools",
                },
                {
                  icon: <IconTrendingUp className="text-primary" />,
                  title: "Growing Teams",
                  desc: "Expanding businesses that need structure without complexity",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-border/40 p-5 text-center bg-background"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. Why It's Free ───────────────────────────────────────── */}

        <section className="py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-foreground">
                  Why is Hooma free?
                </h2>
                <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed">
                  We believe small businesses deserve great tools without great costs. Hooma is
                  built in public — we ship improvements every week based on real feedback from
                  real groomers.
                </p>
                <ul className="mt-6 space-y-3">
                  <BulletPoint>We want to support independent groomers and small salons</BulletPoint>
                  <BulletPoint>We build with real community feedback, not assumptions</BulletPoint>
                  <BulletPoint>Early users help shape the product and get free access forever</BulletPoint>
                </ul>
              </div>
              <div className="flex justify-center lg:justify-end">
                <RoadmapCard />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. FAQ ─────────────────────────────────────────────────── */}

        <section id="faq" className="py-16 lg:py-24 bg-card scroll-mt-16">
          <div className="max-w-2xl mx-auto px-5">
            <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-foreground text-center mb-10">
              Frequently Asked Questions
            </h2>

            <div>
              <FAQItem
                question="Is it really free?"
                answer="Yes, completely. No hidden fees, no trial period. Hooma is free for early users and we plan to keep a generous free tier forever."
              />
              <FAQItem
                question="Do I need a credit card to sign up?"
                answer="No. You can create an account and start using Hooma immediately — no payment information required."
              />
              <FAQItem
                question="Can I use it with multiple staff members?"
                answer="Absolutely. Add team members, manage their schedules, assign bookings, and set individual availability — all from one place."
              />
              <FAQItem
                question="Is my data secure?"
                answer="Yes. We use industry-standard encryption and security practices. Your data is stored securely and is never shared with third parties."
              />
              <FAQItem
                question="Can I export my data?"
                answer="Yes. You own your data and can export it at any time. We believe in data portability and will never lock you in."
              />
              <FAQItem
                question="Does it work on tablets and phones?"
                answer="Yes, Hooma is fully responsive and works great on tablets, phones, and desktop computers. Use it wherever you are."
              />
              <FAQItem
                question="When will paid plans appear?"
                answer="We're focused on building the best free experience first. Paid plans with advanced features may come later, but the core product will always have a generous free tier."
              />
            </div>
          </div>
        </section>

        {/* ─── 7. Final CTA ───────────────────────────────────────────── */}

        <section className="py-20 lg:py-28">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-foreground">
              Start managing your grooming business the calm way.
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground">
              Join groomers who chose simplicity over chaos.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl text-[15px] font-semibold hover:opacity-90 active:scale-[0.97] transition-all mt-8"
              style={{ boxShadow: "var(--hooma-shadow-primary-lg)" }}
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* ─── 8. Footer ──────────────────────────────────────────────── */}

      <footer className="border-t border-border/40 py-10 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-0.5">
            <PawIcon className="w-10 h-10 text-primary" />
            <span className="text-[16px] font-semibold text-foreground tracking-tight">Hooma</span>
          </div>

          <nav className="flex items-center gap-6 text-[13px] text-muted-foreground" aria-label="Footer">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Login</Link>
          </nav>

          <p className="text-[12px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Hooma. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ─── Mobile Sticky CTA ──────────────────────────────────────── */}

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-card/80 backdrop-blur-xl border-t border-border/40 lg:hidden">
        <Link
          href="/auth/login"
          className="flex items-center justify-center w-full bg-primary text-primary-foreground py-3 rounded-2xl text-[15px] font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
          style={{ boxShadow: "var(--hooma-shadow-primary-lg)" }}
        >
          Get Started Free
        </Link>
      </div>
    </div>
  )
}
