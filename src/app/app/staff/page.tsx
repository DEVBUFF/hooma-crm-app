"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { t } from "@/lib/tokens";
import { UserRound, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StaffRole = "admin" | "groomer";

type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  phone?: string | null;
  isActive: boolean;
};

const roleStyle: Record<StaffRole, React.CSSProperties> = {
  groomer: { background: t.colors.semantic.infoBg, color: t.colors.semantic.info },
  admin: { background: t.colors.semantic.successBg, color: t.colors.semantic.success },
};

const inputStyle: React.CSSProperties = {
  background: t.colors.semantic.bg,
  color: t.colors.semantic.text,
  borderRadius: `${t.radius.sm}px`,
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
          <p
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: t.colors.semantic.textSubtle }}
          >
            Care team
          </p>
          <p className="text-sm" style={{ color: t.colors.semantic.textMuted }}>
            The wonderful people behind every appointment.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="gap-2"
        >
          <Plus size={16} />
          Add member
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle>Welcome a new team member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
                className="col-span-full px-4 py-3 text-sm outline-none" style={inputStyle} />
              <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="px-4 py-3 text-sm outline-none" style={inputStyle} />
              <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}
                className="px-4 py-3 text-sm outline-none cursor-pointer appearance-none"
                style={inputStyle}
              >
                <option value="groomer">Groomer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={addStaff} disabled={!canSubmit}>Add member</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !showForm && (
        <Card className="p-16 flex flex-col items-center text-center gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: t.colors.semantic.successBg, borderRadius: `${t.radius.lg}px` }}
          >
            <UserRound size={28} strokeWidth={1.5} style={{ color: t.colors.semantic.successStrong }} />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Start building your care team.
            </p>
            <p className="text-sm mt-1 max-w-xs text-muted-foreground">
              Add groomers and admins who show up for pets every single day.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="mt-2">
            Add your first team member
          </Button>
        </Card>
      )}

      {/* Staff grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((s) => (
            <Card
              key={s.id}
              interactive
              className={`group relative p-5 transition-all ${!s.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: t.colors.semantic.primaryTint, color: t.colors.semantic.primary }}
                >
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{s.name}</p>
                  {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
                  <span
                    className="inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-md capitalize"
                    style={roleStyle[s.role]}
                  >
                    {s.role}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div
                className="flex gap-2 mt-4 pt-3 border-t"
                style={{ borderColor: `${t.colors.semantic.divider}99` }}
              >
                <button onClick={() => toggleActive(s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  style={{ background: t.colors.semantic.bg, color: t.colors.semantic.textMuted }}
                >
                  {s.isActive
                    ? <ToggleRight size={13} style={{ color: t.colors.semantic.successAccent }} />
                    : <ToggleLeft size={13} />
                  }
                  {s.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => removeStaff(s.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: t.colors.semantic.bg }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = t.colors.semantic.errorBg }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = t.colors.semantic.bg }}
                >
                  <Trash2 size={13} style={{ color: t.colors.semantic.error }} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
