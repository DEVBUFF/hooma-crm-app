"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { t } from "@/lib/tokens";
import { Users, Plus, Trash2, ChevronRight, Phone, Mail } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

const inputStyle: React.CSSProperties = {
  background: t.colors.semantic.bg,
  color: t.colors.semantic.text,
  borderRadius: `${t.radius.sm}px`,
};

export default function CustomersPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const loadCustomers = useCallback(async () => {
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
  }, [salon]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  async function addCustomer() {
    if (!salon || !canSubmit) return;
    await addDoc(collection(db, "salons", salon.id, "customers"), {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
      createdAt: serverTimestamp(),
    });
    setName(""); setPhone(""); setEmail(""); setNotes("");
    setShowForm(false);
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
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: t.colors.semantic.textSubtle }}
          >
            Clients & pets
          </p>
          <p className="text-sm" style={{ color: t.colors.semantic.textMuted }}>
            Everyone who trusts you with their furry family.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
          style={{ background: t.colors.semantic.primary, color: "#fff", boxShadow: t.shadow.primaryLg }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryLgHover }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryLg }}
        >
          <Plus size={16} />
          New customer
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ background: t.colors.semantic.surface, borderRadius: `${t.radius.xl}px`, boxShadow: t.shadow.lg }}
        >
          <h3 className="font-semibold" style={{ color: t.colors.semantic.text }}>Add a new customer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)}
              className="col-span-full px-4 py-3 text-sm outline-none" style={inputStyle} />
            <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-3 text-sm outline-none" style={inputStyle} />
            <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 text-sm outline-none" style={inputStyle} />
            <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="col-span-full px-4 py-3 text-sm outline-none resize-none" style={inputStyle} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={addCustomer} disabled={!canSubmit}
              className="px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-40 cursor-pointer transition-colors"
              style={{ background: t.colors.semantic.primary, color: "#fff" }}
            >
              Add customer
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-colors"
              style={{ background: t.colors.semantic.bg, color: t.colors.semantic.textMuted }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !showForm && (
        <div
          className="p-16 flex flex-col items-center text-center gap-4"
          style={{ background: t.colors.semantic.surface, borderRadius: `${t.radius["2xl"]}px`, boxShadow: t.shadow.card }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: t.colors.semantic.infoBg, borderRadius: `${t.radius.lg}px` }}
          >
            <Users size={28} strokeWidth={1.5} style={{ color: t.colors.semantic.primary }} />
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: t.colors.semantic.text }}>
              Your clients are waiting to meet you.
            </p>
            <p className="text-sm mt-1 max-w-xs" style={{ color: t.colors.semantic.textSubtle }}>
              Add your first customer and start building lasting relationships — one paw at a time.
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
            style={{ background: t.colors.semantic.primary, color: "#fff", boxShadow: t.shadow.primaryLg }}
          >
            Add your first customer
          </button>
        </div>
      )}

      {/* Customer list */}
      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-4 px-5 py-4 transition-all"
              style={{ background: t.colors.semantic.surface, borderRadius: `${t.radius.lg}px`, boxShadow: t.shadow.sm }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.md }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.sm }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: t.colors.semantic.primaryTint, color: t.colors.semantic.primary }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/app/customers/${c.id}`}
                  className="font-semibold text-sm transition-colors"
                  style={{ color: t.colors.semantic.text }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = t.colors.semantic.primary }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = t.colors.semantic.text }}
                >
                  {c.name}
                </Link>
                <div className="flex items-center gap-3 mt-0.5">
                  {c.phone && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: t.colors.semantic.textSubtle }}>
                      <Phone size={11} />{c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: t.colors.semantic.textSubtle }}>
                      <Mail size={11} />{c.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/app/customers/${c.id}`}
                  className="w-8 h-8 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                  style={{ background: t.colors.semantic.bg }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = t.colors.semantic.surface }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = t.colors.semantic.bg }}
                >
                  <ChevronRight size={14} style={{ color: t.colors.semantic.textMuted }} />
                </Link>
                <button
                  onClick={() => removeCustomer(c.id)}
                  className="w-8 h-8 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all"
                  style={{ background: t.colors.semantic.bg }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = t.colors.semantic.errorBg }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = t.colors.semantic.bg }}
                >
                  <Trash2 size={13} style={{ color: t.colors.semantic.error }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
