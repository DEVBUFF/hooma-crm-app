"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { SocialButton } from "./social-button"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"

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
    // Always go to password step — sign-in attempt will reveal if account exists
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
        // Account doesn't exist — send to register
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
          <div className="space-y-1.5">
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8998C]"
                size={17}
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError("")
                }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className={cn(
                  "w-full pl-11 pr-5 py-3.5 rounded-[16px] text-sm font-medium",
                  "bg-[#F0E8DC] text-[#3E2F2A] placeholder:text-[#B5A396]",
                  "border border-[#E5DACB]/60",
                  "transition-all duration-200",
                  "focus:outline-none focus:bg-[#EDE4D8] focus:border-primary",
                  emailError && "border-[#C4605A]/60 focus:border-[#C4605A]"
                )}
              />
            </div>
            {emailError && (
              <p className="text-xs text-[#A04040] pl-1 animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 px-6",
              "rounded-full font-bold text-sm",
              "bg-primary text-primary-foreground",
              "shadow-[0_2px_8px_rgba(127,166,201,0.25)]",
              "hover:opacity-90 hover:shadow-[0_4px_16px_rgba(127,166,201,0.35)]",
              "transition-all duration-200 active:scale-[0.99]",
              "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
          >
            {isLoading ? <Loader2 className="animate-spin" size={17} /> : "Continue"}
          </button>

          <p className="text-center text-xs text-[#A8998C]">
            No account?{" "}
            <Link href="/auth/register" className="font-semibold text-[#3E2F2A] hover:text-primary transition-colors">
              Create one free
            </Link>
          </p>
        </form>
      )}

      {/* Password Step */}
      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
          {/* Email summary */}
          <div className="rounded-[14px] bg-[#F0E8DC] px-4 py-3 flex items-center gap-2.5">
            <Mail size={14} className="text-[#A8998C] shrink-0" />
            <span className="text-sm font-medium text-[#3E2F2A] truncate flex-1">{email}</span>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#A8998C] hover:text-[#3E2F2A] transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft size={11} /> Change
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-[#7A655A] uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8998C]" size={17} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
                className={cn(
                  "w-full pl-11 pr-11 py-3.5 rounded-[16px] text-sm font-medium",
                  "bg-[#F0E8DC] text-[#3E2F2A] placeholder:text-[#B5A396]",
                  "border border-[#E5DACB]/60",
                  "transition-all duration-200",
                  "focus:outline-none focus:bg-[#EDE4D8] focus:border-primary",
                  error && "border-[#C4605A]/60"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8998C] hover:text-[#3E2F2A] transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-[#A04040] pl-1 animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 px-6",
              "rounded-full font-bold text-sm",
              "bg-primary text-primary-foreground",
              "shadow-[0_2px_8px_rgba(127,166,201,0.25)]",
              "hover:opacity-90 hover:shadow-[0_4px_16px_rgba(127,166,201,0.35)]",
              "transition-all duration-200 active:scale-[0.99]",
              "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
          >
            {isLoading ? <Loader2 className="animate-spin" size={17} /> : "Sign in"}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-xs font-semibold text-[#A8998C] hover:text-[#3E2F2A] transition-colors cursor-pointer"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      )}

      {/* Divider */}
      {step === "email" && (
        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="flex-1 h-px bg-[#DDD4C4]" />
          <span className="text-[11px] font-semibold text-[#B5A396] uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-[#DDD4C4]" />
        </div>
      )}

      {/* Social Buttons */}
      {step === "email" && (
        <div className="space-y-2.5 animate-in fade-in duration-300">
          <SocialButton provider="google" />
          <SocialButton provider="apple" />
        </div>
      )}
    </div>
  )
}
