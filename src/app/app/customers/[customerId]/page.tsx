"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSalon } from "@/lib/useSalon"
import {
  ArrowLeft,
  Phone,
  Mail,
  StickyNote,
  Plus,
  Trash2,
  PawPrint,
  Weight,
  ShieldAlert,
  X,
} from "lucide-react"

type Customer = {
  name: string
  phone?: string | null
  email?: string | null
  notes?: string | null
}

type Pet = {
  id: string
  name: string
  breed?: string | null
  weightKg?: number | null
  allergies?: string | null
  notes?: string | null
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
  transition: "border-color 150ms, box-shadow 150ms",
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function CustomerDetailsPage() {
  const { salon, loading: salonLoading } = useSalon()
  const params = useParams<{ customerId: string }>()
  const router = useRouter()

  const customerId = params.customerId

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  const [showPetForm, setShowPetForm] = useState(false)
  const [petName, setPetName] = useState("")
  const [breed, setBreed] = useState("")
  const [weightKg, setWeightKg] = useState<number | "">("")
  const [allergies, setAllergies] = useState("")
  const [petNotes, setPetNotes] = useState("")

  const canAddPet = useMemo(() => petName.trim().length > 0, [petName])

  const loadCustomerAndPets = useCallback(async () => {
    if (!salon) return
    setLoading(true)

    const customerRef = doc(db, "salons", salon.id, "customers", customerId)
    const customerSnap = await getDoc(customerRef)

    if (!customerSnap.exists()) {
      setCustomer(null)
      setPets([])
      setLoading(false)
      return
    }

    setCustomer(customerSnap.data() as Customer)

    const petsSnap = await getDocs(
      collection(db, "salons", salon.id, "customers", customerId, "pets"),
    )
    const pData: Pet[] = petsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Pet, "id">),
    }))

    pData.sort((a, b) => a.name.localeCompare(b.name))
    setPets(pData)

    setLoading(false)
  }, [salon, customerId])

  useEffect(() => {
    loadCustomerAndPets()
  }, [loadCustomerAndPets])

  async function addPet() {
    if (!salon || !canAddPet) return

    await addDoc(
      collection(db, "salons", salon.id, "customers", customerId, "pets"),
      {
        name: petName.trim(),
        breed: breed.trim() || null,
        weightKg: weightKg === "" ? null : Number(weightKg),
        allergies: allergies.trim() || null,
        notes: petNotes.trim() || null,
        photoURL: null,
        createdAt: serverTimestamp(),
      },
    )

    setPetName("")
    setBreed("")
    setWeightKg("")
    setAllergies("")
    setPetNotes("")
    setShowPetForm(false)

    loadCustomerAndPets()
  }

  async function removePet(petId: string) {
    if (!salon) return
    const ok = window.confirm("Delete this pet? This cannot be undone.")
    if (!ok) return
    await deleteDoc(
      doc(db, "salons", salon.id, "customers", customerId, "pets", petId),
    )
    loadCustomerAndPets()
  }

  const showSkeleton = salonLoading || loading

  if (showSkeleton) {
    return (
      <div className="space-y-5">
        <BackLink onClick={() => router.push("/app/customers")} />
        <div style={PANEL} className="p-5 sm:p-6">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#F3F4F6",
            }}
          />
          <div
            style={{
              height: 16,
              width: 180,
              background: "#F3F4F6",
              borderRadius: 4,
              marginTop: 16,
            }}
          />
          <div
            style={{
              height: 10,
              width: 220,
              background: "#F3F4F6",
              borderRadius: 4,
              marginTop: 10,
            }}
          />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-5">
        <BackLink onClick={() => router.push("/app/customers")} />
        <div
          style={PANEL}
          className="flex flex-col items-center text-center py-14 px-6"
        >
          <h3
            className="text-[15px] font-semibold"
            style={{ color: "#0A0A1A" }}
          >
            Customer not found
          </h3>
          <p
            className="text-[13px] mt-1 max-w-sm"
            style={{ color: "#6B7280" }}
          >
            This customer may have been removed.
          </p>
          <button
            onClick={() => router.push("/app/customers")}
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
            Back to clients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <BackLink onClick={() => router.push("/app/customers")} />

      {/* ── Customer card ───────────────────────────────────────────── */}
      <div style={PANEL} className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center shrink-0 text-[13px] font-semibold"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#EEF0FA",
              color: "#5A61B8",
            }}
          >
            {customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-[18px] font-semibold leading-tight truncate"
              style={{ color: "#0A0A1A" }}
            >
              {customer.name}
            </h1>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[13px]"
              style={{ color: "#6B7280" }}
            >
              {customer.phone ? (
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: "#374151" }}
                >
                  <Phone size={13} strokeWidth={1.75} />
                  {customer.phone}
                </a>
              ) : null}
              {customer.email ? (
                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex items-center gap-1.5 truncate transition-colors"
                  style={{ color: "#374151" }}
                >
                  <Mail size={13} strokeWidth={1.75} />
                  <span className="truncate">{customer.email}</span>
                </a>
              ) : null}
              {!customer.phone && !customer.email && (
                <span style={{ color: "#9CA3AF" }}>No contact info</span>
              )}
            </div>
            {customer.notes && (
              <div
                className="flex items-start gap-1.5 mt-3 text-[13px]"
                style={{ color: "#6B7280" }}
              >
                <StickyNote
                  size={13}
                  strokeWidth={1.75}
                  className="mt-0.5 shrink-0"
                />
                <span>{customer.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pets header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2
            className="text-[11px] font-medium uppercase tracking-[0.12em]"
            style={{ color: "#9CA3AF" }}
          >
            Pets
          </h2>
          {pets.length > 0 && (
            <span
              className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: "#F3F4F6", color: "#374151" }}
            >
              {pets.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowPetForm((v) => !v)}
          className="inline-flex items-center gap-1.5 transition-colors"
          style={{
            height: 34,
            padding: "0 12px",
            borderRadius: 8,
            background: showPetForm ? "#F3F4F6" : "#0A0A1A",
            color: showPetForm ? "#374151" : "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            border: showPetForm ? "1px solid #E5E7EB" : "1px solid transparent",
          }}
        >
          {showPetForm ? (
            <>
              <X size={14} strokeWidth={2} />
              Cancel
            </>
          ) : (
            <>
              <Plus size={14} strokeWidth={2} />
              Add pet
            </>
          )}
        </button>
      </div>

      {/* ── Add pet form ────────────────────────────────────────────── */}
      {showPetForm && (
        <div style={PANEL} className="p-5 sm:p-6">
          <h3
            className="text-[15px] font-semibold mb-4"
            style={{ color: "#0A0A1A" }}
          >
            Add a new pet
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <FieldLabel>Name</FieldLabel>
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Bella"
                style={INPUT}
                autoFocus
              />
            </div>
            <div>
              <FieldLabel>Breed</FieldLabel>
              <input
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Cavalier, Poodle…"
                style={INPUT}
              />
            </div>
            <div>
              <FieldLabel>Weight (kg)</FieldLabel>
              <input
                type="number"
                value={weightKg}
                onChange={(e) =>
                  setWeightKg(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="7"
                style={INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Allergies</FieldLabel>
              <input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Chicken, certain shampoos…"
                style={INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Notes</FieldLabel>
              <textarea
                value={petNotes}
                onChange={(e) => setPetNotes(e.target.value)}
                rows={2}
                placeholder="Behaviour, preferred cut, grooming history…"
                style={{ ...INPUT, resize: "none" }}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addPet}
              disabled={!canAddPet}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 8,
                background: canAddPet ? "#0A0A1A" : "#E5E7EB",
                color: canAddPet ? "#FFFFFF" : "#9CA3AF",
                fontSize: 14,
                fontWeight: 500,
                cursor: canAddPet ? "pointer" : "not-allowed",
                border: "none",
              }}
            >
              Save pet
            </button>
            <button
              onClick={() => setShowPetForm(false)}
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

      {/* ── Pets list / empty state ─────────────────────────────────── */}
      {pets.length === 0 && !showPetForm ? (
        <div
          style={PANEL}
          className="flex flex-col items-center text-center py-12 px-6"
        >
          <div
            className="flex items-center justify-center mb-3"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#EEF0FA",
              color: "#5A61B8",
            }}
          >
            <PawPrint size={22} strokeWidth={1.75} />
          </div>
          <h3
            className="text-[15px] font-semibold"
            style={{ color: "#0A0A1A" }}
          >
            No pets yet
          </h3>
          <p
            className="text-[13px] mt-1 max-w-sm"
            style={{ color: "#6B7280" }}
          >
            Add this customer&apos;s furry companions to keep track of their
            grooming needs.
          </p>
          <button
            onClick={() => setShowPetForm(true)}
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
            Add first pet
          </button>
        </div>
      ) : pets.length > 0 ? (
        <div style={PANEL} className="overflow-hidden">
          {pets.map((p, i) => (
            <PetRow
              key={p.id}
              pet={p}
              isLast={i === pets.length - 1}
              onRemove={() => removePet(p.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors cursor-pointer"
      style={{ color: "#6B7280" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#0A0A1A")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
    >
      <ArrowLeft size={14} strokeWidth={1.75} />
      Back to clients
    </button>
  )
}

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

function PetRow({
  pet,
  isLast,
  onRemove,
}: {
  pet: Pet
  isLast: boolean
  onRemove: () => void
}) {
  return (
    <div
      className="group flex items-start gap-3 px-4 sm:px-5 py-3.5 transition-colors"
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
        <PawPrint size={16} strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-medium truncate"
          style={{ color: "#0A0A1A" }}
        >
          {pet.name}
        </p>
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[12px]"
          style={{ color: "#6B7280" }}
        >
          {pet.breed && <span>{pet.breed}</span>}
          {pet.weightKg != null && (
            <span className="inline-flex items-center gap-1">
              <Weight size={11} strokeWidth={1.75} />
              {pet.weightKg} kg
            </span>
          )}
        </div>
        {pet.allergies && (
          <span
            title={pet.allergies}
            className="inline-flex items-center gap-1 text-[11px] font-medium mt-1 px-2 py-0.5 rounded-full"
            style={{ background: "#FEF2F2", color: "#B3261E" }}
          >
            <ShieldAlert size={10} strokeWidth={2} />
            Allergies
          </span>
        )}
        {pet.notes && (
          <p
            className="text-[12px] mt-1 line-clamp-2"
            style={{ color: "#6B7280" }}
          >
            {pet.notes}
          </p>
        )}
      </div>

      <button
        onClick={onRemove}
        aria-label={`Delete ${pet.name}`}
        className="flex items-center justify-center shrink-0 transition-colors"
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
    </div>
  )
}
