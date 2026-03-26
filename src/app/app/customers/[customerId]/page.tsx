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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

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
  allergies?: string | null;
  notes?: string | null;
};

const inputStyle: React.CSSProperties = {
  background: t.colors.semantic.bg,
  color: t.colors.semantic.text,
  border: `1px solid ${t.colors.semantic.borderSubtle}`,
  borderRadius: `${t.radius.lg}px`,
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
  const [showPetForm, setShowPetForm] = useState(false);
  const [petName, setPetName] = useState("");
  const [breed, setBreed] = useState("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [allergies, setAllergies] = useState("");
  const [petNotes, setPetNotes] = useState("");

  const canAddPet = useMemo(() => petName.trim().length > 0, [petName]);

  const loadCustomerAndPets = useCallback(async () => {
    if (!salon) return;
    setLoading(true);

    const customerRef = doc(db, "salons", salon.id, "customers", customerId);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      setCustomer(null);
      setPets([]);
      setLoading(false);
      return;
    }

    setCustomer(customerSnap.data() as Customer);

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
      allergies: allergies.trim() || null,
      notes: petNotes.trim() || null,
      photoURL: null,
      createdAt: serverTimestamp(),
    });

    setPetName("");
    setBreed("");
    setWeightKg("");
    setAllergies("");
    setPetNotes("");
    setShowPetForm(false);

    loadCustomerAndPets();
  }

  async function removePet(petId: string) {
    await deleteDoc(doc(db, "salons", salon!.id, "customers", customerId, "pets", petId));
    loadCustomerAndPets();
  }

  const showSkeleton = salonLoading || loading;

  if (showSkeleton) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton h="h-4" w="w-16" />
        <Card>
          <div className="space-y-3">
            <Skeleton h="h-7" w="w-44" />
            <Skeleton h="h-4" w="w-56" />
            <Skeleton h="h-3" w="w-72" />
          </div>
        </Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton h="h-5" w="w-16" />
            <Skeleton h="h-9" w="w-24" rounded="rounded-lg" />
          </div>
          <Card variant="flat" padding="sm" className="p-0 overflow-hidden divide-y divide-border/30">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton h="h-10" w="w-10" rounded="rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton h="h-4" w="w-28" />
                  <Skeleton h="h-3" w="w-36" />
                </div>
                <Skeleton h="h-8" w="w-16" rounded="rounded-lg" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-3xl space-y-6">
        <button
          onClick={() => router.push("/app/customers")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to customers
        </button>
        <Card className="p-16 flex flex-col items-center text-center gap-4">
          <p className="text-lg font-semibold text-foreground">Customer not found</p>
          <p className="text-sm text-muted-foreground">
            This customer may have been removed.
          </p>
          <Button onClick={() => router.push("/app/customers")} className="mt-2">
            Go back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/app/customers")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to customers
      </button>

      {/* Customer info card */}
      <Card>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: t.colors.semantic.primaryTint, color: t.colors.semantic.primary }}
          >
            {customer.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
              {customer.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {customer.phone && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone size={13} />
                  {customer.phone}
                </span>
              )}
              {customer.email && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail size={13} />
                  {customer.email}
                </span>
              )}
            </div>

            {customer.notes && (
              <div className="flex items-start gap-1.5 mt-3 text-sm text-muted-foreground">
                <StickyNote size={13} className="mt-0.5 shrink-0" />
                <span>{customer.notes}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Pets section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: t.colors.semantic.textSubtle }}
            >
              Pets
            </p>
            {pets.length > 0 && (
              <Badge variant="neutral">{pets.length}</Badge>
            )}
          </div>
          <Button onClick={() => setShowPetForm((v) => !v)} size="sm" className="gap-1.5">
            <Plus size={14} />
            Add pet
          </Button>
        </div>

        {/* Add pet form */}
        {showPetForm && (
          <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader>
              <CardTitle>Add a new pet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Pet name"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="col-span-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  style={inputStyle}
                  autoFocus
                />
                <input
                  placeholder="Breed (optional)"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  style={inputStyle}
                />
                <input
                  placeholder="Weight kg (optional)"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                  className="px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  style={inputStyle}
                />
                <input
                  placeholder="Allergies (optional)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="col-span-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  style={inputStyle}
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={petNotes}
                  onChange={(e) => setPetNotes(e.target.value)}
                  rows={2}
                  className="col-span-full px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={addPet} disabled={!canAddPet}>Add pet</Button>
                <Button variant="ghost" onClick={() => setShowPetForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {pets.length === 0 && !showPetForm && (
          <Card className="py-12 flex flex-col items-center text-center gap-4">
            <div
              className="w-14 h-14 flex items-center justify-center"
              style={{ background: t.colors.semantic.infoBg, borderRadius: `${t.radius.lg}px` }}
            >
              <PawPrint size={24} strokeWidth={1.5} style={{ color: t.colors.semantic.primary }} />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                No pets yet
              </p>
              <p className="text-sm mt-1 max-w-xs text-muted-foreground">
                Add this customer&apos;s furry companions to keep track of their grooming needs.
              </p>
            </div>
            <Button onClick={() => setShowPetForm(true)} size="sm" className="mt-1">
              Add first pet
            </Button>
          </Card>
        )}

        {/* Pets list */}
        {pets.length > 0 && (
          <Card variant="flat" padding="sm" className="p-0 overflow-hidden divide-y divide-border/30">
            {pets.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                {/* Pet avatar */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: t.colors.semantic.primaryTint, color: t.colors.semantic.primary }}
                >
                  <PawPrint size={18} />
                </div>

                {/* Pet info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {p.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    {p.breed && (
                      <span className="text-xs text-muted-foreground">{p.breed}</span>
                    )}
                    {p.weightKg != null && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Weight size={11} />
                        {p.weightKg} kg
                      </span>
                    )}
                  </div>
                  {p.allergies && (
                    <span
                      title={p.allergies}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full bg-[var(--color-error-bg)] text-[var(--color-error-text)] cursor-default"
                    >
                      <ShieldAlert size={10} />
                      Allergies
                    </span>
                  )}
                  {p.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {p.notes}
                    </p>
                  )}
                </div>

                {/* Delete action */}
                <button
                  onClick={() => removePet(p.id)}
                  className="w-8 h-8 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all hover:bg-destructive/8 shrink-0"
                >
                  <Trash2 size={13} className="text-destructive/60" />
                </button>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
