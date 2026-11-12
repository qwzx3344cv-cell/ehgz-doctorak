export type ProviderStatus = 'approved' | 'pending' | 'rejected' | 'blocked';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone1: string;
  phone2?: string;
  address: string;
  governorate?: string;
  city?: string;
  center?: string;
  price: number;
  clinicPhoto?: string;
  doctorPhoto?: string;
  workingHours?: string;
  isDemo?: boolean;
  status: ProviderStatus;
  otpCode?: string;
  isVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
  googleMapsUrl?: string;
  createdAt: string;
}

export interface LabTestItem {
  id: string;
  name: string;
  price: number;
}

export interface Lab {
  id: string;
  name: string;
  phone: string;
  address: string;
  governorate?: string;
  city?: string;
  center?: string;
  labPhoto?: string;
  tests: LabTestItem[];
  startingPrice: number;
  workingHours?: string;
  isDemo?: boolean;
  status: ProviderStatus;
  otpCode?: string;
  isVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
  googleMapsUrl?: string;
  createdAt: string;
}

export interface ProviderSession {
  id: string;
  providerType: 'doctor' | 'lab';
  name: string;
  phone: string;
  specialtyOrType?: string;
  authenticatedAt: string;
}

export interface PlatformSettings {
  isCommissionEnabled: boolean;
  commissionRate: number; // default 12%
  updatedAt?: string;
}

export interface Review {
  id: string;
  providerId: string;
  providerType: 'doctor' | 'lab';
  providerName: string;
  patientName: string;
  patientPhone?: string;
  bookingId?: string;
  bookingCode?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingCode: string;
  providerType: 'doctor' | 'lab';
  providerId: string;
  providerName: string;
  providerSpecialtyOrType: string;
  providerAddress: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime?: string;
  selectedTestName?: string;
  price: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

export type NotificationType = 'new_booking' | 'booking_confirmed' | 'booking_cancelled' | 'test';
export type RecipientType = 'patient' | 'doctor' | 'lab' | 'admin' | 'all';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  recipientType: RecipientType;
  recipientId?: string;
  recipientPhone?: string;
  bookingId?: string;
  bookingCode?: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export type NotificationRole = 'patient' | 'doctor' | 'lab' | 'admin';

export interface PushSubscriptionProfile {
  id: string;
  role: NotificationRole;
  targetId?: string;
  targetName?: string;
  phone?: string;
  token?: string;
  permission: NotificationPermission;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  duration?: string;
  notes?: string;
}

export interface EPrescription {
  id: string;
  prescriptionCode: string;
  bookingId?: string;
  bookingCode?: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPhone?: string;
  clinicAddress?: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  advice?: string;
  followUpDate?: string;
  createdAt: string;
}

export type MedicalAttachmentType = 'lab_test' | 'x_ray' | 'prescription' | 'report' | 'other';

export interface MedicalRecordAttachment {
  id: string;
  patientPhone: string;
  patientName: string;
  title: string;
  type: MedicalAttachmentType;
  fileUrl: string; // Base64 data URL or external URL
  fileName: string;
  fileType: 'image' | 'pdf';
  fileSize?: string;
  doctorOrLabName?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

declare global {
  interface Window {
    sendPushNotification?: (title: string, bodyText: string) => void;
  }
}
