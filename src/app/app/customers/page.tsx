"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { cn } from "@/lib/utils";
import { Users, Plus, Trash2, ChevronRight, Phone, Mail } from "lucide-react";

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
          <p className="text-xs font-medium text-[#A8998C] uppercase tracking-widest mb-1">Clients & pets</p>
          <p className="text-[#7A655A] text-sm">Everyone who trusts you with their furry family.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold",
            "bg-[#7FA6C9] text-white",
            "shadow-[0_2px_12px_rgba(127,166,201,0.3)]",
            "hover:shadow-[0_4px_20px_rgba(127,166,201,0.4)] hover:-translate-y-0.5",
            "transition-all duration-200 cursor-pointer"
          )}
        >
          <Plus size={16} />
          New customer
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-[24px] bg-[#EDE4D8] shadow-[0_4px_24px_rgba(62,47,42,0.08)] p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="font-semibold text-[#3E2F2A]">Add a new customer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)}
              className="col-span-full rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none focus:ring-2 focus:ring-[#7FA6C9]/30" />
            <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none focus:ring-2 focus:ring-[#7FA6C9]/30" />
            <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
              className="rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none focus:ring-2 focus:ring-[#7FA6C9]/30" />
            <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="col-span-full rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none resize-none focus:ring-2 focus:ring-[#7FA6C9]/30" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={addCustomer} disabled={!canSubmit}
              className="px-6 py-2.5 rounded-full bg-[#7FA6C9] text-white text-sm font-semibold disabled:opacity-40 cursor-pointer hover:bg-[#6A92B8] transition-colors">
              Add customer
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-full bg-[#F5EFE6] text-[#7A655A] text-sm font-medium cursor-pointer hover:bg-[#EDE4D8] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !showForm && (
        <div className="rounded-[28px] bg-[#EDE4D8] shadow-[0_4px_24px_rgba(62,47,42,0.06)] p-16 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-[#E4EEF6] flex items-center justify-center">
            <Users size={28} strokeWidth={1.5} className="text-[#7FA6C9]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#3E2F2A]">Your clients are waiting to meet you.</p>
            <p className="text-sm text-[#A8998C] mt-1 max-w-xs">
              Add your first customer and start building lasting relationships — one paw at a time.
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="mt-2 px-6 py-2.5 rounded-full bg-[#7FA6C9] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(127,166,201,0.25)] hover:shadow-[0_4px_20px_rgba(127,166,201,0.35)] transition-all cursor-pointer">
            Add your first customer
          </button>
        </div>
      )}

      {/* Customer list */}
      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id}
              className="group flex items-center gap-4 rounded-[20px] bg-[#EDE4D8] shadow-[0_2px_12px_rgba(62,47,42,0.06)] px-5 py-4 hover:shadow-[0_4px_20px_rgba(62,47,42,0.09)] transition-all">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#7FA6C9]/15 flex items-center justify-center text-sm font-bold text-[#7FA6C9] shrink-0">
                {c.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/app/customers/${c.id}`} className="font-semibold text-[#3E2F2A] text-sm hover:text-[#7FA6C9] transition-colors">
                  {c.name}
                </Link>
                <div className="flex items-center gap-3 mt-0.5">
                  {c.phone && (
                    <span className="flex items-center gap-1 text-xs text-[#A8998C]">
                      <Phone size={11} />{c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="flex items-center gap-1 text-xs text-[#A8998C]">
                      <Mail size={11} />{c.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <Link href={`/app/customers/${c.id}`}
                  className="w-8 h-8 rounded-xl bg-[#F5EFE6] opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-[#EDE4D8] transition-all">
                  <ChevronRight size={14} className="text-[#7A655A]" />
                </Link>
                <button onClick={() => removeCustomer(c.id)}
                  className="w-8 h-8 rounded-xl bg-[#F5EFE6] opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-[#F0D8D3] transition-all cursor-pointer">
                  <Trash2 size={13} className="text-[#C4605A]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
