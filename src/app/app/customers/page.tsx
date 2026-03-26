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
import { Skeleton } from "@/components/patterns/skeleton";
import { Users, Plus, Trash2, ChevronRight, Phone, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  border: `1px solid ${t.colors.semantic.borderSubtle}`,
  borderRadius: `${t.radius.lg}px`,
};

export default function CustomersPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
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

  const showSkeleton = salonLoading || loading;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header — always visible */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: t.colors.semantic.textSubtle }}
          >
            Clients & pets
          </p>
          <p className="text-sm hidden sm:block" style={{ color: t.colors.semantic.textMuted }}>
            Everyone who trusts you with their furry family.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2 shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">New customer</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Skeleton while loading */}
      {showSkeleton && (
        <div
          className="overflow-hidden divide-y divide-border/30"
          style={{ background: t.colors.component.card.bg, borderRadius: `${t.radius.lg}px`, boxShadow: t.shadow.sm }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton h="h-10" w="w-10" rounded="rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton h="h-4" w="w-32" />
                <Skeleton h="h-3" w="w-24" />
              </div>
              <Skeleton h="h-4" w="w-4" rounded="rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {!showSkeleton && showForm && (
        <Card className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle>Add a new customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)}
                className="col-span-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
              <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
              <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
              <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                className="col-span-full px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
            </div>
            <div className="flex gap-3">
              <Button onClick={addCustomer} disabled={!canSubmit}>Add customer</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!showSkeleton && items.length === 0 && !showForm && (
        <Card className="p-16 flex flex-col items-center text-center gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: t.colors.semantic.infoBg, borderRadius: `${t.radius.lg}px` }}
          >
            <Users size={28} strokeWidth={1.5} style={{ color: t.colors.semantic.primary }} />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Your clients are waiting to meet you.
            </p>
            <p className="text-sm mt-1 max-w-xs text-muted-foreground">
              Add your first customer and start building lasting relationships — one paw at a time.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="mt-2">
            Add your first customer
          </Button>
        </Card>
      )}

      {/* Customer list */}
      {!showSkeleton && items.length > 0 && (
        <Card variant="flat" padding="sm" className="p-0 overflow-hidden divide-y divide-border/30">
          {items.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: t.colors.semantic.primaryTint, color: t.colors.semantic.primary }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/app/customers/${c.id}`}
                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block"
                >
                  {c.name}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  {c.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone size={11} />{c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail size={11} />{c.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => removeCustomer(c.id)}
                  className="w-8 h-8 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all hover:bg-destructive/8"
                >
                  <Trash2 size={13} className="text-destructive/60" />
                </button>
                <Link
                  href={`/app/customers/${c.id}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-muted-foreground/40 group-hover:text-muted-foreground"
                >
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
