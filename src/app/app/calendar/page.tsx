"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc, collection, doc, getDocs, query, serverTimestamp, Timestamp, updateDoc, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { cn } from "@/lib/utils";
import { t } from "@/lib/tokens";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X, Pencil, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Staff = { id: string; name: string; isActive: boolean };
type Service = { id: string; name: string; durationMinutes: number; price: number; isActive?: boolean };
type Customer = { id: string; name: string; phone?: string | null; email?: string | null; notes?: string | null };
type Pet = { id: string; name: string; breed?: string | null; weightKg?: number | null; notes?: string | null };

type BookingStatus = "confirmed" | "canceled" | "completed" | "no_show";
type BookingSource = "manual" | "marketplace";

type Booking = {
  id: string;
  source: BookingSource;
  status: BookingStatus;
  serviceId: string;
  serviceSnapshot: { name: string; durationMinutes: number; price: number };
  staffId: string;
  staffNameSnapshot: string;
  customerId?: string | null;
  customerSnapshot: {
    name: string; phone?: string | null; email?: string | null; notes?: string | null;
    pet?: { id: string; name: string; breed?: string | null; weightKg?: number | null } | null;
  };
  startAt: Timestamp;
  endAt: Timestamp;
  price: number;
  currency: string;
  notes?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  canceledAt?: Timestamp | null;
  cancelReason?: "client" | "salon" | null;
};

function pad2(n: number) { return n.toString().padStart(2, "0"); }
function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function weekdayKey(dateISO: string) { const d = new Date(dateISO + "T00:00:00"); return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][d.getDay()]; }
function dateISOToLocalDate(dateISO: string) { return new Date(dateISO + "T00:00:00"); }
function hhmmFromDate(d: Date) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function minutesFromHHMM(hhmm: string) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function hhmmFromMinutes(min: number) { const h = Math.floor(min / 60); const m = min % 60; return `${pad2(h)}:${pad2(m)}`; }
function startOfDay(dateISO: string) { const d = dateISOToLocalDate(dateISO); d.setHours(0, 0, 0, 0); return d; }
function endOfDay(dateISO: string) { const d = dateISOToLocalDate(dateISO); d.setHours(23, 59, 59, 999); return d; }
function overlaps(aS: Date, aE: Date, bS: Date, bE: Date) { return aS < bE && aE > bS; }

type WorkHours = Record<string, { start: string; end: string } | null>;

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: "bg-[#E4EEF6] text-[#4A7EA8]",
  completed: "bg-[#E8EFE7] text-[#4A7A4A]",
  canceled: "bg-[#F0D8D3] text-[#A04040]",
  no_show: "bg-[#F5EFE6] text-[#A8998C]",
};

export default function CalendarPage() {
  const { salon, loading: salonLoading } = useSalon();
  const [date, setDate] = useState(todayISO());
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffId, setStaffId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingAtHHMM, setCreatingAtHHMM] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [petId, setPetId] = useState("");
  const [petsForCustomer, setPetsForCustomer] = useState<Pet[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [editStaffId, setEditStaffId] = useState("");
  const [editServiceId, setEditServiceId] = useState("");
  const [editStartHHMM, setEditStartHHMM] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const currency = useMemo(() => { const c = (salon as any)?.settings?.currency; return typeof c === "string" && c.length > 0 ? c : "EUR"; }, [salon]);
  const slotDuration = useMemo(() => { const v = (salon as any)?.settings?.slotDuration; return typeof v === "number" && v > 0 ? v : 30; }, [salon]);
  const workHours: WorkHours = useMemo(() => {
    const wh = (salon as any)?.settings?.workHours;
    const fallback: WorkHours = { mon: { start: "10:00", end: "19:00" }, tue: { start: "10:00", end: "19:00" }, wed: { start: "10:00", end: "19:00" }, thu: { start: "10:00", end: "19:00" }, fri: { start: "10:00", end: "19:00" }, sat: { start: "10:00", end: "16:00" }, sun: null };
    return (wh as WorkHours) ?? fallback;
  }, [salon]);

  const dayHours = useMemo(() => { const key = weekdayKey(date); return workHours[key] ?? null; }, [date, workHours]);
  const activeStaff = useMemo(() => staff.filter((s) => s.isActive), [staff]);
  const timeSlots = useMemo(() => {
    if (!dayHours) return [];
    const start = minutesFromHHMM(dayHours.start); const end = minutesFromHHMM(dayHours.end);
    const out: { hhmm: string }[] = [];
    for (let t = start; t + slotDuration <= end; t += slotDuration) out.push({ hhmm: hhmmFromMinutes(t) });
    return out;
  }, [dayHours, slotDuration]);

  const bookingsForSelected = useMemo(() => {
    if (!staffId) return [];
    return bookings.filter((b) => b.staffId === staffId && b.status !== "canceled").sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
  }, [bookings, staffId]);

  function slotDateRange(hhmm: string) {
    const base = dateISOToLocalDate(date); const [h, m] = hhmm.split(":").map(Number);
    const start = new Date(base); start.setHours(h, m, 0, 0);
    const end = new Date(start); end.setMinutes(end.getMinutes() + slotDuration);
    return { start, end };
  }

  function isSlotTaken(hhmm: string) {
    const { start, end } = slotDateRange(hhmm);
    return bookingsForSelected.some((b) => overlaps(start, end, b.startAt.toDate(), b.endAt.toDate()));
  }

  function resetCreateForm() { setServiceId(""); setCustomerId(""); setPetId(""); setPetsForCustomer([]); setNotes(""); }

  async function loadBaseData() {
    if (!salon) return;
    const staffSnap = await getDocs(collection(db, "salons", salon.id, "staff"));
    const staffData: Staff[] = staffSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Staff, "id">) }));
    staffData.sort((a, b) => a.name.localeCompare(b.name));
    setStaff(staffData);
    const first = staffData.find((s) => s.isActive);
    if (!staffId && first) setStaffId(first.id);
    const servSnap = await getDocs(collection(db, "salons", salon.id, "services"));
    const servData: Service[] = servSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }));
    servData.sort((a, b) => a.name.localeCompare(b.name));
    setServices(servData);
    const custSnap = await getDocs(collection(db, "salons", salon.id, "customers"));
    const custData: Customer[] = custSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Customer, "id">) }));
    custData.sort((a, b) => a.name.localeCompare(b.name));
    setCustomers(custData);
  }

  async function loadBookingsForDay() {
    if (!salon) return;
    setLoading(true);
    const from = Timestamp.fromDate(startOfDay(date)); const to = Timestamp.fromDate(endOfDay(date));
    const snap = await getDocs(query(collection(db, "salons", salon.id, "bookings"), where("startAt", ">=", from), where("startAt", "<=", to)));
    setBookings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) })));
    setLoading(false);
  }

  useEffect(() => { if (salon) loadBaseData(); }, [salon]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (salon) loadBookingsForDay(); }, [salon, date]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    (async () => {
      if (!salon || !customerId) { setPetsForCustomer([]); setPetId(""); return; }
      const snap = await getDocs(collection(db, "salons", salon.id, "customers", customerId, "pets"));
      const data: Pet[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Pet, "id">) }));
      data.sort((a, b) => a.name.localeCompare(b.name));
      setPetsForCustomer(data); setPetId("");
    })();
  }, [salon, customerId]);

  async function createBooking() {
    if (!salon || !creatingAtHHMM || !staffId || !serviceId) return;
    const svc = services.find((s) => s.id === serviceId); if (!svc) return;
    const base = dateISOToLocalDate(date); const [h, m] = creatingAtHHMM.split(":").map(Number);
    const start = new Date(base); start.setHours(h, m, 0, 0);
    const end = new Date(start); end.setMinutes(end.getMinutes() + svc.durationMinutes);
    if (!dayHours) return;
    const startMin = start.getHours() * 60 + start.getMinutes(); const endMin = end.getHours() * 60 + end.getMinutes();
    if (startMin < minutesFromHHMM(dayHours.start) || endMin > minutesFromHHMM(dayHours.end)) return;
    if (bookingsForSelected.some((b) => overlaps(start, end, b.startAt.toDate(), b.endAt.toDate()))) return;
    const staffObj = staff.find((s) => s.id === staffId);
    const customerObj = customerId ? customers.find((c) => c.id === customerId) : null;
    const petObj = petId ? petsForCustomer.find((p) => p.id === petId) : null;
    const customerSnapshot: Booking["customerSnapshot"] = customerObj
      ? { name: customerObj.name, phone: customerObj.phone ?? null, email: customerObj.email ?? null, notes: customerObj.notes ?? null, pet: petObj ? { id: petObj.id, name: petObj.name, breed: petObj.breed ?? null, weightKg: petObj.weightKg ?? null } : null }
      : { name: "Walk-in", phone: null, email: null, notes: null, pet: null };
    setSaving(true);
    const now = serverTimestamp();
    await addDoc(collection(db, "salons", salon.id, "bookings"), {
      source: "manual", status: "confirmed",
      serviceId, serviceSnapshot: { name: svc.name, durationMinutes: svc.durationMinutes, price: svc.price },
      staffId, staffNameSnapshot: staffObj?.name ?? "Staff",
      customerId: customerObj ? customerId : null, customerSnapshot,
      startAt: Timestamp.fromDate(start), endAt: Timestamp.fromDate(end),
      price: svc.price, currency,
      notes: notes.trim() || null,
      createdAt: now, updatedAt: now, canceledAt: null, cancelReason: null,
    });
    setSaving(false); setCreatingAtHHMM(null); resetCreateForm();
    await loadBookingsForDay();
  }

  async function saveEdit() {
    if (!salon || !editing) return;
    const svc = services.find((s) => s.id === editServiceId); const staffObj = staff.find((s) => s.id === editStaffId);
    if (!svc || !staffObj) return;
    const base = dateISOToLocalDate(date); const [h, m] = editStartHHMM.split(":").map(Number);
    const start = new Date(base); start.setHours(h, m, 0, 0);
    const end = new Date(start); end.setMinutes(end.getMinutes() + svc.durationMinutes);
    if (!dayHours) return;
    const startMin = start.getHours() * 60 + start.getMinutes(); const endMin = end.getHours() * 60 + end.getMinutes();
    if (startMin < minutesFromHHMM(dayHours.start) || endMin > minutesFromHHMM(dayHours.end)) { alert("Does not fit into work hours"); return; }
    if (bookings.filter((b) => b.id !== editing.id && b.status !== "canceled" && b.staffId === editStaffId).some((b) => overlaps(start, end, b.startAt.toDate(), b.endAt.toDate()))) { alert("Time conflict"); return; }
    setEditSaving(true);
    await updateDoc(doc(db, "salons", salon.id, "bookings", editing.id), {
      staffId: editStaffId, staffNameSnapshot: staffObj.name,
      serviceId: editServiceId, serviceSnapshot: { name: svc.name, durationMinutes: svc.durationMinutes, price: svc.price },
      startAt: Timestamp.fromDate(start), endAt: Timestamp.fromDate(end),
      price: svc.price, notes: editNotes.trim() || null, updatedAt: serverTimestamp(),
    });
    setEditSaving(false); setEditing(null);
    await loadBookingsForDay();
  }

  async function cancelBooking(b: Booking, reason: "client" | "salon") {
    if (!salon) return;
    await updateDoc(doc(db, "salons", salon.id, "bookings", b.id), { status: "canceled", canceledAt: serverTimestamp(), cancelReason: reason, updatedAt: serverTimestamp() });
    await loadBookingsForDay();
  }

  async function setBookingStatus(b: Booking, status: BookingStatus) {
    if (!salon) return;
    const patch: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
    if (status !== "canceled") { patch.canceledAt = null; patch.cancelReason = null; }
    await updateDoc(doc(db, "salons", salon.id, "bookings", b.id), patch);
    await loadBookingsForDay();
  }

  function shiftDate(days: number) {
    const d = dateISOToLocalDate(date); d.setDate(d.getDate() + days);
    setDate(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
  }

  if (salonLoading) return null;

  const friendlyDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const isToday = date === todayISO();

  return (
    <div className="max-w-5xl space-y-6">
      {/* Date nav bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Card padding="sm" className="flex-row items-center gap-1 p-1">
          <button
            onClick={() => shiftDate(-1)}
            className="w-8 h-8 rounded-[14px] flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm font-semibold text-foreground outline-none px-2 cursor-pointer" />
          <button
            onClick={() => shiftDate(1)}
            className="w-8 h-8 rounded-[14px] flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </Card>
        <span className="text-sm text-muted-foreground">{friendlyDate}</span>
        {isToday && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[--color-secondary]/20 text-[color:var(--color-secondary)]">Today</span>
        )}
        <div className="flex-1" />
        {/* Staff selector */}
        {activeStaff.length > 0 && (
          <Card padding="sm" className="flex-row items-center gap-2 px-4 py-2">
            <span className="text-xs text-muted-foreground">Staff</span>
            <select value={staffId} onChange={(e) => setStaffId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer">
              {activeStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Card>
        )}
      </div>

      {/* Closed day */}
      {!dayHours && (
        <Card className="p-16 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-muted">
            <CalendarDays size={28} strokeWidth={1.5} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">The salon is resting today.</p>
            <p className="text-sm mt-1 text-muted-foreground">This day is marked as closed in your settings.</p>
          </div>
        </Card>
      )}

      {!!dayHours && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Time slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Time slots · {dayHours.start}–{dayHours.end}
              </p>
              <span className="text-[11px] text-muted-foreground">{slotDuration} min slots</span>
            </div>

            <div className="space-y-2">
              {timeSlots.map((slot) => {
                const taken = isSlotTaken(slot.hhmm);
                const isCreating = creatingAtHHMM === slot.hhmm;
                return (
                  <div key={slot.hhmm}>
                    <Card
                      className={cn(
                        "flex-row items-center justify-between px-5 py-3",
                        taken && "opacity-60",
                        isCreating && "ring-2 ring-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={13} className={taken ? "text-muted-foreground/50" : "text-primary"} />
                        <span className="text-sm font-semibold text-foreground">{slot.hhmm}</span>
                        {taken && <span className="text-[11px] ml-1 text-muted-foreground">Busy</span>}
                      </div>
                      {!taken && !isCreating && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setCreatingAtHHMM(slot.hhmm)}
                        >
                          Book
                        </Button>
                      )}
                      {isCreating && (
                        <button
                          onClick={() => { setCreatingAtHHMM(null); resetCreateForm(); }}
                          className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center cursor-pointer"
                        >
                          <X size={11} className="text-destructive" />
                        </button>
                      )}
                    </Card>

                    {/* Inline create form */}
                    {isCreating && (
                      <Card className="mt-2 ml-2 p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-sm font-semibold text-foreground">New booking at {creatingAtHHMM}</p>
                        <div className="space-y-2">
                          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm outline-none cursor-pointer appearance-none"
                            style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }}>
                            <option value="">Select a service</option>
                            {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.durationMinutes}m · {s.price} {currency}</option>)}
                          </select>
                          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm outline-none cursor-pointer appearance-none"
                            style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }}>
                            <option value="">Walk-in (no customer)</option>
                            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          {customerId && (
                            <select value={petId} onChange={(e) => setPetId(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm outline-none cursor-pointer appearance-none"
                              style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }}>
                              <option value="">No pet selected</option>
                              {petsForCustomer.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          )}
                          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                            className="w-full px-4 py-2.5 text-sm outline-none resize-none"
                            style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }} />
                        </div>
                        <div className="flex gap-2">
                          <Button loading={saving} disabled={saving || !serviceId} onClick={createBooking} size="sm">
                            <Check size={12} />{saving ? "Saving…" : "Create booking"}
                          </Button>
                          <Button variant="ghost" size="sm" disabled={saving} onClick={() => { setCreatingAtHHMM(null); resetCreateForm(); }}>
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Bookings */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Appointments</p>

            {/* Edit panel */}
            {editing && (
              <Card className="p-5 space-y-3 animate-in fade-in duration-200">
                <p className="text-sm font-semibold text-foreground">Edit booking</p>
                <div className="space-y-2">
                  <select value={editStaffId} onChange={(e) => setEditStaffId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm outline-none cursor-pointer appearance-none"
                    style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }}>
                    {activeStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={editServiceId} onChange={(e) => setEditServiceId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm outline-none cursor-pointer appearance-none"
                    style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }}>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.durationMinutes}m</option>)}
                  </select>
                  <select value={editStartHHMM} onChange={(e) => setEditStartHHMM(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm outline-none cursor-pointer appearance-none"
                    style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }}>
                    {timeSlots.map((slot) => <option key={slot.hhmm} value={slot.hhmm}>{slot.hhmm}</option>)}
                  </select>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 text-sm outline-none resize-none"
                    style={{ borderRadius: `${t.radius.sm}px`, background: t.colors.component.input.bg, color: t.colors.component.input.text }} />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" loading={editSaving} disabled={editSaving} onClick={saveEdit} size="sm">
                    <Check size={12} />{editSaving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button variant="ghost" size="sm" disabled={editSaving} onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {loading && (
              <Card className="px-5 py-6 text-sm text-center text-muted-foreground animate-pulse">
                Loading appointments…
              </Card>
            )}

            {!loading && bookingsForSelected.length === 0 && (
              <Card className="p-12 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-[16px] bg-muted">
                  <CalendarDays size={22} strokeWidth={1.5} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">A quiet day ahead.</p>
                <p className="text-xs text-muted-foreground">No appointments booked yet. Pick a time slot on the left to get started.</p>
              </Card>
            )}

            <div className="space-y-3">
              {bookingsForSelected.map((b) => {
                const start = hhmmFromDate(b.startAt.toDate());
                const end = hhmmFromDate(b.endAt.toDate());
                return (
                  <Card key={b.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          {start}–{end} · {b.serviceSnapshot?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.customerSnapshot?.name}
                          {b.customerSnapshot?.pet?.name ? ` · ${b.customerSnapshot.pet.name}` : ""}
                          {" · "}{b.price} {b.currency}
                        </p>
                        {b.notes && <p className="text-xs text-muted-foreground/70">{b.notes}</p>}
                      </div>
                      <span
                        className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap", STATUS_STYLES[b.status])}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
                      {b.status === "confirmed" && (
                        <>
                          <ActionBtn onClick={() => { setEditing(b); setEditStaffId(b.staffId); setEditServiceId(b.serviceId); setEditStartHHMM(hhmmFromDate(b.startAt.toDate())); setEditNotes(b.notes ?? ""); }} icon={<Pencil size={11} />} label="Edit" color="blue" />
                          <ActionBtn onClick={() => setBookingStatus(b, "completed")} label="Complete" color="green" />
                          <ActionBtn onClick={() => setBookingStatus(b, "no_show")} label="No show" color="neutral" />
                          <ActionBtn onClick={() => cancelBooking(b, "salon")} label="Cancel" color="red" />
                        </>
                      )}
                      {(b.status === "completed" || b.status === "no_show") && (
                        <>
                          <ActionBtn onClick={() => setBookingStatus(b, "confirmed")} label="Reopen" color="green" />
                          <ActionBtn onClick={() => cancelBooking(b, "salon")} label="Cancel" color="red" />
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, label, icon, color }: { onClick: () => void; label: string; icon?: React.ReactNode; color: "blue" | "green" | "red" | "neutral" }) {
  const colors = {
    blue: "bg-[#E4EEF6] text-[#4A7EA8] hover:bg-[#D4E4F0]",
    green: "bg-[#E8EFE7] text-[#4A7A4A] hover:bg-[#D8E8D4]",
    red: "bg-[#F0D8D3] text-[#A04040] hover:bg-[#E8CCCC]",
    neutral: "bg-[#F5EFE6] text-[#7A655A] hover:bg-[#EDE4D8]",
  };
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer", colors[color])}
    >
      {icon}{label}
    </button>
  );
}
