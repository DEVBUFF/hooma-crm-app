"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc, collection, doc, getDocs, query, serverTimestamp, Timestamp, updateDoc, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X, Pencil, Check } from "lucide-react";

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
        <div className="flex items-center gap-1 bg-[#EDE4D8] rounded-[18px] p-1 shadow-[0_2px_12px_rgba(62,47,42,0.07)]">
          <button onClick={() => shiftDate(-1)} className="w-8 h-8 rounded-[14px] flex items-center justify-center hover:bg-[#DDD4C4] transition-colors cursor-pointer">
            <ChevronLeft size={16} className="text-[#7A655A]" />
          </button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm font-semibold text-[#3E2F2A] outline-none px-2 cursor-pointer" />
          <button onClick={() => shiftDate(1)} className="w-8 h-8 rounded-[14px] flex items-center justify-center hover:bg-[#DDD4C4] transition-colors cursor-pointer">
            <ChevronRight size={16} className="text-[#7A655A]" />
          </button>
        </div>
        <span className="text-sm text-[#7A655A]">{friendlyDate}</span>
        {isToday && <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8EFE7] text-[#5A8A6A]">Today</span>}
        <div className="flex-1" />
        {/* Staff selector */}
        {activeStaff.length > 0 && (
          <div className="flex items-center gap-2 bg-[#EDE4D8] rounded-[18px] px-4 py-2 shadow-[0_2px_12px_rgba(62,47,42,0.07)]">
            <span className="text-xs text-[#A8998C]">Staff</span>
            <select value={staffId} onChange={(e) => setStaffId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#3E2F2A] outline-none cursor-pointer">
              {activeStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Closed day */}
      {!dayHours && (
        <div className="rounded-[28px] bg-[#EDE4D8] shadow-[0_4px_24px_rgba(62,47,42,0.06)] p-16 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-[#F5EFE6] flex items-center justify-center">
            <CalendarDays size={28} strokeWidth={1.5} className="text-[#7FA6C9]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#3E2F2A]">The salon is resting today.</p>
            <p className="text-sm text-[#A8998C] mt-1">This day is marked as closed in your settings.</p>
          </div>
        </div>
      )}

      {!!dayHours && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Time slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#A8998C] uppercase tracking-widest">
                Time slots · {dayHours.start}–{dayHours.end}
              </p>
              <span className="text-[11px] text-[#B5A396]">{slotDuration} min slots</span>
            </div>

            <div className="space-y-2">
              {timeSlots.map((t) => {
                const taken = isSlotTaken(t.hhmm);
                const isCreating = creatingAtHHMM === t.hhmm;
                return (
                  <div key={t.hhmm}>
                    <div className={cn(
                      "flex items-center justify-between px-5 py-3 rounded-[16px] transition-all",
                      taken ? "bg-[#EDE4D8]/60 opacity-60" : "bg-[#EDE4D8] shadow-[0_2px_10px_rgba(62,47,42,0.06)]",
                      isCreating && "ring-2 ring-[#7FA6C9]/40"
                    )}>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className={taken ? "text-[#C8B9AF]" : "text-[#7FA6C9]"} />
                        <span className="text-sm font-semibold text-[#3E2F2A]">{t.hhmm}</span>
                        {taken && <span className="text-[11px] text-[#B5A396] ml-1">Busy</span>}
                      </div>
                      {!taken && !isCreating && (
                        <button onClick={() => setCreatingAtHHMM(t.hhmm)}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-[#7FA6C9] text-white cursor-pointer hover:bg-[#6A92B8] transition-colors shadow-[0_1px_6px_rgba(127,166,201,0.2)]">
                          Book
                        </button>
                      )}
                      {isCreating && (
                        <button onClick={() => { setCreatingAtHHMM(null); resetCreateForm(); }}
                          className="w-6 h-6 rounded-full bg-[#F0D8D3] flex items-center justify-center cursor-pointer">
                          <X size={11} className="text-[#C4605A]" />
                        </button>
                      )}
                    </div>

                    {/* Inline create form */}
                    {isCreating && (
                      <div className="mt-2 ml-2 rounded-[18px] bg-[#EDE4D8] shadow-[0_4px_20px_rgba(62,47,42,0.09)] p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-sm font-semibold text-[#3E2F2A]">New booking at {creatingAtHHMM}</p>
                        <div className="space-y-2">
                          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}
                            className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none cursor-pointer appearance-none">
                            <option value="">Select a service</option>
                            {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.durationMinutes}m · {s.price} {currency}</option>)}
                          </select>
                          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none cursor-pointer appearance-none">
                            <option value="">Walk-in (no customer)</option>
                            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          {customerId && (
                            <select value={petId} onChange={(e) => setPetId(e.target.value)}
                              className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none cursor-pointer appearance-none">
                              <option value="">No pet selected</option>
                              {petsForCustomer.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          )}
                          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                            className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] placeholder:text-[#B5A396] outline-none resize-none" />
                        </div>
                        <div className="flex gap-2">
                          <button disabled={saving || !serviceId} onClick={createBooking}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#7FA6C9] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer hover:bg-[#6A92B8] transition-colors">
                            <Check size={12} />{saving ? "Saving…" : "Create booking"}
                          </button>
                          <button disabled={saving} onClick={() => { setCreatingAtHHMM(null); resetCreateForm(); }}
                            className="px-5 py-2 rounded-full bg-[#F5EFE6] text-[#7A655A] text-xs font-medium cursor-pointer hover:bg-[#EDE4D8] transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Bookings */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#A8998C] uppercase tracking-widest">Appointments</p>

            {/* Edit panel */}
            {editing && (
              <div className="rounded-[18px] bg-[#EDE4D8] shadow-[0_4px_20px_rgba(62,47,42,0.09)] p-5 space-y-3 animate-in fade-in duration-200">
                <p className="text-sm font-semibold text-[#3E2F2A]">Edit booking</p>
                <div className="space-y-2">
                  <select value={editStaffId} onChange={(e) => setEditStaffId(e.target.value)}
                    className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none cursor-pointer appearance-none">
                    {activeStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={editServiceId} onChange={(e) => setEditServiceId(e.target.value)}
                    className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none cursor-pointer appearance-none">
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.durationMinutes}m</option>)}
                  </select>
                  <select value={editStartHHMM} onChange={(e) => setEditStartHHMM(e.target.value)}
                    className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none cursor-pointer appearance-none">
                    {timeSlots.map((t) => <option key={t.hhmm} value={t.hhmm}>{t.hhmm}</option>)}
                  </select>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2}
                    className="w-full rounded-[12px] bg-[#F5EFE6] px-4 py-2.5 text-sm text-[#3E2F2A] outline-none resize-none" />
                </div>
                <div className="flex gap-2">
                  <button disabled={editSaving} onClick={saveEdit}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#A8BBA3] text-white text-xs font-semibold cursor-pointer hover:bg-[#96A990] transition-colors disabled:opacity-40">
                    <Check size={12} />{editSaving ? "Saving…" : "Save changes"}
                  </button>
                  <button disabled={editSaving} onClick={() => setEditing(null)}
                    className="px-5 py-2 rounded-full bg-[#F5EFE6] text-[#7A655A] text-xs font-medium cursor-pointer hover:bg-[#EDE4D8] transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="rounded-[20px] bg-[#EDE4D8] px-5 py-6 text-sm text-[#A8998C] text-center animate-pulse">
                Loading appointments…
              </div>
            )}

            {!loading && bookingsForSelected.length === 0 && (
              <div className="rounded-[28px] bg-[#EDE4D8] shadow-[0_4px_24px_rgba(62,47,42,0.06)] p-12 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-[16px] bg-[#F5EFE6] flex items-center justify-center">
                  <CalendarDays size={22} strokeWidth={1.5} className="text-[#7FA6C9]" />
                </div>
                <p className="text-sm font-semibold text-[#3E2F2A]">A quiet day ahead.</p>
                <p className="text-xs text-[#A8998C]">No appointments booked yet. Pick a time slot on the left to get started.</p>
              </div>
            )}

            <div className="space-y-3">
              {bookingsForSelected.map((b) => {
                const start = hhmmFromDate(b.startAt.toDate());
                const end = hhmmFromDate(b.endAt.toDate());
                return (
                  <div key={b.id} className="rounded-[20px] bg-[#EDE4D8] shadow-[0_2px_12px_rgba(62,47,42,0.07)] p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[#3E2F2A]">
                          {start}–{end} · {b.serviceSnapshot?.name}
                        </p>
                        <p className="text-xs text-[#7A655A]">
                          {b.customerSnapshot?.name}
                          {b.customerSnapshot?.pet?.name ? ` · ${b.customerSnapshot.pet.name}` : ""}
                          {" · "}{b.price} {b.currency}
                        </p>
                        {b.notes && <p className="text-xs text-[#A8998C]">{b.notes}</p>}
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap", STATUS_STYLES[b.status])}>
                        {b.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#DDD4C4]/50">
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
                  </div>
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
    <button onClick={onClick}
      className={cn("flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer", colors[color])}>
      {icon}{label}
    </button>
  );
}
