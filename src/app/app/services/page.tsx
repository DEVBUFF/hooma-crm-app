"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { cn } from "@/lib/utils";
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

export default function ServicesPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(50);
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", durationMinutes: 60, price: 50 });

  const loadServices = useCallback(async () => {
    if (!salon) return;
    const snap = await getDocs(collection(db, "salons", salon.id, "services"));
    const data: Service[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Service, "id">),
    }));
    setServices(data);
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

  if (salonLoading) return null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#A8998C] uppercase tracking-widest mb-1">Catalogue</p>
          <p className="text-[#7A655A] text-sm">Everything you offer, beautifully organised.</p>
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
          New service
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-[24px] bg-[#EDE4D8] shadow-[0_4px_24px_rgba(62,47,42,0.08)] p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="font-semibold text-[#3E2F2A]">Add a new service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Service name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-full rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none focus:ring-2 focus:ring-[#7FA6C9]/30"
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-full rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none focus:ring-2 focus:ring-[#7FA6C9]/30"
            />
            <div className="flex items-center gap-2 rounded-[14px] bg-[#F5EFE6] px-4 py-3">
              <Clock size={15} className="text-[#B5A396] shrink-0" />
              <input
                type="number"
                placeholder="Duration (min)"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 bg-transparent text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-[14px] bg-[#F5EFE6] px-4 py-3">
              <BadgeDollarSign size={15} className="text-[#B5A396] shrink-0" />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="flex-1 bg-transparent text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={addService}
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-full bg-[#7FA6C9] text-white text-sm font-semibold disabled:opacity-40 cursor-pointer hover:bg-[#6A92B8] transition-colors"
            >
              Add service
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-full bg-[#F5EFE6] text-[#7A655A] text-sm font-medium cursor-pointer hover:bg-[#EDE4D8] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {services.length === 0 && !showForm && (
        <div className="rounded-[28px] bg-[#EDE4D8] shadow-[0_4px_24px_rgba(62,47,42,0.06)] p-16 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-[#FAEAE4] flex items-center justify-center">
            <Sparkles size={28} strokeWidth={1.5} className="text-[#7FA6C9]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#3E2F2A]">Let&apos;s add your first service.</p>
            <p className="text-sm text-[#A8998C] mt-1 max-w-xs">
              What kind of care do you offer? Add a grooming session, bath, or anything in between.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-6 py-2.5 rounded-full bg-[#7FA6C9] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(127,166,201,0.25)] hover:shadow-[0_4px_20px_rgba(127,166,201,0.35)] transition-all cursor-pointer"
          >
            Add your first service
          </button>
        </div>
      )}

      {/* Services list */}
      {services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) =>
            editingId === service.id ? (
              <div key={service.id} className="rounded-[20px] bg-[#EDE4D8] shadow-[0_2px_16px_rgba(62,47,42,0.08)] p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Service name"
                    className="col-span-full rounded-[14px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none" />
                  <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description"
                    className="col-span-full rounded-[14px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none" />
                  <input type="number" value={editForm.durationMinutes} onChange={(e) => setEditForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                    className="rounded-[14px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none" />
                  <input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="rounded-[14px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(service.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#A8BBA3] text-white text-xs font-semibold cursor-pointer hover:bg-[#96A990] transition-colors">
                    <Check size={13} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F5EFE6] text-[#7A655A] text-xs font-medium cursor-pointer hover:bg-[#EDE4D8] transition-colors">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={service.id} className="group flex items-center gap-4 rounded-[20px] bg-[#EDE4D8] shadow-[0_2px_12px_rgba(62,47,42,0.06)] px-5 py-4 hover:shadow-[0_4px_20px_rgba(62,47,42,0.09)] transition-all">
                <div className="w-10 h-10 rounded-2xl bg-[#FAEAE4] flex items-center justify-center shrink-0">
                  <Sparkles size={16} strokeWidth={1.8} className="text-[#7FA6C9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3E2F2A] text-sm">{service.name}</p>
                  {service.description && <p className="text-xs text-[#A8998C] truncate">{service.description}</p>}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#A8998C]">
                  <span className="flex items-center gap-1"><Clock size={12} />{service.durationMinutes} min</span>
                  <span className="flex items-center gap-1"><BadgeDollarSign size={12} />{service.price}€</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(service)} className="w-8 h-8 rounded-xl bg-[#F5EFE6] flex items-center justify-center cursor-pointer hover:bg-[#E8DFD0] transition-colors">
                    <Pencil size={13} className="text-[#7A655A]" />
                  </button>
                  <button onClick={() => removeService(service.id)} className="w-8 h-8 rounded-xl bg-[#F5EFE6] flex items-center justify-center cursor-pointer hover:bg-[#F0D8D3] transition-colors">
                    <Trash2 size={13} className="text-[#C4605A]" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
