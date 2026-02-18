"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSalon } from "@/lib/useSalon";

type Service = {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
};

type EditForm = {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
};

export default function ServicesPage() {
  const { salon, loading: salonLoading } = useSalon();

  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(50);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", durationMinutes: 60, price: 50 });

  async function loadServices() {
    if (!salon) return;

    const snap = await getDocs(collection(db, "salons", salon.id, "services"));
    const data: Service[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Service, "id">),
    }));

    setServices(data);
  }

  useEffect(() => {
    if (salon) {
      loadServices();
    }
  }, [salon]);

  async function addService() {
    if (!salon || !name.trim()) return;

    await addDoc(collection(db, "salons", salon.id, "services"), {
      name: name.trim(),
      description: description.trim(),
      durationMinutes: Number(duration),
      price: Number(price),
      isActive: true,
    });

    setName("");
    setDescription("");
    setDuration(60);
    setPrice(50);

    loadServices();
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
  }

  async function saveEdit(id: string) {
    if (!editForm.name.trim()) return;

    await updateDoc(doc(db, "salons", salon!.id, "services", id), {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      durationMinutes: Number(editForm.durationMinutes),
      price: Number(editForm.price),
    });

    setEditingId(null);
    loadServices();
  }

  async function removeService(id: string) {
    await deleteDoc(doc(db, "salons", salon!.id, "services", id));
    loadServices();
  }

  if (salonLoading) return null;

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h1>Services</h1>

      <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
        <input
          placeholder="Service name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        <button onClick={addService}>Add Service</button>
      </div>

      <div style={{ marginTop: 40 }}>
        {services.map((service) =>
          editingId === service.id ? (
            <div
              key={service.id}
              style={{ padding: 10, borderBottom: "1px solid #ddd", display: "grid", gap: 8 }}
            >
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Service name"
              />
              <input
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
              />
              <input
                type="number"
                value={editForm.durationMinutes}
                onChange={(e) => setEditForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                placeholder="Duration (minutes)"
              />
              <input
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                placeholder="Price"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => saveEdit(service.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div
              key={service.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10,
                borderBottom: "1px solid #ddd",
              }}
            >
              <div>
                <strong>{service.name}</strong>
                {service.description && (
                  <div style={{ color: "#666", fontSize: 13 }}>{service.description}</div>
                )}
                <div>
                  {service.durationMinutes} min • {service.price}€
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(service)}>Edit</button>
                <button onClick={() => removeService(service.id)}>Delete</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
