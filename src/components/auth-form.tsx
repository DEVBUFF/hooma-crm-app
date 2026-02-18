"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SocialButton } from "./social-button"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type AuthStep = "email" | "password" | "register"

export function AuthForm() {
  const [step, setStep] = useState<AuthStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value)
  }

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    setError("")

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // Try to sign in with this email to see if account exists
      await signInWithEmailAndPassword(auth, email, password === "" ? "test" : password)
      // If successful, go to password step
      setStep("password")
    } catch (err) {
      const error = err as { code: string };
      if (error.code === "auth/user-not-found") {
        // User doesn't exist, go to registration
        setStep("register")
      } else if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email address")
      } else {
        // User exists, proceed to password step
        setStep("password")
      }
    }

    setIsLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Successfully signed in, redirect to dashboard
      router.push("/app")
    } catch (err) {
      const error = err as { message: string };
      setError(error.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create salon document in Firestore
      await setDoc(doc(db, "salons", userCredential.user.uid), {
        salonName: name || "My Salon",
        email: email,
        createdAt: new Date(),
        ownerId: userCredential.user.uid,
      })

      // Successfully registered, redirect to dashboard
      router.push("/app")
    } catch (err) {
      const error = err as { message: string };
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep("email")
    setPassword("")
    setName("")
    setError("")
  }

  return (
    <div className="w-full space-y-6">
      {/* Email Step */}
      {step === "email" && (
        <form onSubmit={handleEmailContinue} className="space-y-5 animate-in fade-in duration-500">
          <div className="space-y-2">
            <div className="relative">
              <Mail
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                size={18}
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
                  "w-full pl-12 pr-5 py-4 rounded-full text-sm",
                  "bg-[#EEF0A8]/60 text-foreground placeholder:text-muted-foreground/50",
                  "border border-[#E2E4A0]/50",
                  "transition-all duration-300 ease-out",
                  "focus:outline-none focus:bg-[#EEF0A8]/80 focus:border-[#D8DA90]",
                  emailError && "border-destructive focus:border-destructive"
                )}
              />
            </div>
            {emailError && (
              <p className="text-xs text-destructive pl-1 animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 px-6",
              "rounded-full font-bold text-sm tracking-wide",
              "bg-[#A8C4DC] text-foreground",
              "shadow-[0_2px_8px_rgba(127,166,201,0.2)]",
              "transition-all duration-200 ease-out",
              "hover:bg-[#9BBAD4] hover:shadow-[0_4px_16px_rgba(127,166,201,0.3)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FA6C9] focus-visible:ring-offset-2",
              "active:scale-[0.99]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "cursor-pointer"
            )}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Continue"
            )}
          </button>
        </form>
      )}

      {/* Password Step */}
      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {'<-'} Back
            </button>
            <p className="text-sm text-muted-foreground">
              Signing in as <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
                aria-hidden="true"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
                className={cn(
                  "w-full pl-12 pr-12 py-4 rounded-full text-sm",
                  "bg-[#F0E8DC] text-foreground placeholder:text-muted-foreground/50",
                  "border border-[#E5DACB]/60",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none focus:bg-[#EDE4D8] focus:border-[#D8CFC0]"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive pl-1 animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 px-6",
              "rounded-full font-bold text-sm tracking-wide",
              "bg-[#A8C4DC] text-foreground",
              "shadow-[0_2px_8px_rgba(127,166,201,0.2)]",
              "transition-all duration-200 ease-out",
              "hover:bg-[#9BBAD4] hover:shadow-[0_4px_16px_rgba(127,166,201,0.3)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FA6C9] focus-visible:ring-offset-2",
              "active:scale-[0.99]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "cursor-pointer"
            )}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Sign in"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      )}

      {/* Registration Step */}
      {step === "register" && (
        <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {'<-'} Back
            </button>
            <p className="text-sm text-muted-foreground">
              Creating an account for <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-foreground">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              autoFocus
              className={cn(
                "w-full px-5 py-4 rounded-full text-sm",
                "bg-[#F0E8DC] text-foreground placeholder:text-muted-foreground/50",
                "border border-[#E5DACB]/60",
                "transition-all duration-200 ease-out",
                "focus:outline-none focus:bg-[#EDE4D8] focus:border-[#D8CFC0]"
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reg-password" className="block text-sm font-semibold text-foreground">
              Create a password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
                aria-hidden="true"
              />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className={cn(
                  "w-full pl-12 pr-12 py-4 rounded-full text-sm",
                  "bg-[#F0E8DC] text-foreground placeholder:text-muted-foreground/50",
                  "border border-[#E5DACB]/60",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none focus:bg-[#EDE4D8] focus:border-[#D8CFC0]"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive pl-1 animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !name || !password}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 px-6",
              "rounded-full font-bold text-sm tracking-wide",
              "bg-[#A8C4DC] text-foreground",
              "shadow-[0_2px_8px_rgba(127,166,201,0.2)]",
              "transition-all duration-200 ease-out",
              "hover:bg-[#9BBAD4] hover:shadow-[0_4px_16px_rgba(127,166,201,0.3)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FA6C9] focus-visible:ring-offset-2",
              "active:scale-[0.99]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "cursor-pointer"
            )}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Create account"
            )}
          </button>
        </form>
      )}

      {/* Divider */}
      {step === "email" && (
        <div className="flex items-center gap-4 animate-in fade-in duration-500" aria-hidden="true">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* Social Buttons */}
      {step === "email" && (
        <div className="space-y-3 animate-in fade-in duration-500">
          <SocialButton provider="google" />
          <SocialButton provider="apple" />
        </div>
      )}
    </div>
  )
}
