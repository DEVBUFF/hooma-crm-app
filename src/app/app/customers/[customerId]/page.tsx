"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";
import { t } from "@/lib/tokens";
import { Skeleton } from "@/components/patterns/skeleton";

type Customer = {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

type Pet = {
  id: string;
  name: string;
  breed?: string | null;
  weightKg?: number | null;
  notes?: string | null;
};

export default function CustomerDetailsPage() {
  const { salon, loading: salonLoading } = useSalon();
  const params = useParams<{ customerId: string }>();
  const router = useRouter();

  const customerId = params.customerId;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  // Pet form
  const [petName, setPetName] = useState("");
  const [breed, setBreed] = useState("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [petNotes, setPetNotes] = useState("");

  const canAddPet = useMemo(() => petName.trim().length > 0, [petName]);

  const loadCustomerAndPets = useCallback(async () => {
    if (!salon) return;
    setLoading(true);

    // Load customer
    const customerRef = doc(db, "salons", salon.id, "customers", customerId);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      setCustomer(null);
      setPets([]);
      setLoading(false);
      return;
    }

    setCustomer(customerSnap.data() as Customer);

    // Load pets
    const petsSnap = await getDocs(
      collection(db, "salons", salon.id, "customers", customerId, "pets")
    );
    const pData: Pet[] = petsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Pet, "id">),
    }));

    pData.sort((a, b) => a.name.localeCompare(b.name));
    setPets(pData);

    setLoading(false);
  }, [salon, customerId]);

  useEffect(() => {
    loadCustomerAndPets();
  }, [loadCustomerAndPets]);

  async function addPet() {
    if (!salon || !canAddPet) return;

    await addDoc(collection(db, "salons", salon.id, "customers", customerId, "pets"), {
      name: petName.trim(),
      breed: breed.trim() || null,
      weightKg: weightKg === "" ? null : Number(weightKg),
      notes: petNotes.trim() || null,
      photoURL: null,
      createdAt: serverTimestamp(),
    });

    setPetName("");
    setBreed("");
    setWeightKg("");
    setPetNotes("");

    loadCustomerAndPets();
  }

  async function removePet(petId: string) {
    await deleteDoc(doc(db, "salons", salon!.id, "customers", customerId, "pets", petId));
    loadCustomerAndPets();
  }

  const showSkeleton = salonLoading || loading;

  if (showSkeleton) {
    return (
      <div className="max-w-3xl p-5 space-y-6">
        <Skeleton h="h-4" w="w-16" />
        <div className="space-y-3">
          <Skeleton h="h-7" w="w-44" />
          <Skeleton h="h-4" w="w-56" />
          <Skeleton h="h-3" w="w-72" />
        </div>
        <div className="space-y-2 pt-4">
          <Skeleton h="h-6" w="w-12" />
          <div
            className="divide-y divide-border/30 overflow-hidden"
            style={{ background: t.colors.component.card.bg, borderRadius: `${t.radius.lg}px`, boxShadow: t.shadow.sm }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <div className="flex-1 space-y-2">
                  <Skeleton h="h-4" w="w-28" />
                  <Skeleton h="h-3" w="w-36" />
                </div>
                <Skeleton h="h-8" w="w-16" rounded="rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <button onClick={() => router.push("/app/customers")}>← Back</button>

      <div style={{ marginTop: 14 }}>
        <h1>{customer?.name ?? "Customer"}</h1>
        {customer && (
          <div style={{ opacity: 0.85 }}>
            {customer.phone ? customer.phone : ""}
            {customer.email ? ` • ${customer.email}` : ""}
            {customer.notes ? <div style={{ marginTop: 6 }}>{customer.notes}</div> : null}
          </div>
        )}
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Pets</h2>

        {/* Add pet */}
        <div style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 520 }}>
          <input placeholder="Pet name" value={petName} onChange={(e) => setPetName(e.target.value)} />
          <input placeholder="Breed (optional)" value={breed} onChange={(e) => setBreed(e.target.value)} />
          <input
            placeholder="Weight kg (optional)"
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <textarea placeholder="Notes (optional)" value={petNotes} onChange={(e) => setPetNotes(e.target.value)} />
          <button disabled={!canAddPet} onClick={addPet}>
            Add pet
          </button>
        </div>

        {/* Pets list */}
        <div style={{ marginTop: 18 }}>
          {pets.length === 0 && <div style={{ opacity: 0.8 }}>No pets yet.</div>}

          {pets.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderBottom: "1px solid #ddd",
                gap: 12,
              }}
            >
              <div>
                <strong>{p.name}</strong>
                <div style={{ opacity: 0.8 }}>
                  {p.breed ? p.breed : ""} {p.weightKg != null ? `• ${p.weightKg}kg` : ""}
                </div>
                {p.notes ? <div style={{ opacity: 0.8, marginTop: 4 }}>{p.notes}</div> : null}
              </div>

              <button onClick={() => removePet(p.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}