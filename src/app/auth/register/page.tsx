import { BackgroundShapes } from "@/components/background-shapes"
import { RegisterForm } from "@/components/register-form"

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
        <div className="bg-[#F5EEE4]/90 backdrop-blur-2xl rounded-[28px] shadow-[0_8px_40px_rgba(46,33,28,0.12),0_2px_10px_rgba(46,33,28,0.06)] border border-[#EDE4D8]/40 px-7 py-8 sm:px-8 sm:py-9">
          {/* Logo inside card */}
          <div className="text-center mb-7">
            <span className="text-3xl font-extrabold tracking-tight text-[#2E211C]">hooma</span>
            <p className="mt-1.5 text-sm text-[#A8998C]">Create your account — it&apos;s free</p>
          </div>
          <RegisterForm initialEmail={email} />
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px] text-[#B5A396]">
          By creating an account you agree to our{" "}
          <a href="#" className="font-semibold text-[#7A655A] hover:text-[#3E2F2A] transition-colors underline underline-offset-2">Terms</a>{" "}
          and{" "}
          <a href="#" className="font-semibold text-[#7A655A] hover:text-[#3E2F2A] transition-colors underline underline-offset-2">Privacy Policy</a>
        </p>
      </div>
    </main>
  )
}
