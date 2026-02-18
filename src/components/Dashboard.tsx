"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface DashboardProps {
  userEmail: string
}

export function Dashboard({ userEmail }: DashboardProps) {
  const handleLogout = async () => {
    await signOut(auth)
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Hooma CRM 🚀</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Выход
        </button>
      </div>
      <p className="text-xl">Добро пожаловать, {userEmail}!</p>
    </div>
  )
}