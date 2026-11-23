import {
  Doctor,
  Lab,
  Booking,
  Review,
  EPrescription,
  MedicalRecordAttachment,
  PlatformSettings
} from '../types';
import { DEFAULT_COMMISSION_RATE } from '../constants';

const CACHE_KEYS = {
  DOCTORS: 'ehgz_cache_v1_doctors',
  LABS: 'ehgz_cache_v1_labs',
  BOOKINGS: 'ehgz_cache_v1_bookings',
  REVIEWS: 'ehgz_cache_v1_reviews',
  PRESCRIPTIONS: 'ehgz_cache_v1_prescriptions',
  MEDICAL_RECORDS: 'ehgz_cache_v1_medical_records',
  SETTINGS: 'ehgz_cache_v1_settings',
  OFFLINE_BOOKINGS_QUEUE: 'ehgz_offline_booking_queue_v1',
  LAST_SYNC: 'ehgz_cache_v1_last_sync'
};

export const OFFLINE_QUEUE_EVENT = 'ehgz:offline-queue-change';
export const NETWORK_HEALTH_EVENT = 'ehgz:network-health-change';

// Safe read from localStorage
export function readLocalCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

// Quota-safe write to localStorage (never throws, never deletes Firestore/in-memory data)
export function writeLocalCache<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, String(Date.now()));
  } catch {
    // If localStorage quota is nearly full (e.g., many legacy base64 dataURLs),
    // store a lighter copy in localStorage without affecting active app state or Firestore.
    try {
      if (Array.isArray(value)) {
        const compact = value.slice(0, 60).map((item) => {
          if (!item || typeof item !== 'object') return item;
          const copy = { ...(item as Record<string, unknown>) };
          for (const field of ['clinicPhoto', 'clinic_image', 'labPhoto', 'fileUrl']) {
            const val = copy[field];
            if (typeof val === 'string' && val.startsWith('data:') && val.length > 60000) {
              // Keep http(s) URLs and small WebP thumbnails intact; skip oversized base64 only in overflow fallback
              delete copy[field];
            }
          }
          return copy;
        });
        localStorage.setItem(key, JSON.stringify(compact));
      }
    } catch {
      // Ignore silently if storage is strictly restricted (e.g. private browsing)
    }
  }
}

// Collection-specific hydrated readers
export const getCachedDoctors = (): Doctor[] =>
  readLocalCache<Doctor[]>(CACHE_KEYS.DOCTORS, []);

export const saveCachedDoctors = (doctors: Doctor[]): void =>
  writeLocalCache(CACHE_KEYS.DOCTORS, doctors);

export const getCachedLabs = (): Lab[] =>
  readLocalCache<Lab[]>(CACHE_KEYS.LABS, []);

export const saveCachedLabs = (labs: Lab[]): void =>
  writeLocalCache(CACHE_KEYS.LABS, labs);

export const getCachedBookings = (): Booking[] =>
  readLocalCache<Booking[]>(CACHE_KEYS.BOOKINGS, []);

export const saveCachedBookings = (bookings: Booking[]): void =>
  writeLocalCache(CACHE_KEYS.BOOKINGS, bookings);

export const getCachedReviews = (): Review[] =>
  readLocalCache<Review[]>(CACHE_KEYS.REVIEWS, []);

export const saveCachedReviews = (reviews: Review[]): void =>
  writeLocalCache(CACHE_KEYS.REVIEWS, reviews);

export const getCachedPrescriptions = (): EPrescription[] =>
  readLocalCache<EPrescription[]>(CACHE_KEYS.PRESCRIPTIONS, []);

export const saveCachedPrescriptions = (items: EPrescription[]): void =>
  writeLocalCache(CACHE_KEYS.PRESCRIPTIONS, items);

export const getCachedMedicalRecords = (): MedicalRecordAttachment[] =>
  readLocalCache<MedicalRecordAttachment[]>(CACHE_KEYS.MEDICAL_RECORDS, []);

export const saveCachedMedicalRecords = (items: MedicalRecordAttachment[]): void =>
  writeLocalCache(CACHE_KEYS.MEDICAL_RECORDS, items);

export const getCachedPlatformSettings = (): PlatformSettings =>
  readLocalCache<PlatformSettings>(CACHE_KEYS.SETTINGS, {
    isCommissionEnabled: true,
    commissionRate: DEFAULT_COMMISSION_RATE
  });

export const saveCachedPlatformSettings = (settings: PlatformSettings): void =>
  writeLocalCache(CACHE_KEYS.SETTINGS, settings);

// ----------------------------------------------------
// Offline Booking Queue (Pending sync when network recovers)
// ----------------------------------------------------

export type QueuedBooking = Booking & { isOfflineQueued?: boolean };

function dispatchQueueEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_EVENT));
  }
}

export function getOfflineBookingQueue(): QueuedBooking[] {
  return readLocalCache<QueuedBooking[]>(CACHE_KEYS.OFFLINE_BOOKINGS_QUEUE, []);
}

export function enqueueOfflineBooking(booking: Booking): QueuedBooking[] {
  const queue = getOfflineBookingQueue();
  const queuedItem: QueuedBooking = { ...booking, isOfflineQueued: true };
  const updated = queue.some((b) => b.id === booking.id)
    ? queue.map((b) => (b.id === booking.id ? queuedItem : b))
    : [queuedItem, ...queue];
  writeLocalCache(CACHE_KEYS.OFFLINE_BOOKINGS_QUEUE, updated);
  dispatchQueueEvent();
  return updated;
}

export function removeOfflineBooking(bookingId: string): QueuedBooking[] {
  const queue = getOfflineBookingQueue();
  const updated = queue.filter((b) => b.id !== bookingId);
  writeLocalCache(CACHE_KEYS.OFFLINE_BOOKINGS_QUEUE, updated);
  dispatchQueueEvent();
  return updated;
}

export function mergeQueuedBookings(serverBookings: Booking[]): QueuedBooking[] {
  const queue = getOfflineBookingQueue();
  if (queue.length === 0) return serverBookings;
  const serverIds = new Set(serverBookings.map((b) => b.id));
  const pendingOnly = queue.filter((q) => !serverIds.has(q.id));
  if (pendingOnly.length === 0) {
    // All queued bookings have now arrived on server — clean queue
    writeLocalCache(CACHE_KEYS.OFFLINE_BOOKINGS_QUEUE, []);
    dispatchQueueEvent();
    return serverBookings;
  }
  const merged = [...pendingOnly, ...serverBookings];
  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return merged;
}

// ----------------------------------------------------
// Weak Network Health State Helper
// ----------------------------------------------------

let weakNetworkFlag = false;

export function getWeakNetworkFlag(): boolean {
  return weakNetworkFlag;
}

export function reportWeakNetwork(isWeak: boolean): void {
  if (weakNetworkFlag === isWeak) return;
  weakNetworkFlag = isWeak;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(NETWORK_HEALTH_EVENT, { detail: { isWeak } })
    );
  }
}
