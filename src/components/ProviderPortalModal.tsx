import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  FlaskConical, 
  Calendar, 
  Clock, 
  Phone, 
  DollarSign, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  LogOut, 
  Save, 
  TrendingUp, 
  Coins, 
  Percent, 
  Plus, 
  Trash2, 
  ExternalLink,
  MessageCircle,
  FileText,
  User,
  ShieldCheck,
  Pill
} from 'lucide-react';
import { Doctor, Lab, Booking, BookingStatus, ProviderSession, LabTestItem, EPrescription } from '../types';
import { CreatePrescriptionModal } from './CreatePrescriptionModal';

interface ProviderPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ProviderSession | null;
  doctor?: Doctor;
  lab?: Lab;
  bookings: Booking[];
  isCommissionEnabled: boolean;
  commissionRate: number;
  onUpdateBookingStatus: (id: string, status: BookingStatus, booking?: Booking) => void;
  onUpdateDoctor: (id: string, updates: Partial<Doctor>) => Promise<void>;
  onUpdateLab: (id: string, updates: Partial<Lab>) => Promise<void>;
  onSavePrescription?: (rx: EPrescription) => Promise<void>;
  onLogout: () => void;
}

export const ProviderPortalModal: React.FC<ProviderPortalModalProps> = ({
  isOpen,
  onClose,
  session,
  doctor,
  lab,
  bookings,
  isCommissionEnabled,
  commissionRate,
  onUpdateBookingStatus,
  onUpdateDoctor,
  onUpdateLab,
  onSavePrescription,
  onLogout
}) => {
  const isDoctor = session?.providerType === 'doctor';
  const [selectedBookingForPrescription, setSelectedBookingForPrescription] = useState<Booking | null>(null);
  const providerName = isDoctor ? (doctor?.name || session?.name || '') : (lab?.name || session?.name || '');
  const providerPhone = isDoctor ? (doctor?.phone1 || session?.phone || '') : (lab?.phone || session?.phone || '');
  const providerAddress = isDoctor ? doctor?.address : lab?.address;

  // Active Tab: 'bookings' | 'settings' | 'financials'
  const [activeTab, setActiveTab] = useState<'bookings' | 'settings' | 'financials'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Provider editable state for Doctor
  const [doctorPrice, setDoctorPrice] = useState<number>(doctor?.price || 250);
  const [doctorWorkingHours, setDoctorWorkingHours] = useState(doctor?.workingHours || 'يومياً من ٥م إلى ٩م');
  const [doctorMapsUrl, setDoctorMapsUrl] = useState(doctor?.googleMapsUrl || '');
  const [doctorAddress, setDoctorAddress] = useState(doctor?.address || '');

  // Provider editable state for Lab
  const [labStartingPrice, setLabStartingPrice] = useState<number>(lab?.startingPrice || 100);
  const [labWorkingHours, setLabWorkingHours] = useState(lab?.workingHours || 'يومياً من ٩ص إلى ١١م');
  const [labMapsUrl, setLabMapsUrl] = useState(lab?.googleMapsUrl || '');
  const [labAddress, setLabAddress] = useState(lab?.address || '');
  const [labTests, setLabTests] = useState<LabTestItem[]>(lab?.tests || []);
  const [newTestName, setNewTestName] = useState('');
  const [newTestPrice, setNewTestPrice] = useState('');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !session) return null;

  // Filter bookings for this provider
  const myBookings = bookings.filter((b) => b.providerId === session.id);
  const filteredBookings = myBookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  // Financial calculations
  const activeBookings = myBookings.filter((b) => b.status !== 'cancelled');
  const totalGross = activeBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const effectiveCommissionRate = isCommissionEnabled ? (commissionRate / 100) : 0;
  const platformCommission = Math.round(totalGross * effectiveCommissionRate);
  const netEarnings = totalGross - platformCommission;

  // Today specific calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = activeBookings.filter((b) => b.appointmentDate === todayStr || (b.createdAt && b.createdAt.startsWith(todayStr)));
  const todayGross = todayBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const todayCommission = Math.round(todayGross * effectiveCommissionRate);
  const todayNet = todayGross - todayCommission;

  // Handle adding new test item for Lab
  const handleAddTest = () => {
    if (!newTestName.trim() || !newTestPrice || isNaN(Number(newTestPrice))) {
      alert('يرجى كتابة اسم التحليل وسعره بالأرقام');
      return;
    }
    const newTest: LabTestItem = {
      id: 'test_' + Date.now(),
      name: newTestName.trim(),
      price: Number(newTestPrice)
    };
    setLabTests([...labTests, newTest]);
    setNewTestName('');
    setNewTestPrice('');
  };

  const handleRemoveTest = (testId: string) => {
    setLabTests(labTests.filter(t => t.id !== testId));
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      if (isDoctor && doctor) {
        await onUpdateDoctor(doctor.id, {
          price: Number(doctorPrice),
          workingHours: doctorWorkingHours.trim(),
          googleMapsUrl: doctorMapsUrl.trim(),
          address: doctorAddress.trim()
        });
      } else if (!isDoctor && lab) {
        await onUpdateLab(lab.id, {
          startingPrice: Number(labStartingPrice),
          workingHours: labWorkingHours.trim(),
          googleMapsUrl: labMapsUrl.trim(),
          address: labAddress.trim(),
          tests: labTests
        });
      }
      setSaveSuccessMsg('تم حفظ وتحديث بيانات العيادة/المعمل بنجاح');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save provider settings:', err);
      alert('حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh]">
        
        {/* Header with Provider Identity & Logout */}
        <div className="relative bg-gradient-to-r from-teal-900 via-[#0f2a44] to-slate-900 text-white p-5 sm:p-6 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                {isDoctor ? <Stethoscope className="w-7 h-7" /> : <FlaskConical className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black">{providerName}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>حساب موثق</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-teal-200/80 mt-1">
                  <span>{session.specialtyOrType}</span>
                  <span>•</span>
                  <span className="font-mono">{providerPhone}</span>
                  {providerAddress && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">{providerAddress}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mr-auto sm:mr-0">
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-bold transition-colors active:scale-95"
                title="تسجيل الخروج من الحساب"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل خروج</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-teal-500/20 overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'bookings'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>الحجوزات الواردة ({myBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>الأسعار والمواعيد والخرائط</span>
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'financials'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>الأرباح والمستحقات</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((filterKey) => {
                    const count = filterKey === 'all' 
                      ? myBookings.length 
                      : myBookings.filter(b => b.status === filterKey).length;
                    
                    const labels: Record<string, string> = {
                      all: 'الكل',
                      pending: 'قيد الانتظار',
                      confirmed: 'مؤكد',
                      completed: 'مكتمل',
                      cancelled: 'ملغي'
                    };

                    return (
                      <button
                        key={filterKey}
                        onClick={() => setBookingFilter(filterKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                          bookingFilter === filterKey
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {labels[filterKey]} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  إجمالي الحجوزات: <span className="font-bold text-teal-600">{filteredBookings.length}</span>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="py-14 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    لا توجد حجوزات في هذه الفئة حالياً
                  </p>
                  <p className="text-xs text-slate-400">
                    ستظهر حجوزات المرضى الواردة هنا لحظياً مع إشعار صوتي فوري.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b) => {
                    const statusColor = 
                      b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                      b.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                      b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800' :
                      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';

                    const statusText =
                      b.status === 'confirmed' ? 'مؤكد' :
                      b.status === 'completed' ? 'مكتمل' :
                      b.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار';

                    return (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              #{b.bookingCode}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                              {statusText}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                              <User className="w-4 h-4 text-teal-600" />
                              <span>{b.patientName}</span>
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.appointmentDate} {b.appointmentTime ? `• ${b.appointmentTime}` : ''}</span>
                            </div>
                            {b.selectedTestName && (
                              <div className="text-xs text-teal-700 dark:text-teal-400 font-bold mt-1 bg-teal-50 dark:bg-teal-950/50 p-1.5 rounded-lg">
                                التحليل المطلوب: {b.selectedTestName}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                            <span className="text-slate-500">القيمة:</span>
                            <span className="font-black text-teal-700 dark:text-teal-400 text-sm">
                              {b.price} جنيه
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${b.patientPhone}`}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                              title="اتصال هاتفي"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline font-mono">{b.patientPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/20${b.patientPhone.replace(/^0/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors"
                              title="محادثة واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isDoctor && onSavePrescription && (
                              <button
                                type="button"
                                onClick={() => setSelectedBookingForPrescription(b)}
                                className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 text-xs font-black transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
                                title="إصدار روشتة إلكترونية للمريض"
                              >
                                <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                <span>روشتة</span>
                              </button>
                            )}

                            {b.status !== 'confirmed' && b.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => onUpdateBookingStatus(b.id, 'confirmed', b)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95"
                              >
                                تأكيد
                              </button>
                            )}
                            {b.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => onUpdateBookingStatus(b.id, 'completed', b)}
                                className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all active:scale-95"
                              >
                                إتمام
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
                                    onUpdateBookingStatus(b.id, 'cancelled', b);
                                  }
                                }}
                                className="px-2 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold transition-all"
                              >
                                إلغاء
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS & SCHEDULE & MAPS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {saveSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Pricing & Hours */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-teal-600" />
                    <span>{isDoctor ? 'سعر كشف العيادة' : 'السعر المبدئي للتحاليل'}</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isDoctor ? 'سعر الكشف (بالجنيه المصري):' : 'سعر البداية / أقل تحليل (جنيه):'}
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={isDoctor ? doctorPrice : labStartingPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isDoctor) setDoctorPrice(val);
                        else setLabStartingPrice(val);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      مواعيد وساعات العمل الرسمية:
                    </label>
                    <input
                      type="text"
                      value={isDoctor ? doctorWorkingHours : labWorkingHours}
                      onChange={(e) => {
                        if (isDoctor) setDoctorWorkingHours(e.target.value);
                        else setLabWorkingHours(e.target.value);
                      }}
                      placeholder="مثال: يومياً من ٥م إلى ٩م عدا الجمعة"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Google Maps & Location */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>العنوان والربط مع خرائط جوجل (Google Maps)</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      العنوان بالتفصيل:
                    </label>
                    <input
                      type="text"
                      value={isDoctor ? doctorAddress : labAddress}
                      onChange={(e) => {
                        if (isDoctor) setDoctorAddress(e.target.value);
                        else setLabAddress(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رابط الموقع على خرائط جوجل (Google Maps URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={isDoctor ? doctorMapsUrl : labMapsUrl}
                        onChange={(e) => {
                          if (isDoctor) setDoctorMapsUrl(e.target.value);
                          else setLabMapsUrl(e.target.value);
                        }}
                        placeholder="https://maps.google.com/?q=..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      {(isDoctor ? doctorMapsUrl : labMapsUrl) && (
                        <a
                          href={isDoctor ? doctorMapsUrl : labMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center gap-1 hover:bg-teal-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>معاينة</span>
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      يساعد المرضى في الوصول لعيادتك بالضغط على زر "الموقع على الخريطة".
                    </p>
                  </div>
                </div>
              </div>

              {/* Special section for Labs: Test List Management */}
              {!isDoctor && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-teal-600" />
                    <span>إدارة قائمة الفحوصات والتحاليل الطبية ({labTests.length})</span>
                  </h4>

                  {/* Add new test row */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="اسم التحليل (مثال: صورة دم كاملة CBC)"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      placeholder="السعر (جنيه)"
                      value={newTestPrice}
                      onChange={(e) => setNewTestPrice(e.target.value)}
                      className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTest}
                      className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة تحليل</span>
                    </button>
                  </div>

                  {/* Tests Table / List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {labTests.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-teal-700 dark:text-teal-400">{t.price} جنيه</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTest(t.id)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="حذف التحليل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white font-black text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ وتحديث البيانات'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FINANCIALS & EARNINGS */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              
              {/* Key Financial Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-slate-50 dark:from-teal-950/40 dark:to-slate-800 border border-teal-200/60 dark:border-teal-800/60 space-y-2">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                    <span>إجمالي المبالغ المستحقة</span>
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {totalGross.toLocaleString()} <span className="text-xs font-normal text-slate-500">جنيه</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    من إجمالي {activeBookings.length} حجز نشط
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-slate-50 dark:from-amber-950/40 dark:to-slate-800 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                    <span>حصة المنصة ({isCommissionEnabled ? `${commissionRate}%` : 'معطلة 0%'})</span>
                    <Percent className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {platformCommission.toLocaleString()} <span className="text-xs font-normal text-slate-500">جنيه</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isCommissionEnabled ? `عمولة التطبيق المطبقة ${commissionRate}%` : 'العمولة مجانية حالياً 0%'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-950/40 dark:to-slate-800 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                    <span>صافي أرباحك القابلة للصرف</span>
                    <Coins className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {netEarnings.toLocaleString()} <span className="text-xs font-normal text-slate-500">جنيه</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold">
                    مستحقات مؤكدة وصافية
                  </div>
                </div>
              </div>

              {/* Today summary snapshot */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-sm text-slate-900 dark:text-white mb-3">
                  تقرير حجوزات وأرباح اليوم ({todayStr})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">حجوزات اليوم</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{todayBookings.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">إجمالي اليوم</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{todayGross} جنيه</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">عمولة المنصة</span>
                    <span className="text-lg font-black text-amber-600">{todayCommission} جنيه</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">صافي أرباحك اليوم</span>
                    <span className="text-lg font-black text-emerald-600">{todayNet} جنيه</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Create Prescription Modal */}
      {selectedBookingForPrescription && onSavePrescription && (
        <CreatePrescriptionModal
          isOpen={true}
          onClose={() => setSelectedBookingForPrescription(null)}
          booking={selectedBookingForPrescription}
          doctor={doctor}
          onSavePrescription={onSavePrescription}
        />
      )}
    </div>
  );
};
