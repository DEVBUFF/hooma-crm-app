import { BackgroundShapes } from "@/components/background-shapes"
import { AuthForm } from "@/components/auth-form"

export default function AuthPage() {
  return (
    <main className="relative min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <BackgroundShapes />

      <div className="relative z-10 w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-[#F5EEE4]/94 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_40px_rgba(46,33,28,0.14),0_2px_10px_rgba(46,33,28,0.08)] border border-[#EDE4D8]/30 px-8 py-10 sm:px-10 sm:py-12">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              hooma for professionals
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {"Let's take care of today."}
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed">
          By continuing, you agree to our{" "}
          <a
            href="#"
            className="font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-border hover:decoration-primary"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-border hover:decoration-primary"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  )
}
