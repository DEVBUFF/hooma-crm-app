"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSalon } from "@/lib/useSalon"
import { Plus, Trash2, Users, X, Phone } from "lucide-react"

type StaffRole = "admin" | "groomer"

type Staff = {
  id: string
  name: string
  role: string
  phone?: string | null
  isActive: boolean
}

// ── Style primitives ────────────────────────────────────────────────────────

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
}

const ROLE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  groomer: { bg: "#EEF0FA", fg: "#4950A3", label: "Groomer" },
  admin: { bg: "#ECFEF0", fg: "#2E7D4A", label: "Admin" },
}

function roleStyle(role: string) {
  return (
    ROLE_STYLE[role] ?? {
      bg: "#F3F4F6",
      fg: "#374151",
      label: role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member",
    }
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { salon, loading: salonLoading } = useSalon()

  const [items, setItems] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<StaffRole>("groomer")

  const canSubmit = useMemo(() => name.trim().length > 0, [name])

  const loadStaff = useCallback(async () => {
    if (!salon) return
    setLoading(true)
    const snap = await getDocs(collection(db, "salons", salon.id, "staff"))
    const data: Staff[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Staff, "id">),
    }))
    data.sort((a, b) => {
      if (a.isActive !== b.isActive) return Number(b.isActive) - Number(a.isActive)
      return a.name.localeCompare(b.name)
    })
    setItems(data)
    setLoading(false)
  }, [salon])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  async function addStaff() {
    if (!salon || !canSubmit) return
    await addDoc(collection(db, "salons", salon.id, "staff"), {
      name: name.trim(),
      phone: phone.trim() || null,
      role,
      isActive: true,
      createdAt: serverTimestamp(),
    })
    setName("")
    setPhone("")
    setRole("groomer")
    setShowForm(false)
    loadStaff()
  }

  async function removeStaff(id: string) {
    if (!salon) return
    const ok = window.confirm("Remove this team member? This cannot be undone.")
    if (!ok) return
    await deleteDoc(doc(db, "salons", salon.id, "staff", id))
    loadStaff()
  }

  async function toggleActive(staff: Staff) {
    if (!salon) return
    await updateDoc(doc(db, "salons", salon.id, "staff", staff.id), {
      isActive: !staff.isActive,
    })
    loadStaff()
  }

  const showSkeleton = salonLoading || loading

  return (
    <div className="space-y-5">
      {/* ── Controls row ───────────────────────────────────────────── */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 transition-colors"
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
              <span className="hidden sm:inline">Add member</span>
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
            Add a team member
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <FieldLabel>Name</FieldLabel>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Taylor"
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
              <FieldLabel>Role</FieldLabel>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                style={{ ...INPUT, cursor: "pointer" }}
              >
                <option value="groomer">Groomer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addStaff}
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
              Add member
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={PANEL} className="p-5">
              <div className="flex items-start gap-3">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#F3F4F6",
                  }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    style={{
                      height: 10,
                      width: "60%",
                      background: "#F3F4F6",
                      borderRadius: 4,
                    }}
                  />
                  <div
                    style={{
                      height: 8,
                      width: "40%",
                      background: "#F3F4F6",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 && !showForm ? (
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
            <Users size={22} strokeWidth={1.75} />
          </div>
          <h3
            className="text-[15px] font-semibold"
            style={{ color: "#0A0A1A" }}
          >
            No team members yet
          </h3>
          <p
            className="text-[13px] mt-1 max-w-sm"
            style={{ color: "#6B7280" }}
          >
            Add the groomers and admins who keep your salon running. You&apos;ll
            need at least one before you can take bookings.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-1.5 transition-colors"
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
            Add first member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((s) => (
            <StaffCard
              key={s.id}
              staff={s}
              onToggle={() => toggleActive(s)}
              onRemove={() => removeStaff(s.id)}
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

function StaffCard({
  staff,
  onToggle,
  onRemove,
}: {
  staff: Staff
  onToggle: () => void
  onRemove: () => void
}) {
  const role = roleStyle(staff.role)
  return (
    <div
      style={{
        ...PANEL,
        opacity: staff.isActive ? 1 : 0.65,
        overflow: "hidden",
      }}
    >
      <div className="flex items-start gap-3 p-5">
        <div
          className="flex items-center justify-center shrink-0 text-[12px] font-semibold"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#EEF0FA",
            color: "#5A61B8",
          }}
        >
          {staff.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-medium truncate"
            style={{ color: "#0A0A1A" }}
          >
            {staff.name}
          </p>
          {staff.phone && (
            <p
              className="text-[12px] mt-0.5 inline-flex items-center gap-1"
              style={{ color: "#6B7280" }}
            >
              <Phone size={11} strokeWidth={1.75} />
              {staff.phone}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: role.bg, color: role.fg }}
            >
              {role.label}
            </span>
            {!staff.isActive && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex"
        style={{ borderTop: "1px solid #F3F4F6" }}
      >
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-center py-2.5 text-[12px] font-medium transition-colors"
          style={{
            background: "transparent",
            color: staff.isActive ? "#374151" : "#2E7D4A",
            cursor: "pointer",
            border: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {staff.isActive ? "Set inactive" : "Set active"}
        </button>
        <div style={{ width: 1, background: "#F3F4F6" }} />
        <button
          onClick={onRemove}
          aria-label={`Remove ${staff.name}`}
          className="flex items-center justify-center py-2.5 transition-colors"
          style={{
            width: 44,
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
          <Trash2 size={13} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
