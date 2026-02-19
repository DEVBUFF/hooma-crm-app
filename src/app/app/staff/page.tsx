"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { cn } from "@/lib/utils";
import { UserRound, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type StaffRole = "admin" | "groomer";

type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  phone?: string | null;
  isActive: boolean;
};

const roleColors: Record<StaffRole, string> = {
  groomer: "bg-[#E4EEF6] text-[#4A7EA8]",
  admin: "bg-[#E8EFE7] text-[#4A7A4A]",
};

export default function StaffPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
    data.sort((a, b) => Number(b.isActive) - Number(a.isActive));
    setItems(data);
    setLoading(false);
  }, [salon]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  async function addStaff() {
    if (!salon || !canSubmit) return;
    await addDoc(collection(db, "salons", salon.id, "staff"), {
      name: name.trim(),
      phone: phone.trim() || null,
      role,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    setName(""); setPhone(""); setRole("groomer");
    setShowForm(false);
    loadStaff();
  }

  async function removeStaff(id: string) {
    await deleteDoc(doc(db, "salons", salon!.id, "staff", id));
    loadStaff();
  }

  async function toggleActive(staff: Staff) {
    await updateDoc(doc(db, "salons", salon!.id, "staff", staff.id), { isActive: !staff.isActive });
    loadStaff();
  }

  if (salonLoading) return null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#A8998C] uppercase tracking-widest mb-1">Care team</p>
          <p className="text-[#7A655A] text-sm">The wonderful people behind every appointment.</p>
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
          Add member
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-[24px] bg-[#EDE4D8] shadow-[0_4px_24px_rgba(62,47,42,0.08)] p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="font-semibold text-[#3E2F2A]">Welcome a new team member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              className="col-span-full rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none focus:ring-2 focus:ring-[#7FA6C9]/30" />
            <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none focus:ring-2 focus:ring-[#7FA6C9]/30" />
            <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}
              className="rounded-[14px] bg-[#F5EFE6] px-4 py-3 text-sm text-[#3E2F2A] outline-none cursor-pointer appearance-none">
              <option value="groomer">Groomer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={addStaff} disabled={!canSubmit}
              className="px-6 py-2.5 rounded-full bg-[#7FA6C9] text-white text-sm font-semibold disabled:opacity-40 cursor-pointer hover:bg-[#6A92B8] transition-colors">
              Add member
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
          <div className="w-16 h-16 rounded-[20px] bg-[#E8EFE7] flex items-center justify-center">
            <UserRound size={28} strokeWidth={1.5} className="text-[#6FA88A]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#3E2F2A]">Start building your care team.</p>
            <p className="text-sm text-[#A8998C] mt-1 max-w-xs">
              Add groomers and admins who show up for pets every single day.
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="mt-2 px-6 py-2.5 rounded-full bg-[#7FA6C9] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(127,166,201,0.25)] hover:shadow-[0_4px_20px_rgba(127,166,201,0.35)] transition-all cursor-pointer">
            Add your first team member
          </button>
        </div>
      )}

      {/* Staff grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((s) => (
            <div key={s.id}
              className={cn(
                "group relative rounded-[22px] bg-[#EDE4D8] shadow-[0_2px_16px_rgba(62,47,42,0.07)] p-5",
                "hover:shadow-[0_4px_24px_rgba(62,47,42,0.1)] transition-all",
                !s.isActive && "opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-[#7FA6C9]/15 flex items-center justify-center text-sm font-bold text-[#7FA6C9] shrink-0">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3E2F2A] text-sm">{s.name}</p>
                  {s.phone && <p className="text-xs text-[#A8998C]">{s.phone}</p>}
                  <span className={cn("inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize", roleColors[s.role])}>
                    {s.role}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-[#DDD4C4]/60">
                <button onClick={() => toggleActive(s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium text-[#7A655A] bg-[#F5EFE6] hover:bg-[#EDE4D8] transition-colors cursor-pointer">
                  {s.isActive ? <ToggleRight size={13} className="text-[#A8BBA3]" /> : <ToggleLeft size={13} />}
                  {s.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => removeStaff(s.id)}
                  className="w-8 h-8 rounded-xl bg-[#F5EFE6] flex items-center justify-center cursor-pointer hover:bg-[#F0D8D3] transition-colors">
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
