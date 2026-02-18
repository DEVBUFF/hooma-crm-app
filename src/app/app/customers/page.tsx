"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

export default function CustomersPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  async function loadCustomers() {
    if (!salon) return;
    setLoading(true);

    const snap = await getDocs(collection(db, "salons", salon.id, "customers"));

    const data: Customer[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Customer, "id">),
    }));

    data.sort((a, b) => a.name.localeCompare(b.name));
    setItems(data);

    setLoading(false);
  }

  useEffect(() => {
    if (salon) loadCustomers();
  }, [salon]);

  async function addCustomer() {
    if (!salon || !canSubmit) return;

    await addDoc(collection(db, "salons", salon.id, "customers"), {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
      createdAt: serverTimestamp(),
    });

    setName("");
    setPhone("");
    setEmail("");
    setNotes("");

    loadCustomers();
  }

  async function removeCustomer(customerId: string) {
    const petsSnap = await getDocs(
      collection(db, "salons", salon!.id, "customers", customerId, "pets")
    );
    await Promise.all(petsSnap.docs.map((d) => deleteDoc(doc(db, "salons", salon!.id, "customers", customerId, "pets", d.id))));
    await deleteDoc(doc(db, "salons", salon!.id, "customers", customerId));
    loadCustomers();
  }

  if (salonLoading) return null;

  return (
    <div style={{ padding: 20, maxWidth: 880 }}>
      <h1>Customers</h1>

      {/* Create */}
      <div style={{ marginTop: 18, display: "grid", gap: 10, maxWidth: 520 }}>
        <input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <button disabled={!canSubmit} onClick={addCustomer}>
          Add customer
        </button>
      </div>

      {/* List */}
      <div style={{ marginTop: 28 }}>
        {loading && <div>Loading...</div>}
        {!loading && items.length === 0 && <div style={{ opacity: 0.8 }}>No customers yet.</div>}

        {items.map((c) => (
          <div
            key={c.id}
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
              <Link href={`/app/customers/${c.id}`}>
                <strong>{c.name}</strong>
              </Link>
              <div style={{ opacity: 0.8 }}>
                {c.phone ? c.phone : ""} {c.email ? `• ${c.email}` : ""}
              </div>
            </div>

            <button onClick={() => removeCustomer(c.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}