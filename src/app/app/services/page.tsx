"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSalon } from "@/lib/useSalon"
import { useSalonSettings } from "@/lib/useSalonSettings"
import {
  Scissors,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  Coins,
} from "lucide-react"

type Service = {
  id: string
  name: string
  description?: string
  durationMinutes: number
  price: number
}

type EditForm = {
  name: string
  description: string
  durationMinutes: number
  price: number
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

// ── Page ────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const { salon, loading: salonLoading } = useSalon()
  const { currency } = useSalonSettings()

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState(60)
  const [price, setPrice] = useState(50)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    description: "",
    durationMinutes: 60,
    price: 50,
  })

  const canAdd = useMemo(() => name.trim().length > 0, [name])

  const loadServices = useCallback(async () => {
    if (!salon) return
    setLoading(true)
    const snap = await getDocs(collection(db, "salons", salon.id, "services"))
    const data: Service[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Service, "id">),
    }))
    data.sort((a, b) => a.name.localeCompare(b.name))
    setServices(data)
    setLoading(false)
  }, [salon])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  async function addService() {
    if (!salon || !canAdd) return
    await addDoc(collection(db, "salons", salon.id, "services"), {
      name: name.trim(),
      description: description.trim(),
      durationMinutes: Number(duration),
      price: Number(price),
      isActive: true,
    })
    setName("")
    setDescription("")
    setDuration(60)
    setPrice(50)
    setShowForm(false)
    loadServices()
  }

  function startEdit(service: Service) {
    setEditingId(service.id)
    setEditForm({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      price: service.price,
    })
  }

  async function saveEdit(id: string) {
    if (!salon || !editForm.name.trim()) return
    await updateDoc(doc(db, "salons", salon.id, "services", id), {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      durationMinutes: Number(editForm.durationMinutes),
      price: Number(editForm.price),
    })
    setEditingId(null)
    loadServices()
  }

  async function removeService(id: string) {
    if (!salon) return
    const ok = window.confirm("Delete this service? This cannot be undone.")
    if (!ok) return
    await deleteDoc(doc(db, "salons", salon.id, "services", id))
    loadServices()
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
              <span className="hidden sm:inline">New service</span>
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
            Add a new service
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <FieldLabel>Name</FieldLabel>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full groom"
                style={INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Wash, dry, brush, trim — the full works."
                style={INPUT}
              />
            </div>
            <div>
              <FieldLabel>Duration (min)</FieldLabel>
              <IconInput icon={<Clock size={14} strokeWidth={1.75} />}>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "#0A0A1A" }}
                />
              </IconInput>
            </div>
            <div>
              <FieldLabel>Price ({currency})</FieldLabel>
              <IconInput icon={<Coins size={14} strokeWidth={1.75} />}>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "#0A0A1A" }}
                />
              </IconInput>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addService}
              disabled={!canAdd}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 8,
                background: canAdd ? "#0A0A1A" : "#E5E7EB",
                color: canAdd ? "#FFFFFF" : "#9CA3AF",
                fontSize: 14,
                fontWeight: 500,
                cursor: canAdd ? "pointer" : "not-allowed",
                border: "none",
              }}
            >
              Save service
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

      {/* ── States ─────────────────────────────────────────────────── */}
      {showSkeleton ? (
        <div style={PANEL} className="overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-4"
              style={{
                borderBottom: i === 3 ? "none" : "1px solid #F3F4F6",
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
      ) : services.length === 0 && !showForm ? (
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
            <Scissors size={22} strokeWidth={1.75} />
          </div>
          <h3
            className="text-[15px] font-semibold"
            style={{ color: "#0A0A1A" }}
          >
            No services yet
          </h3>
          <p
            className="text-[13px] mt-1 max-w-sm"
            style={{ color: "#6B7280" }}
          >
            Add a full groom, bath, nail trim — whatever you offer. Each needs a
            name, duration, and price.
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
            Add your first service
          </button>
        </div>
      ) : services.length > 0 ? (
        <div style={PANEL} className="overflow-hidden">
          {services.map((service, i) =>
            editingId === service.id ? (
              <ServiceEditRow
                key={service.id}
                form={editForm}
                setForm={setEditForm}
                isLast={i === services.length - 1}
                onSave={() => saveEdit(service.id)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <ServiceRow
                key={service.id}
                service={service}
                currency={currency}
                isLast={i === services.length - 1}
                onEdit={() => startEdit(service)}
                onRemove={() => removeService(service.id)}
              />
            ),
          )}
        </div>
      ) : null}
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

function IconInput({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: "#FFFFFF",
        color: "#9CA3AF",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <span className="shrink-0">{icon}</span>
      {children}
    </div>
  )
}

function ServiceRow({
  service,
  currency,
  isLast,
  onEdit,
  onRemove,
}: {
  service: Service
  currency: string
  isLast: boolean
  onEdit: () => void
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
        className="flex items-center justify-center shrink-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#EEF0FA",
          color: "#5A61B8",
        }}
      >
        <Scissors size={16} strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-medium truncate"
          style={{ color: "#0A0A1A" }}
        >
          {service.name}
        </p>
        {service.description && (
          <p
            className="text-[12px] truncate"
            style={{ color: "#6B7280" }}
          >
            {service.description}
          </p>
        )}
      </div>

      <div
        className="flex items-center gap-3 text-[12px] shrink-0 pr-1"
        style={{ color: "#374151" }}
      >
        <span className="inline-flex items-center gap-1">
          <Clock size={12} strokeWidth={1.75} style={{ color: "#9CA3AF" }} />
          <span className="tabular-nums">{service.durationMinutes}m</span>
        </span>
        <span
          className="font-medium tabular-nums"
          style={{ color: "#0A0A1A" }}
        >
          {currency} {service.price}
        </span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={onEdit}
          aria-label={`Edit ${service.name}`}
          className="flex items-center justify-center transition-colors"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "transparent",
            color: "#6B7280",
            cursor: "pointer",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F3F4F6"
            e.currentTarget.style.color = "#0A0A1A"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "#6B7280"
          }}
        >
          <Pencil size={13} strokeWidth={1.75} />
        </button>
        <button
          onClick={onRemove}
          aria-label={`Delete ${service.name}`}
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
          <Trash2 size={13} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

function ServiceEditRow({
  form,
  setForm,
  isLast,
  onSave,
  onCancel,
}: {
  form: EditForm
  setForm: React.Dispatch<React.SetStateAction<EditForm>>
  isLast: boolean
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="p-4 sm:p-5"
      style={{
        background: "#F9FAFB",
        borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <FieldLabel>Name</FieldLabel>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Service name"
            style={INPUT}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Description</FieldLabel>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Description"
            style={INPUT}
          />
        </div>
        <div>
          <FieldLabel>Duration (min)</FieldLabel>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                durationMinutes: Number(e.target.value),
              }))
            }
            style={INPUT}
          />
        </div>
        <div>
          <FieldLabel>Price</FieldLabel>
          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: Number(e.target.value) }))
            }
            style={INPUT}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1.5 transition-colors"
          style={{
            height: 34,
            padding: "0 12px",
            borderRadius: 8,
            background: "#0A0A1A",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            border: "none",
          }}
        >
          <Check size={13} strokeWidth={2} /> Save
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 transition-colors"
          style={{
            height: 34,
            padding: "0 12px",
            borderRadius: 8,
            background: "transparent",
            color: "#374151",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            border: "1px solid #E5E7EB",
          }}
        >
          <X size={13} strokeWidth={2} /> Cancel
        </button>
      </div>
    </div>
  )
}
