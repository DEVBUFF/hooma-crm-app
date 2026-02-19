"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Loader2, User, Store, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import Link from "next/link"

type Step = "info" | "password"

function FieldWrapper({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      {children}
      {error && (
        <p className="text-xs text-[#A04040] pl-1 animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function InputField({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  icon,
  rightSlot,
  error,
}: {
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete?: string
  autoFocus?: boolean
  icon: React.ReactNode
  rightSlot?: React.ReactNode
  error?: boolean
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8998C]">{icon}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={cn(
          "w-full pl-11 pr-5 py-3.5 rounded-[16px] text-sm font-medium",
          "bg-[#F0E8DC] text-[#3E2F2A] placeholder:text-[#B5A396]",
          "border border-[#E5DACB]/60",
          "transition-all duration-200",
          "focus:outline-none focus:bg-[#EDE4D8] focus:border-primary",
          rightSlot && "pr-11",
          error && "border-[#C4605A]/60 focus:border-[#C4605A]"
        )}
      />
      {rightSlot && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</span>
      )}
    </div>
  )
}

export function RegisterForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter()

  const [step, setStep] = useState<Step>("info")
  const [name, setName] = useState("")
  const [salonName, setSalonName] = useState("")
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<"name" | "salonName" | "email" | "password" | "general", string>>>({})

  function validate(): boolean {
    const next: typeof errors = {}
    if (!name.trim()) next.name = "Please enter your name"
    if (!salonName.trim()) next.salonName = "Please enter your salon or business name"
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRe.test(email)) next.email = "Enter a valid email address"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function validatePassword(): boolean {
    const next: typeof errors = {}
    if (password.length < 8) next.password = "Password must be at least 8 characters"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleInfoNext(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) setStep("password")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePassword()) return

    setIsLoading(true)
    setErrors({})
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await setDoc(doc(db, "salons", cred.user.uid), {
        salonName: salonName.trim(),
        ownerName: name.trim(),
        email: email.trim(),
        ownerId: cred.user.uid,
        createdAt: serverTimestamp(),
        settings: {
          currency: "EUR",
          slotDuration: 30,
          workHours: {
            mon: { start: "10:00", end: "19:00" },
            tue: { start: "10:00", end: "19:00" },
            wed: { start: "10:00", end: "19:00" },
            thu: { start: "10:00", end: "19:00" },
            fri: { start: "10:00", end: "19:00" },
            sat: { start: "10:00", end: "16:00" },
            sun: null,
          },
        },
      })
      router.push("/app")
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === "auth/email-already-in-use") {
        setErrors({ general: "An account with this email already exists. Try signing in." })
        setStep("info")
      } else if (e.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak. Use at least 8 characters." })
      } else {
        setErrors({ general: e.message || "Something went wrong. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const stepDone = step === "password"

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(["info", "password"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
              step === s
                ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(127,166,201,0.35)]"
                : stepDone || i === 0
                  ? "bg-[#E8EFE7] text-[#5A8A6A]"
                  : "bg-[#EDE4D8] text-[#B5A396]"
            )}>
              {(step !== s && i === 0) ? <Check size={10} /> : i + 1}
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors duration-200",
              step === s ? "text-[#3E2F2A]" : "text-[#B5A396]"
            )}>
              {s === "info" ? "Your info" : "Password"}
            </span>
            {i < 1 && <div className="flex-1 h-px w-6 bg-[#DDD4C4] mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Info */}
      {step === "info" && (
        <form onSubmit={handleInfoNext} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {errors.general && (
            <div className="rounded-[14px] bg-[#F0D8D3] px-4 py-3 text-xs text-[#A04040] font-medium">
              {errors.general}
            </div>
          )}

          <FieldWrapper error={errors.name}>
            <label htmlFor="name" className="block text-xs font-semibold text-[#7A655A] uppercase tracking-wide">
              Your name
            </label>
            <InputField
              id="name"
              value={name}
              onChange={(v) => { setName(v); setErrors((p) => ({ ...p, name: undefined })) }}
              placeholder="Anna Smith"
              autoComplete="name"
              autoFocus
              icon={<User size={16} strokeWidth={2} />}
              error={!!errors.name}
            />
          </FieldWrapper>

          <FieldWrapper error={errors.salonName}>
            <label htmlFor="salonName" className="block text-xs font-semibold text-[#7A655A] uppercase tracking-wide">
              Salon / business name
            </label>
            <InputField
              id="salonName"
              value={salonName}
              onChange={(v) => { setSalonName(v); setErrors((p) => ({ ...p, salonName: undefined })) }}
              placeholder="Paws & Claws Grooming"
              autoComplete="organization"
              icon={<Store size={16} strokeWidth={2} />}
              error={!!errors.salonName}
            />
          </FieldWrapper>

          <FieldWrapper error={errors.email}>
            <label htmlFor="email" className="block text-xs font-semibold text-[#7A655A] uppercase tracking-wide">
              Email
            </label>
            <InputField
              id="email"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })) }}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail size={16} strokeWidth={2} />}
              error={!!errors.email}
            />
          </FieldWrapper>

          <button
            type="submit"
            disabled={!name || !salonName || !email}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 px-6 mt-2",
              "rounded-full font-bold text-sm",
              "bg-primary text-primary-foreground",
              "shadow-[0_2px_8px_rgba(127,166,201,0.25)]",
              "hover:opacity-90 hover:shadow-[0_4px_16px_rgba(127,166,201,0.35)]",
              "transition-all duration-200 active:scale-[0.99]",
              "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
          >
            Continue <ArrowRight size={15} />
          </button>

          <p className="text-center text-xs text-[#A8998C] pt-1">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-[#3E2F2A] hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {/* Step 2 — Password */}
      {step === "password" && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          {errors.general && (
            <div className="rounded-[14px] bg-[#F0D8D3] px-4 py-3 text-xs text-[#A04040] font-medium">
              {errors.general}
            </div>
          )}

          <div className="rounded-[16px] bg-[#F0E8DC] px-4 py-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#E8EFE7] flex items-center justify-center shrink-0">
              <Check size={13} className="text-[#5A8A6A]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#3E2F2A] truncate">{name} · {salonName}</p>
              <p className="text-[11px] text-[#A8998C] truncate">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep("info")}
              className="ml-auto text-[11px] font-semibold text-[#A8998C] hover:text-[#3E2F2A] transition-colors shrink-0 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <FieldWrapper error={errors.password}>
            <label htmlFor="password" className="block text-xs font-semibold text-[#7A655A] uppercase tracking-wide">
              Create a password
            </label>
            <InputField
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })) }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              autoFocus
              icon={<Lock size={16} strokeWidth={2} />}
              error={!!errors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-[#A8998C] hover:text-[#3E2F2A] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <p className="text-[11px] text-[#B5A396] pl-1">Use at least 8 characters</p>
          </FieldWrapper>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep("info")}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-full",
                "bg-[#EDE4D8] text-[#7A655A] text-sm font-semibold",
                "hover:bg-[#E0D5C6] transition-colors cursor-pointer",
                "disabled:opacity-40"
              )}
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 px-6",
                "rounded-full font-bold text-sm",
                "bg-primary text-primary-foreground",
                "shadow-[0_2px_8px_rgba(127,166,201,0.25)]",
                "hover:opacity-90 hover:shadow-[0_4px_16px_rgba(127,166,201,0.35)]",
                "transition-all duration-200 active:scale-[0.99]",
                "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
