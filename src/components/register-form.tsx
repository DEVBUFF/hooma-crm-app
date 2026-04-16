"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Loader2, User, ArrowRight } from "lucide-react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { t } from "@/lib/tokens"
import Link from "next/link"

function FieldWrapper({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      {children}
      {error && (
        <p
          className="text-xs pl-1 animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ color: t.colors.semantic.error }}
          role="alert"
        >
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
  const baseStyle: React.CSSProperties = {
    background: t.colors.component.input.bg,
    color: t.colors.component.input.text,
    border: `1px solid ${error ? t.colors.semantic.errorBorder : t.colors.semantic.borderSubtle}`,
    borderRadius: `${t.radius.md}px`,
  }

  return (
    <div className="relative">
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2"
        style={{ color: t.colors.semantic.textSubtle }}
      >
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="w-full pl-11 pr-5 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none"
        style={{ ...baseStyle, paddingRight: rightSlot ? "2.75rem" : undefined }}
        onFocus={(e) => { e.currentTarget.style.background = t.colors.component.input.bgFocus }}
        onBlur={(e) => { e.currentTarget.style.background = t.colors.component.input.bg }}
      />
      {rightSlot && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</span>
      )}
    </div>
  )
}

export function RegisterForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "password" | "general", string>>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const next: typeof errors = {}
    if (!name.trim()) next.name = "Please enter your name"
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRe.test(email)) next.email = "Enter a valid email address"
    if (password.length < 8) next.password = "Password must be at least 8 characters"
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setIsLoading(true)
    setErrors({})
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await setDoc(doc(db, "salons", cred.user.uid), {
        ownerName: name.trim(),
        email: email.trim(),
        ownerId: cred.user.uid,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
        onboardingSkipped: false,
        settings: {
          currency: "GBP",
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
      } else if (e.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak. Use at least 8 characters." })
      } else {
        setErrors({ general: e.message || "Something went wrong. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {errors.general && (
          <div
            className="px-4 py-3 text-xs font-medium"
            style={{
              background: t.colors.semantic.errorBg,
              color: t.colors.semantic.error,
              borderRadius: `${t.radius.md}px`,
            }}
          >
            {errors.general}
          </div>
        )}

        <FieldWrapper error={errors.name}>
          <label
            htmlFor="name"
            className="block text-xs font-semibold uppercase tracking-wide"
            style={{ color: t.colors.semantic.textMuted }}
          >
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

        <FieldWrapper error={errors.email}>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wide"
            style={{ color: t.colors.semantic.textMuted }}
          >
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

        <FieldWrapper error={errors.password}>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wide"
            style={{ color: t.colors.semantic.textMuted }}
          >
            Password
          </label>
          <InputField
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })) }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            icon={<Lock size={16} strokeWidth={2} />}
            error={!!errors.password}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="transition-colors cursor-pointer"
                style={{ color: t.colors.semantic.textSubtle }}
                onMouseEnter={(e) => { e.currentTarget.style.color = t.colors.semantic.text }}
                onMouseLeave={(e) => { e.currentTarget.style.color = t.colors.semantic.textSubtle }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </FieldWrapper>

        <button
          type="submit"
          disabled={isLoading || !name || !email || !password}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 mt-2 rounded-lg font-bold text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary, boxShadow: t.shadow.primary }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryHover }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.shadow.primary }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>Create account <ArrowRight size={15} /></>
          )}
        </button>

        <p className="text-center text-xs pt-1" style={{ color: t.colors.semantic.textSubtle }}>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold transition-colors"
            style={{ color: t.colors.semantic.text }}
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
