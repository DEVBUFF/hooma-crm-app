"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsConflictGuardOnUpdate = exports.bookingsConflictGuardOnCreate = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
admin.initializeApp();
const db = admin.firestore();
function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
}
function isConflictCanceled(data) {
    const notes = typeof data?.notes === "string" ? data.notes : "";
    return data?.status === "canceled" && data?.cancelReason === "salon" && notes.includes("conflict");
}
function buildConflictNotes(existing) {
    const current = typeof existing === "string" ? existing.trim() : "";
    if (!current)
        return "conflict";
    if (current.includes("conflict"))
        return current; // avoid duplicate
    return `${current}\nconflict`;
}
/**
 * Fetch candidate bookings for overlap check.
 * Firestore can't query "startAt < end AND endAt > start" in one query.
 * So we query by staffId + startAt < newEnd, then filter in memory by endAt > newStart.
 */
async function findOverlappingBookingIds(args) {
    const { salonId, bookingId, staffId, newStartAt, newEndAt } = args;
    const bookingsRef = db.collection("salons").doc(salonId).collection("bookings");
    // Candidate set: same staff, startAt < newEndAt
    const q = bookingsRef
        .where("staffId", "==", staffId)
        .where("startAt", "<", newEndAt)
        .limit(200); // MVP safeguard
    const snap = await q.get();
    if (snap.empty)
        return [];
    const newStart = newStartAt.toDate();
    const newEnd = newEndAt.toDate();
    const conflicts = [];
    for (const d of snap.docs) {
        if (d.id === bookingId)
            continue;
        const data = d.data();
        // ignore canceled bookings
        const status = data.status;
        if (status === "canceled")
            continue;
        const startAt = data.startAt;
        const endAt = data.endAt;
        if (!startAt || !endAt)
            continue;
        const s = startAt.toDate();
        const e = endAt.toDate();
        if (overlaps(newStart, newEnd, s, e)) {
            conflicts.push(d.id);
        }
    }
    return conflicts;
}
async function cancelAsConflict(salonId, bookingId, existingNotes) {
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
exports.bookingsConflictGuardOnCreate = (0, firestore_1.onDocumentCreated)("salons/{salonId}/bookings/{bookingId}", async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const salonId = event.params.salonId;
    const bookingId = event.params.bookingId;
    const data = snap.data();
    // If already canceled (or conflict-canceled), ignore
    if (!data)
        return;
    if (data.status === "canceled")
        return;
    if (isConflictCanceled(data))
        return;
    const staffId = data.staffId;
    const startAt = data.startAt;
    const endAt = data.endAt;
    if (!staffId || !startAt || !endAt)
        return;
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
});
/**
 * 2) On update: validate overlaps when time/staff/status changes.
 * If conflict -> cancel booking as conflict.
 */
exports.bookingsConflictGuardOnUpdate = (0, firestore_1.onDocumentUpdated)("salons/{salonId}/bookings/{bookingId}", async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after)
        return;
    const salonId = event.params.salonId;
    const bookingId = event.params.bookingId;
    // If already conflict-canceled, do nothing (avoid loops)
    if (isConflictCanceled(after))
        return;
    // If status is canceled for any reason, ignore
    if (after.status === "canceled")
        return;
    // Only validate if relevant fields changed
    const staffChanged = before.staffId !== after.staffId;
    const startChanged = before.startAt?.toMillis?.() !== after.startAt?.toMillis?.();
    const endChanged = before.endAt?.toMillis?.() !== after.endAt?.toMillis?.();
    const statusChanged = before.status !== after.status;
    if (!staffChanged && !startChanged && !endChanged && !statusChanged)
        return;
    const staffId = after.staffId;
    const startAt = after.startAt;
    const endAt = after.endAt;
    if (!staffId || !startAt || !endAt)
        return;
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
});
//# sourceMappingURL=index.js.map