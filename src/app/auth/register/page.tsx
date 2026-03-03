import { BackgroundShapes } from "@/components/background-shapes"
import { RegisterForm } from "@/components/register-form"
import { t } from "@/lib/tokens"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email = "" } = await searchParams

  return (
    <main className="relative min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <BackgroundShapes />

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div
          className="backdrop-blur-2xl px-7 py-8 sm:px-8 sm:py-9"
          style={{
            background: t.colors.component.card.bgAuth,
            borderRadius: `${t.radius["2xl"]}px`,
            boxShadow: t.shadow.authCard,
            border: `1px solid ${t.colors.semantic.borderSubtle}`,
          }}
        >
          {/* Logo inside card */}
          <div className="text-center mb-7">
            <span
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: t.colors.semantic.textStrong }}
            >
              hooma
            </span>
            <p className="mt-1.5 text-sm" style={{ color: t.colors.semantic.textSubtle }}>
              Create your account — it&apos;s free
            </p>
          </div>
          <RegisterForm initialEmail={email} />
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px]" style={{ color: t.colors.semantic.placeholder }}>
          By creating an account you agree to our{" "}
          <a
            href="#"
            className="font-semibold transition-colors underline underline-offset-2"
            style={{ color: t.colors.semantic.textMuted }}
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
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
