import { db } from "@/lib/firebase";
import { Timestamp, collection, getDocs, limit, query, where } from "firebase/firestore";

type WorkDay = { start: string; end: string } | null;

export type Salon = {
  id: string;
  ownerId: string;
  name?: string;
  salonName?: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  email?: string;
  onboardingCompleted?: boolean;
  onboardingSkipped?: boolean;
  onboardingBannerDismissals?: number;
  createdAt?: Timestamp | Date;
  settings?: {
    slotDuration?: number;
    currency?: string;
    dateFormat?: string;
    workHours?: Record<string, WorkDay>;
  };
};

export async function getSalonByOwnerId(ownerId: string): Promise<Salon | null> {
  const q = query(collection(db, "salons"), where("ownerId", "==", ownerId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<Salon, "id">) };
}