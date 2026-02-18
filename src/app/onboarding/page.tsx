"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  async function createSalon() {
    if (!user) return;
    if (!name.trim()) return;

    setSaving(true);

    await addDoc(collection(db, "salons"), {
      ownerId: user.uid,
      name: name.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
      createdAt: serverTimestamp(),
      settings: {
        currency: "EUR",
        slotDuration: 60,
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
    });

    setSaving(false);
    router.replace("/app");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Create your salon</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input placeholder="Salon name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />

        <button disabled={saving || !name.trim()} onClick={createSalon}>
          {saving ? "Creating..." : "Create salon"}
        </button>
      </div>
    </div>
  );
}
