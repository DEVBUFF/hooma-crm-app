import { BackgroundShapes } from "@/components/background-shapes"
import { AuthForm } from "@/components/auth-form"
import { Card } from "@/components/ui/card"
import { t } from "@/lib/tokens"

export default function AuthPage() {
  return (
    <main className="relative min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <BackgroundShapes />

      <div className="relative z-10 w-full max-w-md">
        {/* Auth Card */}
        <Card variant="auth" className="px-8 py-9 sm:px-10 sm:py-10">
          {/* Logo inside card */}
          <div className="text-center mb-7">
            <span
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: t.colors.semantic.textStrong }}
            >
              hooma
            </span>
            <p className="mt-1.5 text-sm" style={{ color: t.colors.semantic.textSubtle }}>
              {"Let's take care of today."}
            </p>
          </div>
          <AuthForm />
        </Card>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px]" style={{ color: t.colors.semantic.placeholder }}>
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="font-semibold transition-colors underline underline-offset-2"
            style={{ color: t.colors.semantic.textMuted }}
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="font-semibold transition-colors underline underline-offset-2"
            style={{ color: t.colors.semantic.textMuted }}
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  )
}
