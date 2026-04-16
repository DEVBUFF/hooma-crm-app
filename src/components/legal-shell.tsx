import Link from "next/link"
import { HoomaLogo } from "@/components/brand/logo"

type FooterLink = { href: string; label: string }

interface LegalShellProps {
  title: string
  lastUpdated: string
  footerLinks: FooterLink[]
  children: React.ReactNode
}

export function LegalShell({
  title,
  lastUpdated,
  footerLinks,
  children,
}: LegalShellProps) {
  return (
    <main
      className="min-h-dvh"
      style={{ background: "#FFFFFF", color: "#0A0A1A" }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid #F3F4F6" }}>
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link href="/" aria-label="Hooma home">
            <HoomaLogo />
          </Link>
          <Link
            href="/auth/login"
            className="text-[13px] transition-colors"
            style={{ color: "#6B7280" }}
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <article className="max-w-3xl mx-auto px-5 py-12 pb-20">
        <h1
          className="text-[28px] sm:text-[32px] font-semibold tracking-tight"
          style={{ color: "#0A0A1A", letterSpacing: "-0.025em" }}
        >
          {title}
        </h1>
        <p className="text-[13px] mt-1.5" style={{ color: "#6B7280" }}>
          Last updated: {lastUpdated}
        </p>

        <div
          className="mt-10 space-y-8 text-[15px]"
          style={{ color: "#1A1A2E", lineHeight: 1.65 }}
        >
          {children}
        </div>
      </article>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #F3F4F6" }}>
        <div className="max-w-3xl mx-auto px-5 py-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px]" style={{ color: "#6B7280" }}>
            © {new Date().getFullYear()} Hooma. All rights reserved.
          </p>
          <nav
            className="flex items-center gap-6 text-[13px]"
            style={{ color: "#6B7280" }}
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  )
}

/* ── Shared primitives for legal copy ──────────────────────────── */

export function LegalSection({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2
        className="text-[17px] font-semibold mb-3"
        style={{ color: "#0A0A1A" }}
      >
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="list-disc pl-6 space-y-1.5"
      style={{ color: "#374151" }}
    >
      {children}
    </ul>
  )
}

export function LegalLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="underline underline-offset-2 transition-opacity hover:opacity-80"
      style={{ color: "#5A61B8" }}
    >
      {children}
    </Link>
  )
}

export function LegalEmail({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="underline underline-offset-2 transition-opacity hover:opacity-80"
      style={{ color: "#5A61B8" }}
    >
      {email}
    </a>
  )
}
