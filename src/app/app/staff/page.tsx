"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";

type StaffRole = "admin" | "groomer";

type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  phone?: string | null;
  isActive: boolean;
};

export default function StaffPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("groomer");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const loadStaff = useCallback(async () => {
    if (!salon) return;
    setLoading(true);

    const snap = await getDocs(collection(db, "salons", salon.id, "staff"));

    const data: Staff[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Staff, "id">),
    }));

    // Optional: active first
    data.sort((a, b) => Number(b.isActive) - Number(a.isActive));

    setItems(data);
    setLoading(false);
  }, [salon]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  async function addStaff() {
    if (!salon || !canSubmit) return;

    await addDoc(collection(db, "salons", salon.id, "staff"), {
      name: name.trim(),
      phone: phone.trim() || null,
      role,
      isActive: true,
      createdAt: serverTimestamp(),
    });

    setName("");
    setPhone("");
    setRole("groomer");

    loadStaff();
  }

  async function removeStaff(id: string) {
    await deleteDoc(doc(db, "salons", salon!.id, "staff", id));
    loadStaff();
  }

  async function toggleActive(staff: Staff) {
    await updateDoc(doc(db, "salons", salon!.id, "staff", staff.id), {
      isActive: !staff.isActive,
    });
    loadStaff();
  }

  if (salonLoading) return null;

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h1>Staff</h1>
      <p style={{ opacity: 0.8, marginTop: 4 }}>
        Add groomers/admins who can be assigned to bookings.
      </p>

      {/* Create */}
      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          <option value="groomer">Groomer</option>
          <option value="admin">Admin</option>
        </select>

        <button disabled={!canSubmit} onClick={addStaff}>
          Add staff member
        </button>
      </div>

      {/* List */}
      <div style={{ marginTop: 28 }}>
        {loading && <div>Loading...</div>}

        {!loading && items.length === 0 && (
          <div style={{ opacity: 0.8 }}>No staff yet.</div>
        )}

        {items.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 12,
              borderBottom: "1px solid #ddd",
              gap: 12,
            }}
          >
            <div>
              <strong style={{ opacity: s.isActive ? 1 : 0.5 }}>{s.name}</strong>
              <div style={{ opacity: 0.8 }}>
                {s.role} {s.phone ? `• ${s.phone}` : ""}
                {!s.isActive ? " • inactive" : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => toggleActive(s)}>
                {s.isActive ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => removeStaff(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}