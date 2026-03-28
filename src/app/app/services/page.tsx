"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { useSalonSettings } from "@/lib/useSalonSettings";
import { t } from "@/lib/tokens";
import { Skeleton } from "@/components/patterns/skeleton";
import { Sparkles, Plus, Pencil, Trash2, Check, X, Clock, BadgeDollarSign } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
};

type EditForm = {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
};

const inputStyle: React.CSSProperties = {
  background: t.colors.semantic.bg,
  color: t.colors.component.input.text,
  border: `1px solid ${t.colors.semantic.borderSubtle}`,
  borderRadius: `${t.radius.lg}px`,
};

export default function ServicesPage() {
  const { salon, loading: salonLoading } = useSalon();
  const { currency } = useSalonSettings();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(50);
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", durationMinutes: 60, price: 50 });

  const loadServices = useCallback(async () => {
    if (!salon) return;
    setLoading(true);
    const snap = await getDocs(collection(db, "salons", salon.id, "services"));
    const data: Service[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Service, "id">),
    }));
    setServices(data);
    setLoading(false);
  }, [salon]);

  useEffect(() => { loadServices(); }, [loadServices]);

  async function addService() {
    if (!salon || !name.trim()) return;
    await addDoc(collection(db, "salons", salon.id, "services"), {
      name: name.trim(),
      description: description.trim(),
      durationMinutes: Number(duration),
      price: Number(price),
      isActive: true,
    });
    setName(""); setDescription(""); setDuration(60); setPrice(50);
    setShowForm(false);
    loadServices();
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditForm({ name: service.name, description: service.description ?? "", durationMinutes: service.durationMinutes, price: service.price });
  }

  async function saveEdit(id: string) {
    if (!editForm.name.trim()) return;
    await updateDoc(doc(db, "salons", salon!.id, "services", id), {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      durationMinutes: Number(editForm.durationMinutes),
      price: Number(editForm.price),
    });
    setEditingId(null);
    loadServices();
  }

  async function removeService(id: string) {
    await deleteDoc(doc(db, "salons", salon!.id, "services", id));
    loadServices();
  }

  const showSkeleton = salonLoading || loading;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header row — always visible */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: t.colors.semantic.textSubtle }}
          >
            Catalogue
          </p>
          <p className="text-sm hidden sm:block" style={{ color: t.colors.semantic.textMuted }}>
            Everything you offer, beautifully organised.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 shrink-0"
          style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary, boxShadow: t.shadow.primaryLg }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryLgHover }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.shadow.primaryLg }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New service</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Skeleton while loading */}
      {showSkeleton && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-4"
              style={{ background: t.colors.component.card.bg, borderRadius: `${t.radius.lg}px`, boxShadow: t.shadow.sm }}
            >
              <Skeleton h="h-10" w="w-10" rounded="rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton h="h-4" w="w-36" />
                <Skeleton h="h-3" w="w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton h="h-3" w="w-14" />
                <Skeleton h="h-3" w="w-10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {!showSkeleton && showForm && (
        <div
          className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ background: t.colors.component.card.bg, borderRadius: `${t.radius.lg}px`, boxShadow: t.shadow.card }}
        >
          <h3 className="font-semibold" style={{ color: t.colors.semantic.text }}>Add a new service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Service name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              style={inputStyle}
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              style={inputStyle}
            />
            <div
              className="flex items-center gap-2 px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow"
              style={{ ...inputStyle }}
            >
              <Clock size={15} className="shrink-0" style={{ color: t.colors.semantic.placeholder }} />
              <input
                type="number"
                placeholder="Duration (min)"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: t.colors.semantic.text }}
              />
            </div>
            <div
              className="flex items-center gap-2 px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow"
              style={{ ...inputStyle }}
            >
              <BadgeDollarSign size={15} className="shrink-0" style={{ color: t.colors.semantic.placeholder }} />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: t.colors.semantic.text }}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={addService}
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 cursor-pointer transition-colors"
              style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary }}
            >
              Add service
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{ background: t.colors.semantic.bg, color: t.colors.semantic.textMuted }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!showSkeleton && services.length === 0 && !showForm && (
        <div
          className="p-16 flex flex-col items-center text-center gap-4"
          style={{ background: t.colors.component.card.bg, borderRadius: `${t.radius["2xl"]}px`, boxShadow: t.shadow.card }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: t.colors.semantic.accentTint, borderRadius: `${t.radius.lg}px` }}
          >
            <Sparkles size={28} strokeWidth={1.5} style={{ color: t.colors.semantic.primary }} />
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: t.colors.semantic.text }}>
              Let&apos;s add your first service.
            </p>
            <p className="text-sm mt-1 max-w-xs" style={{ color: t.colors.semantic.textSubtle }}>
              What kind of care do you offer? Add a grooming session, bath, or anything in between.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            style={{ background: t.colors.semantic.primary, color: t.colors.semantic.textOnPrimary, boxShadow: t.shadow.primaryLg }}
          >
            Add your first service
          </button>
        </div>
      )}

      {/* Services list */}
      {!showSkeleton && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) =>
            editingId === service.id ? (
              <div
                key={service.id}
                className="p-5 space-y-3"
                style={{ background: t.colors.component.card.bg, borderRadius: `${t.radius.lg}px`, boxShadow: t.shadow.card }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Service name"
                    className="col-span-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
                  <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description"
                    className="col-span-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
                  <input type="number" value={editForm.durationMinutes} onChange={(e) => setEditForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                    className="px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
                  <input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" style={inputStyle} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(service.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    style={{ background: t.colors.semantic.successAccent, color: t.colors.semantic.textOnPrimary }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.colors.semantic.successAccentHover }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = t.colors.semantic.successAccent }}
                  >
                    <Check size={13} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                    style={{ background: t.colors.semantic.bg, color: t.colors.semantic.textMuted }}
                  >
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={service.id}
                className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-all"
                style={{ background: t.colors.component.card.bg, borderRadius: `${t.radius.lg}px`, boxShadow: t.shadow.sm }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.md }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.sm }}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: t.colors.semantic.accentTint }}
                  >
                    <Sparkles size={16} strokeWidth={1.8} style={{ color: t.colors.semantic.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: t.colors.semantic.text }}>{service.name}</p>
                    {service.description && (
                      <p className="text-xs truncate" style={{ color: t.colors.semantic.textSubtle }}>{service.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
                  <div className="flex items-center gap-3 text-xs" style={{ color: t.colors.semantic.textSubtle }}>
                    <span className="flex items-center gap-1"><Clock size={12} />{service.durationMinutes} min</span>
                    <span className="flex items-center gap-1"><BadgeDollarSign size={12} />{currency} {service.price}</span>
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(service)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      style={{ background: t.colors.semantic.bg }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = t.colors.semantic.surfaceHover }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = t.colors.semantic.bg }}
                    >
                      <Pencil size={13} style={{ color: t.colors.semantic.textMuted }} />
                    </button>
                    <button onClick={() => removeService(service.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      style={{ background: t.colors.semantic.bg }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = t.colors.semantic.errorBg }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = t.colors.semantic.bg }}
                    >
                      <Trash2 size={13} style={{ color: t.colors.semantic.error }} />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
