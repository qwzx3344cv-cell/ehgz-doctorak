import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  FlaskConical, 
  Plus,
  WifiOff,
  BellRing,
  X,
  Radio,
  Bot,
  Sparkles,
  MessageSquare,
  Mic
} from 'lucide-react';
import { Medical3DScene } from './components/Medical3DScene';
import { GeminiLiveVoiceModal } from './components/GeminiLiveVoiceModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { 
  Doctor, 
  Lab, 
  LabTestItem, 
  Booking, 
  BookingStatus, 
  NotificationItem, 
  Review,
  ProviderSession,
  PlatformSettings,
  EPrescription,
  MedicalRecordAttachment
} from './types';
import { STORAGE_KEYS, DEFAULT_COMMISSION_RATE } from './constants';
import { usePWAInstall } from './hooks/usePWAInstall';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { PWAInstallSection } from './components/PWAInstallSection';
import { SearchAndFilters, SortOption, PriceFilter, ProviderTypeView } from './components/SearchAndFilters';
import { DoctorCard } from './components/DoctorCard';
import { SkeletonGrid } from './components/SkeletonCard';
import { useDarkMode } from './hooks/useDarkMode';
import { 
  isProviderAvailableToday, 
  getProviderAverageRating, 
  matchesSpecialty 
} from './utils/filterHelpers';
import { LabCard } from './components/LabCard';
import { BookingModal } from './components/BookingModal';
import { DoctorRegisterModal } from './components/DoctorRegisterModal';
import { LabRegisterModal } from './components/LabRegisterModal';
import { AdminPanel } from './components/AdminPanel';
import { PatientBookingsModal } from './components/PatientBookingsModal';
import { MedicalRecordsModal } from './components/MedicalRecordsModal';
import { PrescriptionPrintModal } from './components/PrescriptionPrintModal';
import { PWAInstallGuideModal } from './components/PWAInstallGuideModal';
import { NotificationManagerModal } from './components/NotificationManagerModal';
import { ReviewModal } from './components/ReviewModal';
import { ProviderReviewsModal } from './components/ProviderReviewsModal';
import { ProviderLoginModal } from './components/ProviderLoginModal';
import { ProviderPortalModal } from './components/ProviderPortalModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Footer } from './components/Footer';

import { 
  testFirestoreConnection,
  subscribeDoctors, 
  saveDoctorToFirestore, 
  updateDoctorStatusInFirestore, 
  deleteDoctorFromFirestore,
  updateDoctorInFirestore,
  blockDoctorInFirestore,
  unblockDoctorInFirestore,
  subscribeLabs, 
  saveLabToFirestore, 
  updateLabStatusInFirestore, 
  deleteLabFromFirestore,
  updateLabInFirestore,
  blockLabInFirestore,
  unblockLabInFirestore,
  subscribeBookings, 
  saveBookingToFirestore, 
  updateBookingStatusInFirestore, 
  deleteBookingFromFirestore,
  subscribeNotifications,
  triggerDevicePushNotification,
  subscribeReviews,
  saveReviewToFirestore,
  sendProviderApprovalWithOTP,
  subscribePlatformSettings,
  savePlatformSettingsInFirestore,
  subscribePrescriptions,
  savePrescriptionToFirestore,
  deletePrescriptionFromFirestore,
  subscribeMedicalRecords,
  saveMedicalRecordToFirestore,
  deleteMedicalRecordFromFirestore
} from './firebase';

export default function App() {
  // Dark Mode Hook
  const { isDark, toggleDarkMode } = useDarkMode();

  // Skeleton Loader State during initial data fetch
  const [isLoadingData, setIsLoadingData] = useState(true);

  // PWA Hook
  const { isInstallable, isInstalled, isIOS, isStandalone, promptInstall } = usePWAInstall();

  // Network Online status
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Main Data States - strictly empty array [] by default, synchronized in real time with Firestore
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Provider Session & Auth State (Persisted in localStorage)
  const [providerSession, setProviderSession] = useState<ProviderSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROVIDER_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [providerLoginModalOpen, setProviderLoginModalOpen] = useState(false);
  const [providerPortalModalOpen, setProviderPortalModalOpen] = useState(false);

  // Platform Commission Settings (12% ON/OFF toggle)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    isCommissionEnabled: true,
    commissionRate: DEFAULT_COMMISSION_RATE
  });

  // Push Notification Prompt Banner State
  const [showPushPromptBanner, setShowPushPromptBanner] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Reviews & Rating Modals State
  const [providerReviewsModalOpen, setProviderReviewsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProviderForReview, setSelectedProviderForReview] = useState<Doctor | Lab | null>(null);
  const [selectedProviderTypeForReview, setSelectedProviderTypeForReview] = useState<'doctor' | 'lab'>('doctor');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  // E-Prescriptions & Medical Records State
  const [prescriptions, setPrescriptions] = useState<EPrescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordAttachment[]>([]);
  const [medicalRecordsModalOpen, setMedicalRecordsModalOpen] = useState(false);
  const [activePrescriptionForPrint, setActivePrescriptionForPrint] = useState<EPrescription | null>(null);

  // Gemini AI Modals State (Live Voice & Chatbot)
  const [geminiLiveVoiceOpen, setGeminiLiveVoiceOpen] = useState(false);
  const [geminiChatOpen, setGeminiChatOpen] = useState(false);

  // Connect to Firestore and subscribe to real-time updates for doctors, labs, bookings, notifications, reviews, and records
  useEffect(() => {
    testFirestoreConnection();

    let docsLoaded = false;
    let labsLoaded = false;

    const checkFinishedLoading = () => {
      if (docsLoaded && labsLoaded) {
        setIsLoadingData(false);
      }
    };

    // Safety fallback so skeletons don't stay forever if database is empty or offline
    const safetyTimer = setTimeout(() => {
      setIsLoadingData(false);
    }, 1200);

    // Subscribe to doctors in real-time
    const unsubDoctors = subscribeDoctors((firebaseDoctors) => {
      setDoctors(firebaseDoctors);
      docsLoaded = true;
      checkFinishedLoading();
    });

    // Subscribe to labs in real-time
    const unsubLabs = subscribeLabs((firebaseLabs) => {
      setLabs(firebaseLabs);
      labsLoaded = true;
      checkFinishedLoading();
    });

    // Subscribe to bookings in real-time
    const unsubBookings = subscribeBookings((firebaseBookings) => {
      setBookings(firebaseBookings);
    });

    // Subscribe to notifications in real-time
    const unsubNotifications = subscribeNotifications((notifList) => {
      setNotifications((prev) => {
        // If there's a new incoming notification while app is running, play chime and trigger push notification
        if (prev.length > 0 && notifList.length > prev.length) {
          const newest = notifList[0];
          triggerDevicePushNotification(newest.title, newest.body, { bookingCode: newest.bookingCode });
        }
        return notifList;
      });
    });

    // Subscribe to reviews in real-time
    const unsubReviews = subscribeReviews((firebaseReviews) => {
      setReviews(firebaseReviews);
    });

    // Subscribe to platform settings (commission 12% toggle)
    const unsubSettings = subscribePlatformSettings((settings) => {
      setPlatformSettings(settings);
    });

    // Subscribe to prescriptions in real-time
    const unsubPrescriptions = subscribePrescriptions((firebasePrescriptions) => {
      setPrescriptions(firebasePrescriptions);
    });

    // Subscribe to medical records in real-time
    const unsubMedicalRecords = subscribeMedicalRecords((firebaseRecords) => {
      setMedicalRecords(firebaseRecords);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubDoctors();
      unsubLabs();
      unsubBookings();
      unsubNotifications();
      unsubReviews();
      unsubSettings();
      unsubPrescriptions();
      unsubMedicalRecords();
    };
  }, []);

  // Check if push notifications need activation prompt
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => {
          setShowPushPromptBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Clear legacy cached keys to ensure interface is clean
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DOCTORS);
      localStorage.removeItem(STORAGE_KEYS.LABS);
      localStorage.removeItem('ehgz_doctors_data_clean');
      localStorage.removeItem('ehgz_doctors_data_v3');
      localStorage.removeItem('ehgz_doctors_data_v2');
      localStorage.removeItem('ehgz_labs_data_clean');
      localStorage.removeItem('ehgz_labs_data_v3');
      localStorage.removeItem('ehgz_labs_data_v2');
    } catch (e) {
      console.log('Error clearing legacy keys:', e);
    }
  }, []);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [providerTypeView, setProviderTypeView] = useState<ProviderTypeView>('all');
  const [activeSection, setActiveSection] = useState<'doctors' | 'labs'>('doctors');

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSelectedGovernorate('');
    setSelectedCenter('');
    setSortBy('recommended');
    setPriceFilter('all');
    setMinRating(0);
    setOnlyAvailableToday(false);
    setProviderTypeView('all');
  };

  // Modals State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<Doctor | Lab | null>(null);
  const [selectedProviderType, setSelectedProviderType] = useState<'doctor' | 'lab'>('doctor');
  const [selectedInitialTest, setSelectedInitialTest] = useState<LabTestItem | undefined>(undefined);

  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [myBookingsModalOpen, setMyBookingsModalOpen] = useState(false);

  const [pwaGuideModalOpen, setPwaGuideModalOpen] = useState(false);
  const [pwaGuidePlatform, setPwaGuidePlatform] = useState<'android' | 'ios'>('android');

  // Section Refs
  const doctorsSectionRef = useRef<HTMLDivElement>(null);
  const labsSectionRef = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters on load for ?admin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setAdminModalOpen(true);
    }
  }, []);

  // Navigation handlers
  const handleNavigateSection = (section: 'doctors' | 'labs') => {
    setActiveSection(section);
    if (section === 'doctors' && doctorsSectionRef.current) {
      doctorsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'labs' && labsSectionRef.current) {
      labsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSearch = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Booking triggers
  const handleOpenBookingDoctor = (doctor: Doctor) => {
    setSelectedProviderForBooking(doctor);
    setSelectedProviderType('doctor');
    setSelectedInitialTest(undefined);
    setBookingModalOpen(true);
  };

  const handleOpenBookingLab = (lab: Lab, test?: LabTestItem) => {
    setSelectedProviderForBooking(lab);
    setSelectedProviderType('lab');
    setSelectedInitialTest(test);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = async (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    try {
      await saveBookingToFirestore(newBooking);
    } catch (e) {
      console.error('Failed to save booking to Firestore:', e);
    }
  };

  // Reviews & Rating triggers
  const handleOpenDoctorReviews = (doctor: Doctor) => {
    setSelectedProviderForReview(doctor);
    setSelectedProviderTypeForReview('doctor');
    setProviderReviewsModalOpen(true);
  };

  const handleOpenLabReviews = (lab: Lab) => {
    setSelectedProviderForReview(lab);
    setSelectedProviderTypeForReview('lab');
    setProviderReviewsModalOpen(true);
  };

  const handleOpenRateBooking = (booking: Booking) => {
    const provider = booking.providerType === 'doctor'
      ? doctors.find((d) => d.id === booking.providerId) || ({
          id: booking.providerId,
          name: booking.providerName,
          specialty: booking.providerSpecialtyOrType,
          price: booking.price,
          address: booking.providerAddress,
          phone1: '',
          status: 'approved',
          createdAt: ''
        } as Doctor)
      : labs.find((l) => l.id === booking.providerId) || ({
          id: booking.providerId,
          name: booking.providerName,
          address: booking.providerAddress,
          phone: '',
          startingPrice: booking.price,
          tests: [],
          status: 'approved',
          createdAt: ''
        } as Lab);

    setSelectedProviderForReview(provider);
    setSelectedProviderTypeForReview(booking.providerType);
    setSelectedBookingForReview(booking);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    try {
      await saveReviewToFirestore(newReview);
    } catch (e) {
      console.error('Failed to save review to Firestore:', e);
    }
  };

  // Registration handlers
  const handleRegisterDoctor = async (newDoc: Doctor) => {
    setDoctors((prev) => [newDoc, ...prev]);
    try {
      await saveDoctorToFirestore(newDoc);
    } catch (e) {
      console.error('Failed to save doctor to Firestore:', e);
    }
  };

  const handleRegisterLab = async (newLab: Lab) => {
    setLabs((prev) => [newLab, ...prev]);
    try {
      await saveLabToFirestore(newLab);
    } catch (e) {
      console.error('Failed to save lab to Firestore:', e);
    }
  };

  // Provider Session Handlers
  const handleProviderLoginSuccess = (session: ProviderSession) => {
    setProviderSession(session);
    setProviderLoginModalOpen(false);
    setProviderPortalModalOpen(true);
  };

  const handleProviderLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.PROVIDER_SESSION);
    setProviderSession(null);
    setProviderPortalModalOpen(false);
  };

  const handleUpdateDoctorProfile = async (id: string, updates: Partial<Doctor>) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
    try {
      await updateDoctorInFirestore(id, updates);
    } catch (e) {
      console.error('Failed to update doctor profile:', e);
    }
  };

  const handleUpdateLabProfile = async (id: string, updates: Partial<Lab>) => {
    setLabs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
    try {
      await updateLabInFirestore(id, updates);
    } catch (e) {
      console.error('Failed to update lab profile:', e);
    }
  };

  // Commission Toggle Handler (12% ON/OFF)
  const handleToggleCommission = async (enabled: boolean) => {
    const updated: PlatformSettings = {
      isCommissionEnabled: enabled,
      commissionRate: DEFAULT_COMMISSION_RATE,
      updatedAt: new Date().toISOString()
    };
    setPlatformSettings(updated);
    try {
      await savePlatformSettingsInFirestore(updated);
    } catch (e) {
      console.error('Failed to update platform commission settings:', e);
    }
  };

  // Admin moderation handlers with OTP & Welcome Alert dispatch
  const handleApproveDoctor = async (id: string) => {
    const doctor = doctors.find((d) => d.id === id);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: 'approved', isVerified: true, otpCode: otp } : doc))
    );
    try {
      await updateDoctorStatusInFirestore(id, 'approved', { otpCode: otp, isVerified: true });
      if (doctor) {
        await sendProviderApprovalWithOTP(doctor, 'doctor', otp);
      }
    } catch (e) {
      console.error('Failed to update doctor status in Firestore:', e);
    }
  };

  const handleRejectDoctor = async (id: string) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: 'rejected' } : doc))
    );
    try {
      await updateDoctorStatusInFirestore(id, 'rejected');
    } catch (e) {
      console.error('Failed to update doctor status in Firestore:', e);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
      try {
        await deleteDoctorFromFirestore(id);
      } catch (e) {
        console.error('Failed to delete doctor from Firestore:', e);
      }
    }
  };

  const handleBlockDoctor = async (id: string) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: 'blocked' } : doc))
    );
    try {
      await blockDoctorInFirestore(id);
    } catch (e) {
      console.error('Failed to block doctor in Firestore:', e);
    }
  };

  const handleUnblockDoctor = async (id: string) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: 'approved' } : doc))
    );
    try {
      await unblockDoctorInFirestore(id);
    } catch (e) {
      console.error('Failed to unblock doctor in Firestore:', e);
    }
  };

  const handleApproveLab = async (id: string) => {
    const lab = labs.find((l) => l.id === id);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    setLabs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved', isVerified: true, otpCode: otp } : l))
    );
    try {
      await updateLabStatusInFirestore(id, 'approved', { otpCode: otp, isVerified: true });
      if (lab) {
        await sendProviderApprovalWithOTP(lab, 'lab', otp);
      }
    } catch (e) {
      console.error('Failed to update lab status in Firestore:', e);
    }
  };

  const handleRejectLab = async (id: string) => {
    setLabs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l))
    );
    try {
      await updateLabStatusInFirestore(id, 'rejected');
    } catch (e) {
      console.error('Failed to update lab status in Firestore:', e);
    }
  };

  const handleDeleteLab = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المعمل؟')) {
      setLabs((prev) => prev.filter((l) => l.id !== id));
      try {
        await deleteLabFromFirestore(id);
      } catch (e) {
        console.error('Failed to delete lab from Firestore:', e);
      }
    }
  };

  const handleBlockLab = async (id: string) => {
    setLabs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'blocked' } : l))
    );
    try {
      await blockLabInFirestore(id);
    } catch (e) {
      console.error('Failed to block lab in Firestore:', e);
    }
  };

  const handleUnblockLab = async (id: string) => {
    setLabs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l))
    );
    try {
      await unblockLabInFirestore(id);
    } catch (e) {
      console.error('Failed to unblock lab in Firestore:', e);
    }
  };

  const handleAddDoctorDirectly = async (newDoc: Doctor) => {
    setDoctors((prev) => [newDoc, ...prev]);
    try {
      await saveDoctorToFirestore(newDoc);
      if (newDoc.otpCode) {
        await sendProviderApprovalWithOTP(newDoc, 'doctor', newDoc.otpCode);
      }
    } catch (e) {
      console.error('Failed to add doctor directly:', e);
    }
  };

  const handleAddLabDirectly = async (newLab: Lab) => {
    setLabs((prev) => [newLab, ...prev]);
    try {
      await saveLabToFirestore(newLab);
      if (newLab.otpCode) {
        await sendProviderApprovalWithOTP(newLab, 'lab', newLab.otpCode);
      }
    } catch (e) {
      console.error('Failed to add lab directly:', e);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus, bookingObj?: Booking) => {
    const targetBooking = bookingObj || bookings.find((b) => b.id === id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    try {
      await updateBookingStatusInFirestore(id, status, targetBooking);
    } catch (e) {
      console.error('Failed to update booking status in Firestore:', e);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      try {
        await deleteBookingFromFirestore(id);
      } catch (e) {
        console.error('Failed to delete booking from Firestore:', e);
      }
    }
  };

  const handleCancelBooking = async (id: string) => {
    const targetBooking = bookings.find((b) => b.id === id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );
    try {
      await updateBookingStatusInFirestore(id, 'cancelled', targetBooking);
    } catch (e) {
      console.error('Failed to cancel booking in Firestore:', e);
    }
  };

  // Reset database completely empty
  const handleResetSeedData = async () => {
    if (confirm('هل أنت متأكد من إفراغ قاعدة البيانات تماماً؟')) {
      try {
        for (const docItem of doctors) {
          await deleteDoctorFromFirestore(docItem.id);
        }
        for (const labItem of labs) {
          await deleteLabFromFirestore(labItem.id);
        }
        for (const b of bookings) {
          await deleteBookingFromFirestore(b.id);
        }
        setDoctors([]);
        setLabs([]);
        setBookings([]);
        alert('تم إفراغ قاعدة البيانات بنجاح!');
      } catch (e) {
        console.error('Error emptying database:', e);
        alert('حدث خطأ أثناء التفريغ');
      }
    }
  };

  // Approved lists for visitors
  const approvedDoctors = doctors.filter((d) => d.status === 'approved');
  const approvedLabs = labs.filter((l) => l.status === 'approved');

  // Filtered Doctors
  const filteredDoctors = approvedDoctors
    .filter((doc) => {
      // 0. Provider Type view (if user chose labs only)
      if (providerTypeView === 'labs') return false;

      // 1. Specialty Filter
      if (activeFilter !== 'all' && activeFilter !== 'تحاليل طبية') {
        if (!matchesSpecialty(doc.specialty, activeFilter)) return false;
      }
      if (activeFilter === 'تحاليل طبية') return false;

      // 2. Governorate Filter
      if (selectedGovernorate) {
        const matchGov =
          doc.governorate === selectedGovernorate ||
          (doc.address && doc.address.includes(selectedGovernorate)) ||
          (doc.city && doc.city.includes(selectedGovernorate));
        if (!matchGov) return false;
      }

      // 3. Center Filter
      if (selectedCenter) {
        const matchCenter =
          doc.center === selectedCenter ||
          doc.city === selectedCenter ||
          (doc.address && doc.address.includes(selectedCenter));
        if (!matchCenter) return false;
      }

      // 4. Available Today Filter
      if (onlyAvailableToday || sortBy === 'available_today') {
        if (!isProviderAvailableToday(doc.workingHours)) return false;
      }

      // 5. Price Filter
      if (priceFilter === 'under_200' && doc.price >= 200) return false;
      if (priceFilter === '200_to_350' && (doc.price < 200 || doc.price > 350)) return false;
      if (priceFilter === 'above_350' && doc.price <= 350) return false;

      // 6. Minimum Rating Filter
      if (minRating > 0) {
        const avg = getProviderAverageRating(doc.id, doc.rating, reviews);
        if (avg < minRating) return false;
      }

      // 7. Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(term);
        const matchSpecialty = doc.specialty.toLowerCase().includes(term);
        const matchAddress = doc.address.toLowerCase().includes(term);
        const matchGov = doc.governorate?.toLowerCase().includes(term);
        const matchCenter = doc.center?.toLowerCase().includes(term);
        return matchName || matchSpecialty || matchAddress || matchGov || matchCenter;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'highest_rated') {
        const ratingA = getProviderAverageRating(a.id, a.rating, reviews);
        const ratingB = getProviderAverageRating(b.id, b.rating, reviews);
        return ratingB - ratingA;
      }
      if (sortBy === 'lowest_price') {
        return a.price - b.price;
      }
      if (sortBy === 'highest_price') {
        return b.price - a.price;
      }
      if (sortBy === 'available_today') {
        const availA = isProviderAvailableToday(a.workingHours) ? 1 : 0;
        const availB = isProviderAvailableToday(b.workingHours) ? 1 : 0;
        return availB - availA;
      }
      // 'recommended': highest rating first
      const ratingA = getProviderAverageRating(a.id, a.rating, reviews);
      const ratingB = getProviderAverageRating(b.id, b.rating, reviews);
      return ratingB - ratingA;
    });

  // Filtered Labs
  const filteredLabs = approvedLabs
    .filter((lab) => {
      // 0. Provider Type view (if user chose doctors only)
      if (providerTypeView === 'doctors') return false;

      // 1. Specialty Filter (labs only match 'all' or 'تحاليل طبية')
      if (activeFilter !== 'all' && activeFilter !== 'تحاليل طبية') {
        return false;
      }

      // 2. Governorate Filter
      if (selectedGovernorate) {
        const matchGov =
          lab.governorate === selectedGovernorate ||
          (lab.address && lab.address.includes(selectedGovernorate)) ||
          (lab.city && lab.city.includes(selectedGovernorate));
        if (!matchGov) return false;
      }

      // 3. Center Filter
      if (selectedCenter) {
        const matchCenter =
          lab.center === selectedCenter ||
          lab.city === selectedCenter ||
          (lab.address && lab.address.includes(selectedCenter));
        if (!matchCenter) return false;
      }

      // 4. Available Today Filter
      if (onlyAvailableToday || sortBy === 'available_today') {
        if (!isProviderAvailableToday(lab.workingHours)) return false;
      }

      // 5. Price Filter (based on startingPrice)
      if (priceFilter === 'under_200' && lab.startingPrice >= 200) return false;
      if (priceFilter === '200_to_350' && (lab.startingPrice < 200 || lab.startingPrice > 350)) return false;
      if (priceFilter === 'above_350' && lab.startingPrice <= 350) return false;

      // 6. Minimum Rating Filter
      if (minRating > 0) {
        const avg = getProviderAverageRating(lab.id, lab.rating, reviews);
        if (avg < minRating) return false;
      }

      // 7. Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = lab.name.toLowerCase().includes(term);
        const matchAddress = lab.address.toLowerCase().includes(term);
        const matchGov = lab.governorate?.toLowerCase().includes(term);
        const matchCenter = lab.center?.toLowerCase().includes(term);
        const matchTest = lab.tests?.some((t) => t.name.toLowerCase().includes(term));
        return matchName || matchAddress || matchGov || matchCenter || matchTest;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'highest_rated') {
        const ratingA = getProviderAverageRating(a.id, a.rating, reviews);
        const ratingB = getProviderAverageRating(b.id, b.rating, reviews);
        return ratingB - ratingA;
      }
      if (sortBy === 'lowest_price') {
        return a.startingPrice - b.startingPrice;
      }
      if (sortBy === 'highest_price') {
        return b.startingPrice - a.startingPrice;
      }
      if (sortBy === 'available_today') {
        const availA = isProviderAvailableToday(a.workingHours) ? 1 : 0;
        const availB = isProviderAvailableToday(b.workingHours) ? 1 : 0;
        return availB - availA;
      }
      const ratingA = getProviderAverageRating(a.id, a.rating, reviews);
      const ratingB = getProviderAverageRating(b.id, b.rating, reviews);
      return ratingB - ratingA;
    });

  // PWA Install buttons click
  const handleAndroidInstallClick = () => {
    if (isInstallable) {
      promptInstall();
    } else {
      setPwaGuidePlatform('android');
      setPwaGuideModalOpen(true);
    }
  };

  const handleIOSInstallClick = () => {
    setPwaGuidePlatform('ios');
    setPwaGuideModalOpen(true);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b1320] text-[#0f2a44] dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200" dir="rtl">
      
      {/* Offline Toast */}
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>أنت تعمل حالياً في وضع عدم الاتصال بالإنترنت (Offline Mode). التطبيق محفوظ وسيعمل بشكل طبيعي.</span>
        </div>
      )}

      {/* Push Notification Activation Prompt Banner */}
      {showPushPromptBanner && (
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-[#0f2a44] text-white px-4 py-2.5 border-b border-teal-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 text-teal-300 animate-pulse" />
            </div>
            <div className="text-xs">
              <span className="font-black text-teal-300 ml-1">فعّل إشعارات الهاتف الفورية:</span>
              <span className="text-slate-200">لتصلك تنبيهات الحجز الجديدة وقبول المواعيد لحظياً حتى والتطبيق مغلق!</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mr-auto sm:mr-0">
            <button
              onClick={() => {
                setShowPushPromptBanner(false);
                setNotificationModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-xs"
            >
              تفعيل الإشعارات الآن
            </button>
            <button
              onClick={() => setShowPushPromptBanner(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenDoctorModal={() => setDoctorModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenMyBookings={() => setMyBookingsModalOpen(true)}
        onOpenMedicalRecords={() => setMedicalRecordsModalOpen(true)}
        recordsCount={prescriptions.length + medicalRecords.length}
        onOpenNotifications={() => setNotificationModalOpen(true)}
        bookingsCount={bookings.length}
        unreadNotificationsCount={unreadNotificationsCount}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
        providerSession={providerSession}
        onOpenProviderLogin={() => setProviderLoginModalOpen(true)}
        onOpenProviderPortal={() => setProviderPortalModalOpen(true)}
        onOpenLiveVoice={() => setGeminiLiveVoiceOpen(true)}
        onOpenChatbot={() => setGeminiChatOpen(true)}
      />

      <main className="flex-1">
        
        {/* Hero Banner with Doctor holding phone image and 3 benefit badges */}
        <HeroBanner
          onExploreClick={scrollToSearch}
          onOpenDoctorModal={() => setDoctorModalOpen(true)}
          onTriggerInstall={handleAndroidInstallClick}
        />

        {/* 3D Medical Scene & Dual AI Command Center */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          
          {/* Main Title & Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-extrabold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>مركز الذكاء الاصطناعي والمشاهد ثلاثية الأبعاد</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0f2a44] dark:text-white tracking-tight">
                استشر طبيبك الذكي وتفاعل مع المنظومة
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              خدمات استشارية صوتية وكتابية فورية على مدار الساعة
            </p>
          </div>

          {/* TWO PROMINENT SEPARATE BUTTONS (Requested explicitly by User) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            
            {/* Button 1: Gemini Live Real-Time Voice Conversation */}
            <div className="relative group overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-teal-950 via-[#0f2a44] to-slate-900 text-white shadow-xl border-2 border-teal-500/40 hover:border-teal-400 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center text-teal-300 shadow-inner group-hover:scale-105 transition-transform">
                    <Radio className="w-8 h-8 text-teal-300 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500/30 text-teal-200 border border-teal-400/40">
                      Gemini Live API
                    </span>
                    <span className="text-[11px] text-teal-300/80 mt-1 font-semibold">محادثة صوتية فورية</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-5">
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <span>المحادثة الصوتية المباشرة</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/40 font-bold">
                      صوتي
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    تحدث بصوتك مباشرة مع طبيبك الذكي لتشخيص الأعراض ومعرفة التخصص المناسب والفحوصات في ثوانٍ.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGeminiLiveVoiceOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="w-5 h-5 text-slate-950 animate-bounce" />
                <span>الزر الأول: فتح المحادثة الصوتية (Gemini Live)</span>
              </button>
            </div>

            {/* Button 2: Gemini AI Chatbot */}
            <div className="relative group overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-blue-950 via-[#0f2a44] to-slate-900 text-white shadow-xl border-2 border-blue-500/40 hover:border-blue-400 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-300 shadow-inner group-hover:scale-105 transition-transform">
                    <Bot className="w-8 h-8 text-blue-300" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/30 text-blue-200 border border-blue-400/40">
                      Gemini 3.8 Flash
                    </span>
                    <span className="text-[11px] text-blue-300/80 mt-1 font-semibold">استشارة وتوجيه كتابي</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-5">
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <span>مساعد روبوت المحادثة الذكي</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/40 font-bold">
                      شات ذكي
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    اكتب أي استفسار طبي أو عن تحاليل المعامل للحصول على إرشاد موثوق ومساعدتك في اختيار الطبيب المناسب.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGeminiChatOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-white" />
                <span>الزر الثاني: فتح مساعد المحادثة الذكي (Gemini)</span>
              </button>
            </div>

          </div>

          {/* Three.js 3D Interactive Medical Scene (Runs and auto-animates immediately upon app launch) */}
          <Medical3DScene
            isDarkMode={isDark}
            onOpenLiveVoice={() => setGeminiLiveVoiceOpen(true)}
            onOpenChatbot={() => setGeminiChatOpen(true)}
          />

        </section>

        {/* PWA Install Section ("رعايتك الصحية.. معاك في كل مكان" + 2 dark buttons) */}
        <PWAInstallSection
          onAndroidClick={handleAndroidInstallClick}
          onIOSClick={handleIOSInstallClick}
          isStandalone={isStandalone}
        />

        {/* Search & Quick Filters Section */}
        <div ref={searchSectionRef}>
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            selectedGovernorate={selectedGovernorate}
            onGovernorateChange={setSelectedGovernorate}
            selectedCenter={selectedCenter}
            onCenterChange={setSelectedCenter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            priceFilter={priceFilter}
            onPriceFilterChange={setPriceFilter}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            onlyAvailableToday={onlyAvailableToday}
            onOnlyAvailableTodayToggle={() => setOnlyAvailableToday((prev) => !prev)}
            providerTypeView={providerTypeView}
            onProviderTypeViewChange={setProviderTypeView}
            doctorsCount={filteredDoctors.length}
            labsCount={filteredLabs.length}
            onResetAllFilters={handleResetAllFilters}
            onSearchSubmit={() => {
              if ((activeFilter === 'تحاليل طبية' || providerTypeView === 'labs') && labsSectionRef.current) {
                labsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              } else if (doctorsSectionRef.current) {
                doctorsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </div>

        {/* DOCTORS SECTION ("اختار دكتورك") */}
        {providerTypeView !== 'labs' && activeFilter !== 'تحاليل طبية' && (
          <section 
            ref={doctorsSectionRef}
            className="w-full py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-xs mb-1">
                  <Stethoscope className="w-4 h-4 text-[#0d9488]" />
                  <span>العيادات التخصصية</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0f2a44] dark:text-white tracking-tight flex items-center gap-2.5">
                  <span>اختار دكتورك</span>
                  <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 font-black">
                    ({isLoadingData ? '...' : filteredDoctors.length} عيادة)
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  التخصص المناسب والسعر واضح من البداية مع الترتيب والفلترة الدقيقة.
                </p>
              </div>

              {/* Top Left Action Button ("أضف عيادتك") */}
              <button
                onClick={() => setDoctorModalOpen(true)}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0f2a44] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-teal-400 dark:text-white" />
                <span>أضف عيادتك</span>
              </button>
            </div>

            {/* Doctors Grid */}
            {isLoadingData ? (
              <SkeletonGrid count={6} type="doctor" />
            ) : approvedDoctors.length === 0 ? (
              <div className="py-14 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 mx-auto flex items-center justify-center border border-teal-100 dark:border-teal-800">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg sm:text-xl font-black text-[#0f2a44] dark:text-white">
                    لا يوجد أطباء مسجلون حاليا
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    كن أول من يضيف عيادته من زر أضف عيادتك
                  </p>
                </div>
                <button
                  onClick={() => setDoctorModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>أضف عيادتك</span>
                </button>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="py-12 text-center text-slate-400 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <Stethoscope className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-base">لا توجد عيادات تطابق معايير البحث والفلترة المحددة</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">جرب تغيير السعر، الترتيب، التخصص أو المحافظة</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-colors"
                >
                  <span>إعادة ضبط جميع الفلاتر</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onBook={handleOpenBookingDoctor}
                    reviews={reviews}
                    onViewReviews={handleOpenDoctorReviews}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* LABS SECTION ("معامل التحاليل") */}
        {providerTypeView !== 'doctors' && (
          <section 
            ref={labsSectionRef}
            className="w-full py-12 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 transition-colors"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-xs mb-1">
                    <FlaskConical className="w-4 h-4 text-[#0d9488]" />
                    <span>الفحوصات والتحاليل</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#0f2a44] dark:text-white tracking-tight flex items-center gap-2.5">
                    <span>معامل التحاليل الطبية</span>
                    <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 font-black">
                      ({isLoadingData ? '...' : filteredLabs.length} معمل)
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    أسعار التحاليل واضحة، مع إمكانية حجز التحليل مباشرة قبل التوجه للمعمل.
                  </p>
                </div>

              {/* Action Button */}
              <button
                onClick={() => setLabModalOpen(true)}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0f2a44] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-teal-400 dark:text-white" />
                <span>أضف معملك</span>
              </button>
            </div>

            {/* Labs Grid */}
            {isLoadingData ? (
              <SkeletonGrid count={3} type="lab" />
            ) : approvedLabs.length === 0 ? (
              <div className="py-14 px-6 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 mx-auto flex items-center justify-center border border-teal-100 dark:border-teal-800">
                  <FlaskConical className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg sm:text-xl font-black text-[#0f2a44] dark:text-white">
                    لا توجد معامل مسجلة حاليا
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    كن أول من يضيف معمله الطبي لتسهيل وصول المرضى
                  </p>
                </div>
                <button
                  onClick={() => setLabModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>أضف معملك</span>
                </button>
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <FlaskConical className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-base">لا توجد معامل تطابق البحث المحدد</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">جرب إزالة الفلتر أو كتابة كلمة بحث أخرى</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLabs.map((lab) => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    onBook={(labItem: Lab, test?: LabTestItem) => handleOpenBookingLab(labItem, test)}
                    reviews={reviews}
                    onViewReviews={handleOpenLabReviews}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      </main>

      {/* Main Footer */}
      <Footer
        onOpenDoctorModal={() => setDoctorModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenNotifications={() => setNotificationModalOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          onClose={() => setBookingModalOpen(false)}
          provider={selectedProviderForBooking}
          providerType={selectedProviderType}
          initialTest={selectedInitialTest}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Doctor Registration Modal */}
      {doctorModalOpen && (
        <DoctorRegisterModal
          isOpen={doctorModalOpen}
          onClose={() => setDoctorModalOpen(false)}
          onRegisterDoctor={handleRegisterDoctor}
        />
      )}

      {/* Lab Registration Modal */}
      {labModalOpen && (
        <LabRegisterModal
          isOpen={labModalOpen}
          onClose={() => setLabModalOpen(false)}
          onRegisterLab={handleRegisterLab}
        />
      )}

      {/* Admin Panel Modal */}
      {adminModalOpen && (
        <AdminPanel
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          doctors={doctors}
          labs={labs}
          bookings={bookings}
          isCommissionEnabled={platformSettings.isCommissionEnabled}
          commissionRate={platformSettings.commissionRate}
          onToggleCommission={handleToggleCommission}
          onApproveDoctor={handleApproveDoctor}
          onRejectDoctor={handleRejectDoctor}
          onDeleteDoctor={handleDeleteDoctor}
          onBlockDoctor={handleBlockDoctor}
          onUnblockDoctor={handleUnblockDoctor}
          onApproveLab={handleApproveLab}
          onRejectLab={handleRejectLab}
          onDeleteLab={handleDeleteLab}
          onBlockLab={handleBlockLab}
          onUnblockLab={handleUnblockLab}
          onAddDoctorDirectly={handleAddDoctorDirectly}
          onAddLabDirectly={handleAddLabDirectly}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onDeleteBooking={handleDeleteBooking}
          onResetSeedData={handleResetSeedData}
        />
      )}

      {/* Provider (Doctor & Lab) Phone + OTP Login Modal */}
      {providerLoginModalOpen && (
        <ProviderLoginModal
          isOpen={providerLoginModalOpen}
          onClose={() => setProviderLoginModalOpen(false)}
          doctors={doctors}
          labs={labs}
          onLoginSuccess={handleProviderLoginSuccess}
          onOpenDoctorRegister={() => {
            setProviderLoginModalOpen(false);
            setDoctorModalOpen(true);
          }}
          onOpenLabRegister={() => {
            setProviderLoginModalOpen(false);
            setLabModalOpen(true);
          }}
        />
      )}

      {/* Provider Dedicated Portal Modal (Appointments, Pricing, Financials, Google Maps) */}
      {providerPortalModalOpen && providerSession && (
        <ProviderPortalModal
          isOpen={providerPortalModalOpen}
          onClose={() => setProviderPortalModalOpen(false)}
          session={providerSession}
          doctor={providerSession?.providerType === 'doctor' ? doctors.find((d) => d.id === providerSession.id) : undefined}
          lab={providerSession?.providerType === 'lab' ? labs.find((l) => l.id === providerSession.id) : undefined}
          bookings={bookings}
          isCommissionEnabled={platformSettings.isCommissionEnabled}
          commissionRate={platformSettings.commissionRate}
          onUpdateDoctor={handleUpdateDoctorProfile}
          onUpdateLab={handleUpdateLabProfile}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onSavePrescription={savePrescriptionToFirestore}
          onLogout={handleProviderLogout}
        />
      )}

      {/* Patient Bookings Drawer / Modal */}
      {myBookingsModalOpen && (
        <PatientBookingsModal
          isOpen={myBookingsModalOpen}
          onClose={() => setMyBookingsModalOpen(false)}
          bookings={bookings}
          prescriptions={prescriptions}
          onCancelBooking={handleCancelBooking}
          onOpenRateBooking={handleOpenRateBooking}
          onViewPrescription={(rx) => setActivePrescriptionForPrint(rx)}
          onOpenMedicalRecords={() => setMedicalRecordsModalOpen(true)}
        />
      )}

      {/* Medical Records & E-Prescriptions Hub Modal */}
      {medicalRecordsModalOpen && (
        <MedicalRecordsModal
          isOpen={medicalRecordsModalOpen}
          onClose={() => setMedicalRecordsModalOpen(false)}
          prescriptions={prescriptions}
          medicalRecords={medicalRecords}
          bookings={bookings}
          onSaveMedicalRecord={saveMedicalRecordToFirestore}
          onDeleteMedicalRecord={deleteMedicalRecordFromFirestore}
          onDeletePrescription={deletePrescriptionFromFirestore}
        />
      )}

      {/* Prescription Official Print Preview Modal */}
      {activePrescriptionForPrint !== null && (
        <PrescriptionPrintModal
          isOpen={activePrescriptionForPrint !== null}
          onClose={() => setActivePrescriptionForPrint(null)}
          prescription={activePrescriptionForPrint}
        />
      )}

      {/* Provider Detailed Reviews Modal */}
      {providerReviewsModalOpen && selectedProviderForReview && (
        <ProviderReviewsModal
          isOpen={providerReviewsModalOpen}
          onClose={() => setProviderReviewsModalOpen(false)}
          provider={selectedProviderForReview}
          providerType={selectedProviderTypeForReview}
          reviews={reviews}
          onOpenAddReview={() => {
            setProviderReviewsModalOpen(false);
            setSelectedBookingForReview(null);
            setReviewModalOpen(true);
          }}
          onBook={(prov) => {
            if (selectedProviderTypeForReview === 'doctor') {
              handleOpenBookingDoctor(prov as Doctor);
            } else {
              handleOpenBookingLab(prov as Lab);
            }
          }}
        />
      )}

      {/* Patient Submit Review & Rating Modal */}
      {reviewModalOpen && selectedProviderForReview && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          provider={selectedProviderForReview}
          providerType={selectedProviderTypeForReview}
          booking={selectedBookingForReview}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* PWA Install Guide Modal */}
      {pwaGuideModalOpen && (
        <PWAInstallGuideModal
          isOpen={pwaGuideModalOpen}
          onClose={() => setPwaGuideModalOpen(false)}
          platform={pwaGuidePlatform}
          canNativeInstall={isInstallable}
          onNativeInstallPrompt={promptInstall}
        />
      )}

      {/* Push Notifications Management Modal */}
      {notificationModalOpen && (
        <NotificationManagerModal
          isOpen={notificationModalOpen}
          onClose={() => setNotificationModalOpen(false)}
          doctors={doctors}
          labs={labs}
          notifications={notifications}
        />
      )}

      {/* Gemini Live Real-time Voice Conversation Modal */}
      {geminiLiveVoiceOpen && (
        <GeminiLiveVoiceModal
          isOpen={geminiLiveVoiceOpen}
          onClose={() => setGeminiLiveVoiceOpen(false)}
          onOpenChatbot={() => {
            setGeminiLiveVoiceOpen(false);
            setGeminiChatOpen(true);
          }}
        />
      )}

      {/* Gemini Medical AI Chatbot Modal */}
      {geminiChatOpen && (
        <GeminiChatModal
          isOpen={geminiChatOpen}
          onClose={() => setGeminiChatOpen(false)}
          onOpenLiveVoice={() => {
            setGeminiChatOpen(false);
            setGeminiLiveVoiceOpen(true);
          }}
        />
      )}

      {/* Persistent Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Floating Dual AI Quick Access Pill (Voice & Chatbot accessible anywhere) */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setGeminiLiveVoiceOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-teal-950/30 transition-all active:scale-95 border border-teal-300/40 cursor-pointer"
          title="تحدث صوتياً مع طبيبك الذكي (Gemini Live)"
        >
          <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>🎙️ صوتي (Live)</span>
        </button>

        <button
          onClick={() => setGeminiChatOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-950/30 transition-all active:scale-95 border border-blue-400/40 cursor-pointer"
          title="شات طبي مع Gemini 3.8 Flash"
        >
          <Bot className="w-4 h-4 text-blue-200" />
          <span>💬 شات دكتورك</span>
        </button>
      </div>

      {/* Floating PWA Quick Install Pill for Mobile & Desktop (hides automatically once installed) */}
      {!isStandalone && !isInstalled && (
        <div className="fixed bottom-5 right-5 z-40">
          <PWAInstallButton variant="pill" className="shadow-lg shadow-teal-900/20 py-2.5 px-4 text-sm font-extrabold" />
        </div>
      )}

    </div>
  );
}
