import * as admin from "firebase-admin";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";

admin.initializeApp();
const db = admin.firestore();

type BookingStatus = "confirmed" | "canceled" | "completed" | "no_show";

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function isConflictCanceled(data: any) {
  const notes = typeof data?.notes === "string" ? data.notes : "";
  return data?.status === "canceled" && data?.cancelReason === "salon" && notes.includes("conflict");
}

function buildConflictNotes(existing: any): string {
  const current = typeof existing === "string" ? existing.trim() : "";
  if (!current) return "conflict";
  if (current.includes("conflict")) return current; // avoid duplicate
  return `${current}\nconflict`;
}

/**
 * Fetch candidate bookings for overlap check.
 * Firestore can't query "startAt < end AND endAt > start" in one query.
 * So we query by staffId + startAt < newEnd, then filter in memory by endAt > newStart.
 */
async function findOverlappingBookingIds(args: {
  salonId: string;
  bookingId: string;
  staffId: string;
  newStartAt: admin.firestore.Timestamp;
  newEndAt: admin.firestore.Timestamp;
}): Promise<string[]> {
  const { salonId, bookingId, staffId, newStartAt, newEndAt } = args;

  const bookingsRef = db.collection("salons").doc(salonId).collection("bookings");

  // Candidate set: same staff, startAt < newEndAt
  const q = bookingsRef
    .where("staffId", "==", staffId)
    .where("startAt", "<", newEndAt)
    .limit(200); // MVP safeguard

  const snap = await q.get();
  if (snap.empty) return [];

  const newStart = newStartAt.toDate();
  const newEnd = newEndAt.toDate();

  const conflicts: string[] = [];

  for (const d of snap.docs) {
    if (d.id === bookingId) continue;

    const data = d.data();

    // ignore canceled bookings
    const status = data.status as BookingStatus | undefined;
    if (status === "canceled") continue;

    const startAt = data.startAt as admin.firestore.Timestamp | undefined;
    const endAt = data.endAt as admin.firestore.Timestamp | undefined;
    if (!startAt || !endAt) continue;

    const s = startAt.toDate();
    const e = endAt.toDate();

    if (overlaps(newStart, newEnd, s, e)) {
      conflicts.push(d.id);
    }
  }

  return conflicts;
}

async function cancelAsConflict(salonId: string, bookingId: string, existingNotes: any) {
  const ref = db.collection("salons").doc(salonId).collection("bookings").doc(bookingId);

  await ref.update({
    status: "canceled",
    cancelReason: "salon",
    canceledAt: admin.firestore.FieldValue.serverTimestamp(),
    notes: buildConflictNotes(existingNotes),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * 1) On create: validate overlaps.
 * If conflict -> cancel booking as conflict (do not delete).
 */
export const bookingsConflictGuardOnCreate = onDocumentCreated(
  "salons/{salonId}/bookings/{bookingId}",
  async (event: any) => {
    const snap = event.data;
    if (!snap) return;

    const salonId = event.params.salonId as string;
    const bookingId = event.params.bookingId as string;

    const data = snap.data();

    // If already canceled (or conflict-canceled), ignore
    if (!data) return;
    if (data.status === "canceled") return;
    if (isConflictCanceled(data)) return;

    const staffId = data.staffId as string | undefined;
    const startAt = data.startAt as admin.firestore.Timestamp | undefined;
    const endAt = data.endAt as admin.firestore.Timestamp | undefined;

    if (!staffId || !startAt || !endAt) return;

    const conflicts = await findOverlappingBookingIds({
      salonId,
      bookingId,
      staffId,
      newStartAt: startAt,
      newEndAt: endAt,
    });

    if (conflicts.length > 0) {
      await cancelAsConflict(salonId, bookingId, data.notes);
    }
  }
);

/**
 * 2) On update: validate overlaps when time/staff/status changes.
 * If conflict -> cancel booking as conflict.
 */
export const bookingsConflictGuardOnUpdate = onDocumentUpdated(
  "salons/{salonId}/bookings/{bookingId}",
  async (event: any) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;

    const salonId = event.params.salonId as string;
    const bookingId = event.params.bookingId as string;

    // If already conflict-canceled, do nothing (avoid loops)
    if (isConflictCanceled(after)) return;

    // If status is canceled for any reason, ignore
    if (after.status === "canceled") return;

    // Only validate if relevant fields changed
    const staffChanged = before.staffId !== after.staffId;
    const startChanged = before.startAt?.toMillis?.() !== after.startAt?.toMillis?.();
    const endChanged = before.endAt?.toMillis?.() !== after.endAt?.toMillis?.();
    const statusChanged = before.status !== after.status;

    if (!staffChanged && !startChanged && !endChanged && !statusChanged) return;

    const staffId = after.staffId as string | undefined;
    const startAt = after.startAt as admin.firestore.Timestamp | undefined;
    const endAt = after.endAt as admin.firestore.Timestamp | undefined;

    if (!staffId || !startAt || !endAt) return;

    const conflicts = await findOverlappingBookingIds({
      salonId,
      bookingId,
      staffId,
      newStartAt: startAt,
      newEndAt: endAt,
    });

    if (conflicts.length > 0) {
      await cancelAsConflict(salonId, bookingId, after.notes);
    }
  }
);