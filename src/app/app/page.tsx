"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function AppHomePage() {
    const handleLogout = async () => {
        await signOut(auth)
        window.location.href = "/"
    }

  return (
    <div style={{ padding: 16 }}>
      <h1>Hooma CRM</h1>
      <p>Welcome to your dashboard.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Выход
        </button>
    </div>
  );
}