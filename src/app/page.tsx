"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getSalonByOwnerId } from "@/lib/salon"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login")
        return
      }

      const salon = await getSalonByOwnerId(user.uid)
      if (!salon) {
        router.replace("/onboarding")
      } else {
        router.replace("/app")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      Загрузка...
    </div>
  )
}
