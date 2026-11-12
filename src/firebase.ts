import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  Unsubscribe 
} from 'firebase/firestore';
import { getMessaging, getToken, isSupported, Messaging } from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Doctor, 
  Lab, 
  Booking, 
  BookingStatus, 
  ProviderStatus, 
  NotificationItem, 
  PushSubscriptionProfile, 
  RecipientType, 
  NotificationType,
  Review,
  PlatformSettings,
  EPrescription,
  MedicalRecordAttachment
} from './types';
import { sendPushNotification } from './utils/pwaNotifications';
export { sendPushNotification };

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling per Skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Connected to Firestore successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
}

// ----------------------------------------------------
// Doctors Collection Services
// ----------------------------------------------------

export function subscribeDoctors(
  onUpdate: (doctors: Doctor[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'doctors';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const doctorsList: Doctor[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        doctorsList.push({
          id: docSnap.id,
          name: data.name || '',
          specialty: data.specialty || '',
          phone1: data.phone1 || '',
          phone2: data.phone2 || undefined,
          address: data.address || '',
          governorate: data.governorate || undefined,
          city: data.city || undefined,
          center: data.center || data.city || undefined,
          price: Number(data.price || 0),
          clinicPhoto: data.clinicPhoto || undefined,
          doctorPhoto: data.doctorPhoto || undefined,
          workingHours: data.workingHours || undefined,
          isDemo: !!data.isDemo,
          status: (data.status as ProviderStatus) || 'pending',
          otpCode: data.otpCode || undefined,
          isVerified: !!data.isVerified,
          googleMapsUrl: data.googleMapsUrl || undefined,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      // Sort by creation desc
      doctorsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(doctorsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveDoctorToFirestore(doctor: Doctor): Promise<void> {
  const path = 'doctors';
  try {
    const docRef = doc(db, path, doctor.id);
    const dataToSave = {
      name: doctor.name,
      specialty: doctor.specialty,
      phone1: doctor.phone1,
      phone2: doctor.phone2 || '',
      address: doctor.address,
      governorate: doctor.governorate || '',
      city: doctor.city || doctor.center || '',
      center: doctor.center || doctor.city || '',
      price: Number(doctor.price),
      clinicPhoto: doctor.clinicPhoto || '',
      doctorPhoto: doctor.doctorPhoto || '',
      workingHours: doctor.workingHours || '',
      isDemo: false,
      status: doctor.status,
      otpCode: doctor.otpCode || '',
      isVerified: !!doctor.isVerified,
      googleMapsUrl: doctor.googleMapsUrl || '',
      createdAt: doctor.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${doctor.id}`);
  }
}

export async function updateDoctorStatusInFirestore(
  id: string, 
  status: ProviderStatus,
  extra?: { otpCode?: string; isVerified?: boolean }
): Promise<void> {
  const path = 'doctors';
  try {
    const docRef = doc(db, path, id);
    const payload: Record<string, unknown> = { status };
    if (extra?.otpCode !== undefined) payload.otpCode = extra.otpCode;
    if (extra?.isVerified !== undefined) payload.isVerified = extra.isVerified;
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function updateDoctorInFirestore(
  id: string,
  updates: Partial<Doctor>
): Promise<void> {
  const path = 'doctors';
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function blockDoctorInFirestore(id: string): Promise<void> {
  return updateDoctorStatusInFirestore(id, 'blocked');
}

export async function unblockDoctorInFirestore(id: string): Promise<void> {
  return updateDoctorStatusInFirestore(id, 'approved');
}

export async function deleteDoctorFromFirestore(id: string): Promise<void> {
  const path = 'doctors';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ----------------------------------------------------
// Labs Collection Services
// ----------------------------------------------------

export function subscribeLabs(
  onUpdate: (labs: Lab[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'labs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const labsList: Lab[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        labsList.push({
          id: docSnap.id,
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          governorate: data.governorate || undefined,
          city: data.city || undefined,
          center: data.center || data.city || undefined,
          labPhoto: data.labPhoto || undefined,
          tests: Array.isArray(data.tests) ? data.tests : [],
          startingPrice: Number(data.startingPrice || 0),
          workingHours: data.workingHours || undefined,
          isDemo: !!data.isDemo,
          status: (data.status as ProviderStatus) || 'pending',
          otpCode: data.otpCode || undefined,
          isVerified: !!data.isVerified,
          googleMapsUrl: data.googleMapsUrl || undefined,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      labsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(labsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveLabToFirestore(lab: Lab): Promise<void> {
  const path = 'labs';
  try {
    const docRef = doc(db, path, lab.id);
    const dataToSave = {
      name: lab.name,
      phone: lab.phone,
      address: lab.address,
      governorate: lab.governorate || '',
      city: lab.city || lab.center || '',
      center: lab.center || lab.city || '',
      labPhoto: lab.labPhoto || '',
      tests: lab.tests || [],
      startingPrice: Number(lab.startingPrice),
      workingHours: lab.workingHours || '',
      isDemo: false,
      status: lab.status,
      otpCode: lab.otpCode || '',
      isVerified: !!lab.isVerified,
      googleMapsUrl: lab.googleMapsUrl || '',
      createdAt: lab.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${lab.id}`);
  }
}

export async function updateLabStatusInFirestore(
  id: string, 
  status: ProviderStatus,
  extra?: { otpCode?: string; isVerified?: boolean }
): Promise<void> {
  const path = 'labs';
  try {
    const docRef = doc(db, path, id);
    const payload: Record<string, unknown> = { status };
    if (extra?.otpCode !== undefined) payload.otpCode = extra.otpCode;
    if (extra?.isVerified !== undefined) payload.isVerified = extra.isVerified;
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function updateLabInFirestore(
  id: string,
  updates: Partial<Lab>
): Promise<void> {
  const path = 'labs';
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function blockLabInFirestore(id: string): Promise<void> {
  return updateLabStatusInFirestore(id, 'blocked');
}

export async function unblockLabInFirestore(id: string): Promise<void> {
  return updateLabStatusInFirestore(id, 'approved');
}

export async function deleteLabFromFirestore(id: string): Promise<void> {
  const path = 'labs';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ----------------------------------------------------
// Automated Welcome & OTP Dispatch Service
// ----------------------------------------------------

export async function sendProviderApprovalWithOTP(
  provider: Doctor | Lab,
  providerType: 'doctor' | 'lab',
  otpCode: string
): Promise<void> {
  const phone = providerType === 'doctor' ? (provider as Doctor).phone1 : (provider as Lab).phone;
  const officialMessage = `تم قبول انضمامك بنجاح إلى تطبيق (احجز عند دكتورك)! كود التأكيد الخاص بك هو: [${otpCode}]. نتمنى لك التوفيق والنجاح الدائم في خدمة مرضانا.`;

  // 1. Create notification in Firestore
  await createNotificationInFirestore({
    title: `🎉 تم قبول انضمامك بنجاح إلى تطبيق (احجز عند دكتورك)!`,
    body: officialMessage,
    recipientType: providerType,
    recipientId: provider.id,
    recipientPhone: phone,
    type: 'test'
  });

  // 2. Trigger audio chime and device push alert
  await triggerDevicePushNotification(
    `🎉 تم قبول انضمامك بنجاح كـ ${providerType === 'doctor' ? 'طبيب' : 'معمل'}!`,
    officialMessage,
    { otpCode, providerId: provider.id, providerType }
  );
}

// ----------------------------------------------------
// Global Platform Settings (Commission Switch & Rates)
// ----------------------------------------------------

export function subscribePlatformSettings(
  onUpdate: (settings: PlatformSettings) => void
): Unsubscribe {
  const path = 'settings';
  return onSnapshot(
    doc(db, path, 'platform'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          isCommissionEnabled: data.isCommissionEnabled ?? true,
          commissionRate: data.commissionRate !== undefined ? Number(data.commissionRate) : 12,
          updatedAt: data.updatedAt || undefined
        });
      } else {
        // default 12% enabled
        onUpdate({
          isCommissionEnabled: true,
          commissionRate: 12
        });
      }
    },
    (err) => {
      console.warn('Could not read platform settings from firestore, using defaults:', err);
    }
  );
}

export async function savePlatformSettingsInFirestore(settings: PlatformSettings): Promise<void> {
  const path = 'settings';
  try {
    const docRef = doc(db, path, 'platform');
    await setDoc(docRef, {
      isCommissionEnabled: settings.isCommissionEnabled,
      commissionRate: settings.commissionRate,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/platform`);
  }
}

// ----------------------------------------------------
// Bookings Collection Services with Push Notification Triggers
// ----------------------------------------------------

export function subscribeBookings(
  onUpdate: (bookings: Booking[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'bookings';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const bookingsList: Booking[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        bookingsList.push({
          id: docSnap.id,
          bookingCode: data.bookingCode || '',
          providerType: (data.providerType as 'doctor' | 'lab') || 'doctor',
          providerId: data.providerId || '',
          providerName: data.providerName || '',
          providerSpecialtyOrType: data.providerSpecialtyOrType || '',
          providerAddress: data.providerAddress || '',
          patientName: data.patientName || '',
          patientPhone: data.patientPhone || '',
          appointmentDate: data.appointmentDate || '',
          appointmentTime: data.appointmentTime || undefined,
          selectedTestName: data.selectedTestName || undefined,
          price: Number(data.price || 0),
          notes: data.notes || undefined,
          status: (data.status as BookingStatus) || 'pending',
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      bookingsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(bookingsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveBookingToFirestore(booking: Booking): Promise<void> {
  const path = 'bookings';
  try {
    const docRef = doc(db, path, booking.id);
    const dataToSave = {
      bookingCode: booking.bookingCode,
      providerType: booking.providerType,
      providerId: booking.providerId,
      providerName: booking.providerName,
      providerSpecialtyOrType: booking.providerSpecialtyOrType,
      providerAddress: booking.providerAddress,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime || '',
      selectedTestName: booking.selectedTestName || '',
      price: Number(booking.price),
      notes: booking.notes || '',
      status: booking.status,
      createdAt: booking.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });

    // AUTOMATIC PUSH NOTIFICATION: Trigger push alert to Doctor or Lab
    const providerLabel = booking.providerType === 'doctor' ? 'عيادتك' : 'معملك';
    const testInfo = booking.selectedTestName ? ` (تحليل: ${booking.selectedTestName})` : '';
    await createNotificationInFirestore({
      title: `🔔 حجز جديد لـ ${providerLabel}!`,
      body: `قام المريض ${booking.patientName} (${booking.patientPhone}) بحجز موعد بتاريخ ${booking.appointmentDate}${testInfo}. كود الحجز: ${booking.bookingCode}`,
      recipientType: booking.providerType === 'doctor' ? 'doctor' : 'lab',
      recipientId: booking.providerId,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      type: 'new_booking'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${booking.id}`);
  }
}

export async function updateBookingStatusInFirestore(
  id: string, 
  status: BookingStatus,
  bookingDetails?: Booking
): Promise<void> {
  const path = 'bookings';
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, { status }, { merge: true });

    // AUTOMATIC PUSH NOTIFICATION TO PATIENT:
    if (bookingDetails) {
      if (status === 'confirmed') {
        await createNotificationInFirestore({
          title: `✅ تم قبول وتأكيد حجزك بنجاح!`,
          body: `مرحباً ${bookingDetails.patientName}، تم تأكيد موعدك لدى ${bookingDetails.providerName} بتاريخ ${bookingDetails.appointmentDate}. كود الحجز: ${bookingDetails.bookingCode}`,
          recipientType: 'patient',
          recipientPhone: bookingDetails.patientPhone,
          bookingId: id,
          bookingCode: bookingDetails.bookingCode,
          type: 'booking_confirmed'
        });
      } else if (status === 'cancelled') {
        await createNotificationInFirestore({
          title: `❌ تم إلغاء موعد الحجز`,
          body: `نعتذر منك ${bookingDetails.patientName}، تم إلغاء حجزك لدى ${bookingDetails.providerName}. كود الحجز: ${bookingDetails.bookingCode}`,
          recipientType: 'patient',
          recipientPhone: bookingDetails.patientPhone,
          bookingId: id,
          bookingCode: bookingDetails.bookingCode,
          type: 'booking_cancelled'
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function deleteBookingFromFirestore(id: string): Promise<void> {
  const path = 'bookings';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ----------------------------------------------------
// Ratings & Reviews Services
// ----------------------------------------------------

export function subscribeReviews(
  onUpdate: (reviews: Review[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = 'reviews';
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const reviewsList: Review[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        reviewsList.push({
          id: d.id,
          providerId: data.providerId || '',
          providerType: (data.providerType as 'doctor' | 'lab') || 'doctor',
          providerName: data.providerName || '',
          patientName: data.patientName || '',
          patientPhone: data.patientPhone || undefined,
          bookingId: data.bookingId || undefined,
          bookingCode: data.bookingCode || undefined,
          rating: Number(data.rating || 5),
          comment: data.comment || '',
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      reviewsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(reviewsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveReviewToFirestore(review: Review): Promise<void> {
  const path = 'reviews';
  try {
    const docRef = doc(db, path, review.id);
    const dataToSave = {
      providerId: review.providerId,
      providerType: review.providerType,
      providerName: review.providerName,
      patientName: review.patientName,
      patientPhone: review.patientPhone || '',
      bookingId: review.bookingId || '',
      bookingCode: review.bookingCode || '',
      rating: Number(review.rating),
      comment: review.comment || '',
      createdAt: review.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });

    // Send instant notification about new review
    const starsText = '⭐'.repeat(Math.min(Math.max(review.rating, 1), 5));
    await createNotificationInFirestore({
      title: `🌟 تقييم جديد (${starsText}): ${review.providerName}`,
      body: `قام المريض ${review.patientName} بتقييم التجربة بـ ${review.rating} نجوم: "${review.comment.substring(0, 100)}"`,
      recipientType: review.providerType,
      recipientId: review.providerId,
      bookingCode: review.bookingCode,
      type: 'test'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${review.id}`);
  }
}

export async function deleteReviewFromFirestore(id: string): Promise<void> {
  const path = 'reviews';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ----------------------------------------------------
// Notifications & Firebase Cloud Messaging (FCM) Services
// ----------------------------------------------------

let fcmMessagingInstance: Messaging | null = null;

export async function getFirebaseMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (!supported) return null;
    if (!fcmMessagingInstance) {
      fcmMessagingInstance = getMessaging(app);
    }
    return fcmMessagingInstance;
  } catch (e) {
    console.warn('Firebase Messaging not supported:', e);
    return null;
  }
}

// Sound chime synthesizer (works without any external audio asset)
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Two-tone bell chime
    osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12); // C6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.log('Audio chime not ready yet:', e);
  }
}

// Trigger device system push notification and vibration using sendPushNotification
export async function triggerDevicePushNotification(
  title: string, 
  body: string, 
  data?: Record<string, unknown>
) {
  sendPushNotification(title, body);
}

// Subscribe to real-time notification stream from Firestore
export function subscribeNotifications(
  onUpdate: (notifications: NotificationItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'notifications';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || '',
          body: data.body || '',
          recipientType: (data.recipientType as RecipientType) || 'all',
          recipientId: data.recipientId || undefined,
          recipientPhone: data.recipientPhone || undefined,
          bookingId: data.bookingId || undefined,
          bookingCode: data.bookingCode || undefined,
          type: (data.type as NotificationType) || 'test',
          isRead: !!data.isRead,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

// Create new notification record in Firestore
export async function createNotificationInFirestore(item: {
  title: string;
  body: string;
  recipientType: RecipientType;
  recipientId?: string;
  recipientPhone?: string;
  bookingId?: string;
  bookingCode?: string;
  type: NotificationType;
}): Promise<void> {
  const path = 'notifications';
  try {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, path, notifId);
    const dataToSave = {
      title: item.title,
      body: item.body,
      recipientType: item.recipientType,
      recipientId: item.recipientId || '',
      recipientPhone: item.recipientPhone || '',
      bookingId: item.bookingId || '',
      bookingCode: item.bookingCode || '',
      type: item.type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Mark notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  const path = 'notifications';
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, { isRead: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

// Save device push subscription to Firestore
export async function savePushSubscriptionToFirestore(sub: PushSubscriptionProfile): Promise<void> {
  const path = 'push_subscriptions';
  try {
    const docRef = doc(db, path, sub.id);
    const dataToSave = {
      role: sub.role,
      targetId: sub.targetId || '',
      targetName: sub.targetName || '',
      phone: sub.phone || '',
      token: sub.token || '',
      permission: sub.permission,
      userAgent: sub.userAgent || '',
      createdAt: sub.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${sub.id}`);
  }
}

// Request and Register Push Notification Permission for Patient, Doctor, Lab, or Admin
export async function requestAndRegisterPushNotifications(profile: {
  role: 'patient' | 'doctor' | 'lab' | 'admin';
  targetId?: string;
  targetName?: string;
  phone?: string;
}): Promise<{ success: boolean; token?: string; error?: string }> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, error: 'المتصفح أو الجهاز لا يدعم الإشعارات' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'تم رفض إذن الإشعارات من إعدادات المتصفح' };
    }

    let token = '';
    const messaging = await getFirebaseMessagingInstance();
    if (messaging && 'serviceWorker' in navigator) {
      try {
        const swReg = await navigator.serviceWorker.ready;
        token = await getToken(messaging, {
          serviceWorkerRegistration: swReg
        });
      } catch (fcmErr) {
        console.warn('FCM token note:', fcmErr);
      }
    }

    const deviceId = localStorage.getItem('ehgz_device_id') || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('ehgz_device_id', deviceId);

    const subscriptionData: PushSubscriptionProfile = {
      id: deviceId,
      role: profile.role,
      targetId: profile.targetId || '',
      targetName: profile.targetName || '',
      phone: profile.phone || '',
      token: token || '',
      permission,
      userAgent: navigator.userAgent.substring(0, 200),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await savePushSubscriptionToFirestore(subscriptionData);
    localStorage.setItem('ehgz_push_profile', JSON.stringify(subscriptionData));

    // Send instant welcome confirmation push
    const roleArabic = 
      profile.role === 'doctor' ? `عيادة ${profile.targetName || 'الطبيب'}` :
      profile.role === 'lab' ? `معمل ${profile.targetName || 'التحاليل'}` :
      profile.role === 'admin' ? 'إدارة المنصة' : 'المريض';

    await triggerDevicePushNotification(
      '🎉 تم تفعيل الإشعارات الفورية بنجاح!',
      `تم ربط جهازك لاستلام إشعارات الحجوزات والمواعيد لحظياً لـ (${roleArabic}). ستصلك التنبيهات حتى والتطبيق في الخلفية.`
    );

    return { success: true, token };
  } catch (error) {
    console.error('Error enabling push notifications:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ----------------------------------------------------
// E-Prescriptions (الروشتات الطبية الإلكترونية)
// ----------------------------------------------------

export function subscribePrescriptions(
  onUpdate: (prescriptions: EPrescription[]) => void,
  patientPhoneFilter?: string,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'prescriptions';
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: EPrescription[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const rx: EPrescription = {
          id: docSnap.id,
          prescriptionCode: data.prescriptionCode || `RX-${docSnap.id.substring(0, 6)}`,
          bookingId: data.bookingId || undefined,
          bookingCode: data.bookingCode || undefined,
          patientName: data.patientName || '',
          patientPhone: data.patientPhone || '',
          doctorId: data.doctorId || '',
          doctorName: data.doctorName || '',
          doctorSpecialty: data.doctorSpecialty || '',
          doctorPhone: data.doctorPhone || '',
          clinicAddress: data.clinicAddress || '',
          diagnosis: data.diagnosis || '',
          medicines: Array.isArray(data.medicines) ? data.medicines : [],
          advice: data.advice || '',
          followUpDate: data.followUpDate || '',
          createdAt: data.createdAt || new Date().toISOString()
        };

        if (!patientPhoneFilter || !rx.patientPhone || rx.patientPhone.replace(/\D/g, '').includes(patientPhoneFilter.replace(/\D/g, ''))) {
          list.push(rx);
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function savePrescriptionToFirestore(rx: EPrescription): Promise<void> {
  const path = 'prescriptions';
  try {
    const docRef = doc(db, path, rx.id);
    const dataToSave = {
      prescriptionCode: rx.prescriptionCode,
      bookingId: rx.bookingId || '',
      bookingCode: rx.bookingCode || '',
      patientName: rx.patientName,
      patientPhone: rx.patientPhone,
      doctorId: rx.doctorId,
      doctorName: rx.doctorName,
      doctorSpecialty: rx.doctorSpecialty,
      doctorPhone: rx.doctorPhone || '',
      clinicAddress: rx.clinicAddress || '',
      diagnosis: rx.diagnosis,
      medicines: rx.medicines || [],
      advice: rx.advice || '',
      followUpDate: rx.followUpDate || '',
      createdAt: rx.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });

    // Send instant push notification to patient
    await triggerDevicePushNotification(
      `💊 تم إصدار روشتة طبية جديدة (${rx.prescriptionCode})`,
      `قام الدكتور ${rx.doctorName} (${rx.doctorSpecialty}) بإصدار روشتتك الطبية. يمكنك فتحها وتحميلها وطباعتها الآن من سجلك الطبي.`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${rx.id}`);
  }
}

export async function deletePrescriptionFromFirestore(id: string): Promise<void> {
  const path = 'prescriptions';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ----------------------------------------------------
// Medical Records & Attachments (السجل الطبي والفحوصات والأشعة)
// ----------------------------------------------------

export function subscribeMedicalRecords(
  onUpdate: (records: MedicalRecordAttachment[]) => void,
  patientPhoneFilter?: string,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'medical_records';
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: MedicalRecordAttachment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const item: MedicalRecordAttachment = {
          id: docSnap.id,
          patientPhone: data.patientPhone || '',
          patientName: data.patientName || '',
          title: data.title || 'فحص طبي',
          type: data.type || 'lab_test',
          fileUrl: data.fileUrl || '',
          fileName: data.fileName || 'file',
          fileType: data.fileType || 'image',
          fileSize: data.fileSize || '',
          doctorOrLabName: data.doctorOrLabName || '',
          date: data.date || '',
          notes: data.notes || '',
          createdAt: data.createdAt || new Date().toISOString()
        };

        if (!patientPhoneFilter || !item.patientPhone || item.patientPhone.replace(/\D/g, '').includes(patientPhoneFilter.replace(/\D/g, ''))) {
          list.push(item);
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

export async function saveMedicalRecordToFirestore(rec: MedicalRecordAttachment): Promise<void> {
  const path = 'medical_records';
  try {
    const docRef = doc(db, path, rec.id);
    const dataToSave = {
      patientPhone: rec.patientPhone,
      patientName: rec.patientName,
      title: rec.title,
      type: rec.type,
      fileUrl: rec.fileUrl,
      fileName: rec.fileName,
      fileType: rec.fileType,
      fileSize: rec.fileSize || '',
      doctorOrLabName: rec.doctorOrLabName || '',
      date: rec.date || new Date().toISOString().split('T')[0],
      notes: rec.notes || '',
      createdAt: rec.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });

    // Send push notification
    await triggerDevicePushNotification(
      '📎 تم حفظ المستند الطبي بنجاح',
      `تمت إضافة "${rec.title}" إلى سجلك الطبي الإلكتروني.`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${rec.id}`);
  }
}

export async function deleteMedicalRecordFromFirestore(id: string): Promise<void> {
  const path = 'medical_records';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}
