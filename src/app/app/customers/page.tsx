"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSalon } from "@/lib/useSalon"
import {
  Heart,
  Plus,
  Trash2,
  ChevronRight,
  Phone,
  Mail,
  Search,
  X,
} from "lucide-react"

type Customer = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  notes?: string | null
}

// ── Style primitives (match dashboard) ──────────────────────────────────────

const PANEL: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
}

const INPUT: React.CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  color: "#0A0A1A",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const { salon, loading: salonLoading } = useSalon()

  const [items, setItems] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")

  const canSubmit = useMemo(() => name.trim().length > 0, [name])

  const loadCustomers = useCallback(async () => {
    if (!salon) return
    setLoading(true)
    const snap = await getDocs(collection(db, "salons", salon.id, "customers"))
    const data: Customer[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Customer, "id">),
    }))
    data.sort((a, b) => a.name.localeCompare(b.name))
    setItems(data)
    setLoading(false)
  }, [salon])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  async function addCustomer() {
    if (!salon || !canSubmit) return
    await addDoc(collection(db, "salons", salon.id, "customers"), {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
      createdAt: serverTimestamp(),
    })
    setName("")
    setPhone("")
    setEmail("")
    setNotes("")
    setShowForm(false)
    loadCustomers()
  }

  async function removeCustomer(customerId: string) {
    if (!salon) return
    const ok = window.confirm(
      "Delete this customer and all of their pets? This cannot be undone.",
    )
    if (!ok) return
    const petsSnap = await getDocs(
      collection(db, "salons", salon.id, "customers", customerId, "pets"),
    )
    await Promise.all(
      petsSnap.docs.map((d) =>
        deleteDoc(
          doc(db, "salons", salon.id, "customers", customerId, "pets", d.id),
        ),
      ),
    )
    await deleteDoc(doc(db, "salons", salon.id, "customers", customerId))
    loadCustomers()
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      )
    })
  }, [items, search])

  const showSkeleton = salonLoading || loading

  return (
    <div className="space-y-5">
      {/* ── Controls row ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search
            size={15}
            strokeWidth={1.75}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email"
            style={{ ...INPUT, paddingLeft: 36, paddingRight: search ? 36 : 12 }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="flex items-center justify-center"
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "transparent",
                color: "#6B7280",
                cursor: "pointer",
              }}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 shrink-0 transition-colors"
          style={{
            height: 40,
            padding: "0 14px",
            borderRadius: 8,
            background: showForm ? "#F3F4F6" : "#0A0A1A",
            color: showForm ? "#374151" : "#FFFFFF",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            border: showForm ? "1px solid #E5E7EB" : "1px solid transparent",
          }}
        >
          {showForm ? (
            <>
              <X size={15} strokeWidth={2} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus size={15} strokeWidth={2} />
              <span className="hidden sm:inline">New customer</span>
              <span className="sm:hidden">Add</span>
            </>
          )}
        </button>
      </div>

      {/* ── Add form ───────────────────────────────────────────────── */}
      {showForm && (
        <div style={PANEL} className="p-5 sm:p-6">
          <h2
            className="text-[15px] font-semibold mb-4"
            style={{ color: "#0A0A1A" }}
          >
            Add a new customer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <FieldLabel>Name</FieldLabel>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                style={INPUT}
              />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07…"
                style={INPUT}
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                type="email"
                style={INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Notes</FieldLabel>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, preferences, anything useful."
                rows={2}
                style={{ ...INPUT, resize: "none" }}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addCustomer}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 8,
                background: canSubmit ? "#0A0A1A" : "#E5E7EB",
                color: canSubmit ? "#FFFFFF" : "#9CA3AF",
                fontSize: 14,
                fontWeight: 500,
                cursor: canSubmit ? "pointer" : "not-allowed",
                border: "none",
              }}
            >
              Save customer
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 8,
                background: "transparent",
                color: "#374151",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid #E5E7EB",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── List / states ─────────────────────────────────────────── */}
      {showSkeleton ? (
        <div style={PANEL} className="overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-4"
              style={{
                borderBottom: i === 5 ? "none" : "1px solid #F3F4F6",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#F3F4F6",
                }}
              />
              <div className="flex-1 space-y-2">
                <div
                  style={{
                    height: 10,
                    width: "40%",
                    background: "#F3F4F6",
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    height: 8,
                    width: "28%",
                    background: "#F3F4F6",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first customer to start taking bookings and tracking pets."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 8,
                background: "#0A0A1A",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
              }}
            >
              <Plus size={15} strokeWidth={2} />
              Add your first customer
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          description={`Nothing matches "${search}". Try a different search.`}
        />
      ) : (
        <div style={PANEL} className="overflow-hidden">
          {filtered.map((c, i) => (
            <CustomerRow
              key={c.id}
              customer={c}
              isLast={i === filtered.length - 1}
              onRemove={() => removeCustomer(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[12px] font-medium mb-1"
      style={{ color: "#374151" }}
    >
      {children}
    </label>
  )
}

function CustomerRow({
  customer,
  isLast,
  onRemove,
}: {
  customer: Customer
  isLast: boolean
  onRemove: () => void
}) {
  return (
    <div
      className="group flex items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors"
      style={{
        borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="flex items-center justify-center shrink-0 text-[11px] font-semibold"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#EEF0FA",
          color: "#5A61B8",
        }}
      >
        {customer.name.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={`/app/customers/${customer.id}`}
          className="font-medium text-[14px] truncate block transition-colors"
          style={{ color: "#0A0A1A" }}
        >
          {customer.name}
        </Link>
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[12px]"
          style={{ color: "#6B7280" }}
        >
          {customer.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone size={11} strokeWidth={1.75} />
              {customer.phone}
            </span>
          )}
          {customer.email && (
            <span className="inline-flex items-center gap-1 truncate">
              <Mail size={11} strokeWidth={1.75} />
              <span className="truncate">{customer.email}</span>
            </span>
          )}
          {!customer.phone && !customer.email && (
            <span style={{ color: "#9CA3AF" }}>No contact info</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={onRemove}
          aria-label={`Delete ${customer.name}`}
          className="flex items-center justify-center transition-colors"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "transparent",
            color: "#9CA3AF",
            cursor: "pointer",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FEF2F2"
            e.currentTarget.style.color = "#D4483B"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "#9CA3AF"
          }}
        >
          <Trash2 size={14} strokeWidth={1.75} />
        </button>
        <Link
          href={`/app/customers/${customer.id}`}
          className="flex items-center justify-center transition-colors"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            color: "#9CA3AF",
          }}
        >
          <ChevronRight size={15} strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div
      style={PANEL}
      className="flex flex-col items-center text-center py-14 px-6"
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "#EEF0FA",
          color: "#5A61B8",
        }}
      >
        <Heart size={22} strokeWidth={1.75} />
      </div>
      <h3
        className="text-[15px] font-semibold"
        style={{ color: "#0A0A1A" }}
      >
        {title}
      </h3>
      <p
        className="text-[13px] mt-1 max-w-sm"
        style={{ color: "#6B7280" }}
      >
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
