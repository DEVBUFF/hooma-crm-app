"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";

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
  serviceSnapshot: {
    name: string;
    durationMinutes: number;
    price: number;
  };

  staffId: string;
  staffNameSnapshot: string;

  customerId?: string | null;
  customerSnapshot: {
    name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    pet?: {
      id: string;
      name: string;
      breed?: string | null;
      weightKg?: number | null;
    } | null;
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

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function weekdayKey(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  const day = d.getDay(); // 0..6
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][day];
}

function dateISOToLocalDate(dateISO: string) {
  return new Date(dateISO + "T00:00:00");
}

function hhmmFromDate(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function minutesFromHHMM(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function hhmmFromMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function startOfDay(dateISO: string) {
  const d = dateISOToLocalDate(dateISO);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(dateISO: string) {
  const d = dateISOToLocalDate(dateISO);
  d.setHours(23, 59, 59, 999);
  return d;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

type WorkHours = Record<string, { start: string; end: string } | null>;

export default function CalendarPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [date, setDate] = useState(todayISO());

  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffId, setStaffId] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // create booking panel
  const [creatingAtHHMM, setCreatingAtHHMM] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [petId, setPetId] = useState("");
  const [petsForCustomer, setPetsForCustomer] = useState<Pet[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // edit booking panel
  const [editing, setEditing] = useState<Booking | null>(null);
  const [editStaffId, setEditStaffId] = useState("");
  const [editServiceId, setEditServiceId] = useState("");
  const [editStartHHMM, setEditStartHHMM] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const currency = useMemo(() => {
    const c = salon?.settings?.currency;
    return typeof c === "string" && c.length > 0 ? c : "EUR";
  }, [salon]);

  const slotDuration = useMemo(() => {
    const v = salon?.settings?.slotDuration;
    return typeof v === "number" && v > 0 ? v : 30;
  }, [salon]);

  const workHours: WorkHours = useMemo(() => {
    const wh = salon?.settings?.workHours;
    const fallback: WorkHours = {
      mon: { start: "10:00", end: "19:00" },
      tue: { start: "10:00", end: "19:00" },
      wed: { start: "10:00", end: "19:00" },
      thu: { start: "10:00", end: "19:00" },
      fri: { start: "10:00", end: "19:00" },
      sat: { start: "10:00", end: "16:00" },
      sun: null,
    };
    return (wh as WorkHours) ?? fallback;
  }, [salon]);

  const dayHours = useMemo(() => {
    const key = weekdayKey(date);
    return workHours[key] ?? null;
  }, [date, workHours]);

  const activeStaff = useMemo(() => staff.filter((s) => s.isActive), [staff]);

  const timeSlots = useMemo(() => {
    if (!dayHours) return [];
    const start = minutesFromHHMM(dayHours.start);
    const end = minutesFromHHMM(dayHours.end);

    const out: { hhmm: string }[] = [];
    for (let t = start; t + slotDuration <= end; t += slotDuration) {
      out.push({ hhmm: hhmmFromMinutes(t) });
    }
    return out;
  }, [dayHours, slotDuration]);

  const bookingsForSelected = useMemo(() => {
    if (!staffId) return [];
    return bookings
      .filter((b) => b.staffId === staffId && b.status !== "canceled")
      .sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
  }, [bookings, staffId]);

  function slotDateRange(hhmm: string) {
    const base = dateISOToLocalDate(date);
    const [h, m] = hhmm.split(":").map(Number);
    const start = new Date(base);
    start.setHours(h, m, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + slotDuration);
    return { start, end };
  }

  function isSlotTaken(hhmm: string) {
    const { start, end } = slotDateRange(hhmm);
    return bookingsForSelected.some((b) =>
      overlaps(start, end, b.startAt.toDate(), b.endAt.toDate())
    );
  }

  function resetCreateForm() {
    setServiceId("");
    setCustomerId("");
    setPetId("");
    setPetsForCustomer([]);
    setNotes("");
  }

  function makeDateFromHHMM(dateISO: string, hhmm: string) {
  const base = dateISOToLocalDate(dateISO);
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

  async function loadBaseData() {
    if (!salon) return;

    // staff
    const staffRef = collection(db, "salons", salon.id, "staff");
    const staffSnap = await getDocs(staffRef);
    const staffData: Staff[] = staffSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    staffData.sort((a, b) => a.name.localeCompare(b.name));
    setStaff(staffData);

    const first = staffData.find((s) => s.isActive);
    if (!staffId && first) setStaffId(first.id);

    // services
    const servicesRef = collection(db, "salons", salon.id, "services");
    const servicesSnap = await getDocs(servicesRef);
    const servicesData: Service[] = servicesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    servicesData.sort((a, b) => a.name.localeCompare(b.name));
    setServices(servicesData);

    // customers
    const customersRef = collection(db, "salons", salon.id, "customers");
    const customersSnap = await getDocs(customersRef);
    const customersData: Customer[] = customersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    customersData.sort((a, b) => a.name.localeCompare(b.name));
    setCustomers(customersData);
  }

  async function loadBookingsForDay() {
    if (!salon) return;
    setLoading(true);

    const bookingsRef = collection(db, "salons", salon.id, "bookings");

    // Filter by day range using timestamps
    const from = Timestamp.fromDate(startOfDay(date));
    const to = Timestamp.fromDate(endOfDay(date));

    const qDay = query(
      bookingsRef,
      where("startAt", ">=", from),
      where("startAt", "<=", to)
    );

    const snap = await getDocs(qDay);
    const data: Booking[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    setBookings(data);

    setLoading(false);
  }

  useEffect(() => {
    if (salon) loadBaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salon]);

  useEffect(() => {
    if (salon) loadBookingsForDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salon, date]);

  // Load pets when customer chosen
  useEffect(() => {
    (async () => {
      if (!salon || !customerId) {
        setPetsForCustomer([]);
        setPetId("");
        return;
      }
      const petsRef = collection(db, "salons", salon.id, "customers", customerId, "pets");
      const snap = await getDocs(petsRef);
      const data: Pet[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      data.sort((a, b) => a.name.localeCompare(b.name));
      setPetsForCustomer(data);
      setPetId("");
    })();
  }, [salon, customerId]);

  async function createBooking() {
    if (!salon || !creatingAtHHMM) return;
    if (!staffId || !serviceId) return;

    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;

    const base = dateISOToLocalDate(date);
    const [h, m] = creatingAtHHMM.split(":").map(Number);
    const start = new Date(base);
    start.setHours(h, m, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + svc.durationMinutes);

    // Must fit within salon hours
    if (!dayHours) return;
    const dayStartMin = minutesFromHHMM(dayHours.start);
    const dayEndMin = minutesFromHHMM(dayHours.end);
    const startMin = start.getHours() * 60 + start.getMinutes();
    const endMin = end.getHours() * 60 + end.getMinutes();
    if (startMin < dayStartMin || endMin > dayEndMin) return;

    // Prevent overlaps (client-side)
    const hasOverlap = bookingsForSelected.some((b) =>
      overlaps(start, end, b.startAt.toDate(), b.endAt.toDate())
    );
    if (hasOverlap) return;

    // Snapshots
    const staffObj = staff.find((s) => s.id === staffId);
    const staffNameSnapshot = staffObj?.name ?? "Staff";

    const customerObj = customerId ? customers.find((c) => c.id === customerId) : null;
    const petObj = petId ? petsForCustomer.find((p) => p.id === petId) : null;

    // customerSnapshot is required by your spec — even if customerId is not selected
    const customerSnapshot: Booking["customerSnapshot"] = customerObj
      ? {
          name: customerObj.name,
          phone: customerObj.phone ?? null,
          email: customerObj.email ?? null,
          notes: customerObj.notes ?? null,
          pet: petObj
            ? {
                id: petObj.id,
                name: petObj.name,
                breed: petObj.breed ?? null,
                weightKg: petObj.weightKg ?? null,
              }
            : null,
        }
      : {
          name: "Walk-in",
          phone: null,
          email: null,
          notes: null,
          pet: null,
        };

    const serviceSnapshot: Booking["serviceSnapshot"] = {
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      price: svc.price,
    };

    setSaving(true);

    const bookingsRef = collection(db, "salons", salon.id, "bookings");
    const now = serverTimestamp();

    await addDoc(bookingsRef, {
      source: "manual",
      status: "confirmed",

      serviceId,
      serviceSnapshot,

      staffId,
      staffNameSnapshot,

      customerId: customerObj ? customerId : null,
      customerSnapshot,

      startAt: Timestamp.fromDate(start),
      endAt: Timestamp.fromDate(end),

      price: svc.price,
      currency,

      notes: notes.trim() || null,

      createdAt: now,
      updatedAt: now,
      canceledAt: null,
      cancelReason: null,
    });

    setSaving(false);
    setCreatingAtHHMM(null);
    resetCreateForm();
    await loadBookingsForDay();
  }

  async function saveEdit() {
    if (!salon || !editing) return;

    const svc = services.find((s) => s.id === editServiceId);
    const staffObj = staff.find((s) => s.id === editStaffId);
    if (!svc || !staffObj) return;

    const base = dateISOToLocalDate(date);
    const [h, m] = editStartHHMM.split(":").map(Number);
    const start = new Date(base);
    start.setHours(h, m, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + svc.durationMinutes);

    // must fit into work hours
    if (!dayHours) return;
    const dayStartMin = minutesFromHHMM(dayHours.start);
    const dayEndMin = minutesFromHHMM(dayHours.end);
    const startMin = start.getHours() * 60 + start.getMinutes();
    const endMin = end.getHours() * 60 + end.getMinutes();
    if (startMin < dayStartMin || endMin > dayEndMin) {
      alert("Does not fit into work hours");
      return;
    }

    // overlap check (ignore current booking)
    const otherBookings = bookings
      .filter((b) => b.id !== editing.id)
      .filter((b) => b.status !== "canceled")
      .filter((b) => b.staffId === editStaffId);

    const conflict = otherBookings.some((b) =>
      overlaps(start, end, b.startAt.toDate(), b.endAt.toDate())
    );

    if (conflict) {
      alert("Time conflict with another booking");
      return;
    }

    setEditSaving(true);

    const ref = doc(db, "salons", salon.id, "bookings", editing.id);

    const serviceSnapshot: Booking["serviceSnapshot"] = {
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      price: svc.price,
    };

    await updateDoc(ref, {
      staffId: editStaffId,
      staffNameSnapshot: staffObj.name,

      serviceId: editServiceId,
      serviceSnapshot,

      startAt: Timestamp.fromDate(start),
      endAt: Timestamp.fromDate(end),

      price: svc.price,
      notes: editNotes.trim() || null,
      updatedAt: serverTimestamp(),
    });

    setEditSaving(false);
    setEditing(null);
    await loadBookingsForDay();
  }

  async function cancelBooking(b: Booking, reason: "client" | "salon") {
    if (!salon) return;
    const ref = doc(db, "salons", salon.id, "bookings", b.id);

    await updateDoc(ref, {
      status: "canceled",
      canceledAt: serverTimestamp(),
      cancelReason: reason,
      updatedAt: serverTimestamp(),
    });

    await loadBookingsForDay();
  }

  async function setBookingStatus(b: Booking, status: BookingStatus) {
    if (!salon) return;

    const ref = doc(db, "salons", salon.id, "bookings", b.id);

    // When switching away from canceled, clear canceled fields (optional)
    const patch: any = {
        status,
        updatedAt: serverTimestamp(),
    };

    if (status !== "canceled") {
        patch.canceledAt = null;
        patch.cancelReason = null;
    }

    await updateDoc(ref, patch);
    await loadBookingsForDay();
}

  if (salonLoading) return null;

  return (
    <div style={{ padding: 20, maxWidth: 1050 }}>
      <h1>Calendar</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Date</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Staff</div>
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
            {activeStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ opacity: 0.75, fontSize: 13 }}>
          Slot: {slotDuration} min • Currency: {currency}
          {dayHours ? ` • Hours: ${dayHours.start}–${dayHours.end}` : " • Closed"}
        </div>
      </div>

      {!dayHours && (
        <div style={{ marginTop: 20, opacity: 0.8 }}>This day is closed in salon settings.</div>
      )}

      {!!dayHours && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left: slots */}
          <div>
            <h2 style={{ fontSize: 18, marginTop: 0 }}>Time slots</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {timeSlots.map((t) => {
                const taken = isSlotTaken(t.hhmm);
                return (
                  <div
                    key={t.hhmm}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 12,
                      border: "1px solid #ddd",
                      borderRadius: 10,
                      opacity: taken ? 0.55 : 1,
                    }}
                  >
                    <div>
                      <strong>{t.hhmm}</strong>
                      {taken && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Busy</div>}
                    </div>

                    {!taken ? (
                      <button onClick={() => setCreatingAtHHMM(t.hhmm)}>Book</button>
                    ) : (
                      <span style={{ fontSize: 12, opacity: 0.7 }}>—</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create booking panel */}
            {creatingAtHHMM && (
              <div style={{ marginTop: 18, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
                <h3 style={{ marginTop: 0 }}>New booking at {creatingAtHHMM}</h3>

                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Service</div>
                    <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                      <option value="">Select service</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} • {s.durationMinutes}m • {s.price} {currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Customer (optional)</div>
                    <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                      <option value="">Walk-in (no customer)</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Pet</div>
                    <select
                      value={petId}
                      onChange={(e) => setPetId(e.target.value)}
                      disabled={!customerId}
                    >
                      <option value="">
                        {customerId ? "Select pet (optional)" : "Select customer to load pets"}
                      </option>
                      {petsForCustomer.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Notes</div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      disabled={saving || !serviceId || !staffId}
                      onClick={createBooking}
                    >
                      {saving ? "Saving..." : "Create booking"}
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => {
                        setCreatingAtHHMM(null);
                        resetCreateForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    End time is calculated from service duration.
                  </div>
                </div>
              </div>
            )}
          </div>
            
          {/* Right: bookings list */}
          <div>
            <h2 style={{ fontSize: 18, marginTop: 0 }}>Bookings</h2>

            {editing && (
              <div style={{ marginTop: 18, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
                <h3 style={{ marginTop: 0 }}>Edit booking</h3>

                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Staff</div>
                    <select value={editStaffId} onChange={(e) => setEditStaffId(e.target.value)}>
                      {activeStaff.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Service</div>
                    <select value={editServiceId} onChange={(e) => setEditServiceId(e.target.value)}>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} • {s.durationMinutes}m • {s.price} {currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Start time</div>
                    <select value={editStartHHMM} onChange={(e) => setEditStartHHMM(e.target.value)}>
                      {timeSlots.map((t) => (
                        <option key={t.hhmm} value={t.hhmm}>{t.hhmm}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Notes</div>
                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button disabled={editSaving} onClick={saveEdit}>
                      {editSaving ? "Saving..." : "Save"}
                    </button>
                    <button disabled={editSaving} onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading && <div>Loading...</div>}

            {!loading && bookingsForSelected.length === 0 && (
              <div style={{ opacity: 0.8 }}>No bookings for selected staff on this date.</div>
            )}

            <div style={{ display: "grid", gap: 10 }}>
              {bookingsForSelected.map((b) => {
                const start = hhmmFromDate(b.startAt.toDate());
                const end = hhmmFromDate(b.endAt.toDate());

                return (
                  <div key={b.id} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <strong>
                          {start}–{end}
                        </strong>{" "}
                        • {b.serviceSnapshot?.name ?? "Service"}
                        <div style={{ opacity: 0.85, marginTop: 4 }}>
                          {b.customerSnapshot?.name ?? "Customer"}
                          {b.customerSnapshot?.pet?.name ? ` • ${b.customerSnapshot.pet.name}` : ""}
                          {" • "}
                          {b.price} {b.currency}
                        </div>
                        {b.notes ? <div style={{ opacity: 0.8, marginTop: 6 }}>{b.notes}</div> : null}
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                          source: {b.source} • status: {b.status}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        {b.status === "confirmed" && (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => {
                              setEditing(b);
                              setEditStaffId(b.staffId);
                              setEditServiceId(b.serviceId);
                              setEditStartHHMM(hhmmFromDate(b.startAt.toDate()));
                              setEditNotes(b.notes ?? "");
                            }}>Edit</button>
                            <button onClick={() => setBookingStatus(b, "completed")}>Complete</button>
                            <button onClick={() => setBookingStatus(b, "no_show")}>No show</button>
                            <button onClick={() => cancelBooking(b, "salon")}>Cancel</button>
                        </div>
                        )}
                        

                        {(b.status === "completed" || b.status === "no_show") && (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setBookingStatus(b, "confirmed")}>Reopen</button>
                            <button onClick={() => cancelBooking(b, "salon")}>Cancel</button>
                        </div>
                        )}

                        {b.status === "canceled" && (
                        <div style={{ fontSize: 12, opacity: 0.7 }}>canceled</div>
                        )}
                        
                        {b.status === "canceled" && (
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            canceled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 14 }}>
              Note: this MVP prevents overlaps client-side. Later we’ll enforce it server-side too.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}