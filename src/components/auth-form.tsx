"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { SocialButton } from "./social-button"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { t } from "@/lib/tokens"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type AuthStep = "email" | "password"

export function AuthForm() {
  const [step, setStep] = useState<AuthStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value)
  }

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    setError("")
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }
    setStep("password")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/app")
    } catch (err) {
      const e = err as { code?: string }
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("Wrong password. Please try again.")
      } else if (e.code === "auth/user-not-found") {
        router.push(`/auth/register?email=${encodeURIComponent(email)}`)
      } else {
        setError("Failed to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep("email")
    setPassword("")
    setError("")
  }

  return (
    <div className="w-full space-y-5">
      {/* Email Step */}
      {step === "email" && (
        <form onSubmit={handleEmailContinue} className="space-y-4 animate-in fade-in duration-300">
          <Input
            id="email"
            type="email"
            leftIcon={<Mail size={17} aria-hidden="true" />}
            error={emailError}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError("")
            }}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={!email}
          >
            Continue
          </Button>

          <p className="text-center text-xs" style={{ color: t.colors.semantic.textSubtle }}>
            No account?{" "}
            <a
              href="/auth/register"
              className="font-semibold transition-colors"
              style={{ color: t.colors.semantic.text }}
            >
              Create one free
            </a>
          </p>
        </form>
      )}

      {/* Password Step */}
      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
          {/* Email summary */}
          <div
            className="px-4 py-3 flex items-center gap-2.5"
            style={{ background: t.colors.component.input.bg, borderRadius: `${t.radius.md}px` }}
          >
            <Mail size={14} className="shrink-0" style={{ color: t.colors.semantic.textSubtle }} />
            <span className="text-sm font-medium truncate flex-1" style={{ color: t.colors.semantic.text }}>{email}</span>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
              style={{ color: t.colors.semantic.textSubtle }}
              onMouseEnter={(e) => { e.currentTarget.style.color = t.colors.semantic.text }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.colors.semantic.textSubtle }}
            >
              <ArrowLeft size={11} /> Change
            </button>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                leftIcon={<Lock size={17} aria-hidden="true" />}
                error={error}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={!password}
          >
            Sign in
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Forgot your password?
            </Button>
          </div>
        </form>
      )}

      {/* Divider + Social Buttons — hidden until OAuth is wired up */}
      {/* {step === "email" && (
        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="flex-1 h-px" style={{ background: t.colors.semantic.divider }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: t.colors.semantic.placeholder }}
          >
            or
          </span>
          <div className="flex-1 h-px" style={{ background: t.colors.semantic.divider }} />
        </div>
      )}

      {step === "email" && (
        <div className="space-y-2.5 animate-in fade-in duration-300">
          <SocialButton provider="google" />
          <SocialButton provider="apple" />
        </div>
      )} */}
    </div>
  )
}

