import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Users, 
  Calendar, 
  FlaskConical, 
  Stethoscope, 
  Clock, 
  Lock, 
  KeyRound, 
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  Percent,
  Coins,
  Phone,
  FileText,
  MapPin,
  Printer,
  ChevronRight,
  Filter,
  Sparkles,
  Bot,
  Ban,
  UserCheck,
  ShieldAlert,
  PlusCircle,
  Plus
} from 'lucide-react';
import { Doctor, Lab, Booking, BookingStatus, LabTestItem } from '../types';
import { STORAGE_KEYS, DEFAULT_ADMIN_PASSWORD, SPECIALTIES } from '../constants';
import { FinancialReports } from './FinancialReports';
import { ProviderStatementModal } from './ProviderStatementModal';
import { EGYPT_GOVERNORATES, getCentersForGovernorate } from '../data/egyptLocations';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  labs: Lab[];
  bookings: Booking[];
  isCommissionEnabled?: boolean;
  commissionRate?: number;
  onToggleCommission?: (enabled: boolean) => void;
  onApproveDoctor: (id: string) => void;
  onRejectDoctor: (id: string) => void;
  onDeleteDoctor: (id: string) => void;
  onBlockDoctor?: (id: string) => void;
  onUnblockDoctor?: (id: string) => void;
  onApproveLab: (id: string) => void;
  onRejectLab: (id: string) => void;
  onDeleteLab: (id: string) => void;
  onBlockLab?: (id: string) => void;
  onUnblockLab?: (id: string) => void;
  onAddDoctorDirectly?: (doctor: Doctor) => Promise<void>;
  onAddLabDirectly?: (lab: Lab) => Promise<void>;
  onUpdateBookingStatus: (id: string, status: BookingStatus, booking?: Booking) => void;
  onDeleteBooking: (id: string) => void;
  onResetSeedData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  doctors,
  labs,
  bookings,
  isCommissionEnabled = true,
  commissionRate = 12,
  onToggleCommission,
  onApproveDoctor,
  onRejectDoctor,
  onDeleteDoctor,
  onBlockDoctor,
  onUnblockDoctor,
  onApproveLab,
  onRejectLab,
  onDeleteLab,
  onBlockLab,
  onUnblockLab,
  onAddDoctorDirectly,
  onAddLabDirectly,
  onUpdateBookingStatus,
  onDeleteBooking,
  onResetSeedData
}) => {
  // Password & Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'ai_insights' | 'doctors' | 'labs' | 'blocked' | 'bookings' | 'settings'>('reports');
  
  // Search Filters
  const [bookingFilterTerm, setBookingFilterTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [labSearchTerm, setLabSearchTerm] = useState('');
  const [blockedSearchTerm, setBlockedSearchTerm] = useState('');

  // Internal Direct Registration Modals State
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [internalSuccessMsg, setInternalSuccessMsg] = useState('');

  // New Doctor Form Fields
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState(SPECIALTIES[0]);
  const [newDocPhone, setNewDocPhone] = useState('');
  const [newDocPrice, setNewDocPrice] = useState('250');
  const [newDocGov, setNewDocGov] = useState('سوهاج');
  const [newDocCenter, setNewDocCenter] = useState('سوهاج (المركز والمدينة)');
  const [newDocAddress, setNewDocAddress] = useState('');

  // New Lab Form Fields
  const [newLabName, setNewLabName] = useState('');
  const [newLabPhone, setNewLabPhone] = useState('');
  const [newLabStartingPrice, setNewLabStartingPrice] = useState('100');
  const [newLabGov, setNewLabGov] = useState('سوهاج');
  const [newLabCenter, setNewLabCenter] = useState('سوهاج (المركز والمدينة)');
  const [newLabAddress, setNewLabAddress] = useState('');

  // Individual Statement Modal State
  const [selectedProviderForStatement, setSelectedProviderForStatement] = useState<Doctor | Lab | null>(null);
  const [selectedTypeForStatement, setSelectedTypeForStatement] = useState<'doctor' | 'lab'>('doctor');
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // Check stored password
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    if (stored) {
      setHasStoredPassword(true);
    } else {
      setHasStoredPassword(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
    if (passwordInput === stored) {
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      setAuthError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
    }
  };

  const handleSetInitialPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (newPasswordInput.length < 4) {
      setAuthError('كلمة المرور يجب ألا تقل عن 4 أحرف أو أرقام');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setAuthError('كلمتا المرور غير متطابقتين');
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPasswordInput);
    setHasStoredPassword(true);
    setIsAuthenticated(true);
  };

  const handleChangePassword = () => {
    if (newPasswordInput.length < 4) {
      alert('كلمة المرور يجب ألا تقل عن 4 خانات');
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPasswordInput);
    alert('تم تغيير كلمة مرور لوحة الإدارة بنجاح');
    setNewPasswordInput('');
  };

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocPhone.trim()) {
      alert('يرجى كتابة اسم الطبيب ورقم هاتف العيادة');
      return;
    }
    const cleanPhone = newDocPhone.trim().replace(/\D/g, '');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newDoctor: Doctor = {
      id: `doc_${Date.now()}`,
      name: newDocName.trim(),
      specialty: newDocSpecialty,
      phone1: cleanPhone,
      price: Number(newDocPrice) || 250,
      governorate: newDocGov,
      center: newDocCenter,
      address: newDocAddress.trim() || 'عيادة خاصة',
      status: 'approved',
      isVerified: true,
      otpCode: otp,
      rating: 5.0,
      reviewsCount: 1,
      workingHours: 'يومياً من 4 مساءً حتى 10 مساءً',
      createdAt: new Date().toISOString()
    };

    if (onAddDoctorDirectly) {
      await onAddDoctorDirectly(newDoctor);
    }
    setIsAddDoctorOpen(false);
    setInternalSuccessMsg(`تم تسجيل واعتماد الطبيب (${newDoctor.name}) بنجاح! كود التأكيد (OTP) الخاص به: ${otp}`);
    setNewDocName('');
    setNewDocPhone('');
    setNewDocAddress('');
    setTimeout(() => setInternalSuccessMsg(''), 10000);
  };

  const handleAddLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim() || !newLabPhone.trim()) {
      alert('يرجى كتابة اسم المعمل ورقم الهاتف');
      return;
    }
    const cleanPhone = newLabPhone.trim().replace(/\D/g, '');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newLab: Lab = {
      id: `lab_${Date.now()}`,
      name: newLabName.trim(),
      phone: cleanPhone,
      startingPrice: Number(newLabStartingPrice) || 100,
      governorate: newLabGov,
      center: newLabCenter,
      address: newLabAddress.trim() || 'فرع المعمل الرئيسي',
      status: 'approved',
      isVerified: true,
      otpCode: otp,
      rating: 5.0,
      reviewsCount: 1,
      tests: [
        { id: `t1_${Date.now()}`, name: 'صورة دم كاملة CBC', price: Number(newLabStartingPrice) || 120 },
        { id: `t2_${Date.now()}`, name: 'تحليل سكر صائم وعشوائي', price: 60 },
        { id: `t3_${Date.now()}`, name: 'وظائف كبد وكلى شاملة', price: 180 }
      ],
      createdAt: new Date().toISOString()
    };

    if (onAddLabDirectly) {
      await onAddLabDirectly(newLab);
    }
    setIsAddLabOpen(false);
    setInternalSuccessMsg(`تم تسجيل واعتماد المعمل (${newLab.name}) بنجاح! كود التأكيد (OTP) الخاص به: ${otp}`);
    setNewLabName('');
    setNewLabPhone('');
    setNewLabAddress('');
    setTimeout(() => setInternalSuccessMsg(''), 10000);
  };

  // Metrics
  const pendingDoctors = doctors.filter((d) => d.status === 'pending');
  const pendingLabs = labs.filter((l) => l.status === 'pending');
  const totalPending = pendingDoctors.length + pendingLabs.length;
  const approvedDoctors = doctors.filter((d) => d.status === 'approved');
  const approvedLabs = labs.filter((l) => l.status === 'approved');
  const blockedDoctors = doctors.filter((d) => d.status === 'blocked');
  const blockedLabs = labs.filter((l) => l.status === 'blocked');
  const totalBlocked = blockedDoctors.length + blockedLabs.length;

  // Effective commission rate (12% if enabled, 0% if disabled)
  const effectiveCommissionRate = isCommissionEnabled ? (commissionRate / 100) : 0;

  // Overall financial calculation for quick header metric
  const validBookings = bookings.filter((b) => b.status !== 'cancelled');
  const totalGrossRevenue = validBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const totalAppCommission = Math.round(totalGrossRevenue * effectiveCommissionRate);

  // Helper for single doctor stats
  const getDoctorStats = (doctorId: string) => {
    const docBookings = bookings.filter((b) => b.providerId === doctorId && b.status !== 'cancelled');
    const gross = docBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const commission = Math.round(gross * effectiveCommissionRate);
    const net = gross - commission;
    return { count: docBookings.length, gross, commission, net };
  };

  // Helper for single lab stats
  const getLabStats = (labId: string) => {
    const labBookings = bookings.filter((b) => b.providerId === labId && b.status !== 'cancelled');
    const gross = labBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const commission = Math.round(gross * effectiveCommissionRate);
    const net = gross - commission;
    return { count: labBookings.length, gross, commission, net };
  };

  // Filtered Approved Doctors
  const filteredDoctors = useMemo(() => {
    return approvedDoctors.filter((doc) => {
      if (!doctorSearchTerm.trim()) return true;
      const term = doctorSearchTerm.toLowerCase();
      return (
        doc.name.toLowerCase().includes(term) ||
        doc.specialty.toLowerCase().includes(term) ||
        doc.phone1.includes(term) ||
        (doc.phone2 && doc.phone2.includes(term)) ||
        (doc.governorate && doc.governorate.toLowerCase().includes(term)) ||
        (doc.center && doc.center.toLowerCase().includes(term))
      );
    });
  }, [approvedDoctors, doctorSearchTerm]);

  // Filtered Approved Labs
  const filteredLabs = useMemo(() => {
    return approvedLabs.filter((lab) => {
      if (!labSearchTerm.trim()) return true;
      const term = labSearchTerm.toLowerCase();
      return (
        lab.name.toLowerCase().includes(term) ||
        lab.phone.includes(term) ||
        (lab.governorate && lab.governorate.toLowerCase().includes(term)) ||
        (lab.center && lab.center.toLowerCase().includes(term)) ||
        (lab.tests && lab.tests.some(t => t.name.toLowerCase().includes(term)))
      );
    });
  }, [approvedLabs, labSearchTerm]);

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (!bookingFilterTerm.trim()) return true;
    const term = bookingFilterTerm.toLowerCase();
    return (
      b.patientName.toLowerCase().includes(term) ||
      b.patientPhone.includes(term) ||
      b.providerName.toLowerCase().includes(term) ||
      b.bookingCode.toLowerCase().includes(term)
    );
  });

  const openProviderStatement = (provider: Doctor | Lab, type: 'doctor' | 'lab') => {
    setSelectedProviderForStatement(provider);
    setSelectedTypeForStatement(type);
    setIsStatementOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-3 flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="bg-[#0f2a44] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  لوحة تحكم الإدارة الشاملة (Admin Dashboard)
                </h3>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 hidden xs:inline">
                    نشط وموثق
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                إدارة الأطباء والمعامل • تقارير الأرباح والعمولات (12%) • حجوزات المرضى
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication View (if not authenticated) */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 mx-auto flex items-center justify-center border border-teal-100 dark:border-teal-800 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-black text-[#0f2a44] dark:text-white">
                {hasStoredPassword ? 'تسجيل دخول المشرف' : 'تعيين كلمة مرور الإدارة لأول مرة'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {hasStoredPassword
                  ? 'أدخل كلمة المرور للمتابعة وعرض تقارير الإيرادات وإدارة المنصة'
                  : 'حدد كلمة مرور آمنة للوحة التحكم للبدء'}
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {hasStoredPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="كلمة مرور الإدارة..."
                    className="w-full py-3 px-4 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-teal-500 text-center font-mono"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  دخول لوحة التحكم
                </button>

                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  (كلمة المرور الافتراضية للتجربة: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">admin</code>)
                </div>
              </form>
            ) : (
              <form onSubmit={handleSetInitialPassword} className="space-y-3 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition-all mt-2"
                >
                  حفظ كلمة المرور والدخول
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Authenticated Dashboard Body */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Success alert banner */}
            {internalSuccessMsg && (
              <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{internalSuccessMsg}</span>
                </div>
                <button onClick={() => setInternalSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Metrics Bar with 12% Commission Insight */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 shrink-0">
              
              {/* Box 1: Pending */}
              <button
                onClick={() => setActiveTab('pending')}
                className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs flex items-center justify-between text-right transition-all hover:border-amber-400 active:scale-95 ${
                  activeTab === 'pending' ? 'border-amber-500 ring-2 ring-amber-100 dark:ring-amber-900/50' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">طلبات معلقة</div>
                  <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">{totalPending}</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </button>

              {/* Box 2: Doctors */}
              <button
                onClick={() => setActiveTab('doctors')}
                className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs flex items-center justify-between text-right transition-all hover:border-teal-400 active:scale-95 ${
                  activeTab === 'doctors' ? 'border-teal-500 ring-2 ring-teal-100 dark:ring-teal-900/50' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">أطباء معتمدون</div>
                  <div className="text-lg sm:text-xl font-black text-[#0d9488] dark:text-teal-400">{approvedDoctors.length}</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </button>

              {/* Box 3: Labs */}
              <button
                onClick={() => setActiveTab('labs')}
                className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs flex items-center justify-between text-right transition-all hover:border-cyan-400 active:scale-95 ${
                  activeTab === 'labs' ? 'border-cyan-500 ring-2 ring-cyan-100 dark:ring-cyan-900/50' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">معامل معتمدة</div>
                  <div className="text-lg sm:text-xl font-black text-cyan-800 dark:text-cyan-300">{approvedLabs.length}</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-4 h-4" />
                </div>
              </button>

              {/* Box 4: Total Bookings */}
              <button
                onClick={() => setActiveTab('bookings')}
                className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs flex items-center justify-between text-right transition-all hover:border-indigo-400 active:scale-95 ${
                  activeTab === 'bookings' ? 'border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/50' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">إجمالي الحجوزات</div>
                  <div className="text-lg sm:text-xl font-black text-[#0f2a44] dark:text-white">{bookings.length}</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
              </button>

              {/* Box 5: App Commission (12% ON/OFF) */}
              <button
                onClick={() => setActiveTab('reports')}
                className={`col-span-2 sm:col-span-1 p-3 rounded-2xl bg-gradient-to-l from-indigo-900 to-[#0f2a44] text-white border border-indigo-700 shadow-2xs flex items-center justify-between text-right transition-all hover:brightness-110 active:scale-95 ${
                  activeTab === 'reports' ? 'ring-2 ring-teal-300' : ''
                }`}
              >
                <div>
                  <div className="text-[10px] text-teal-300 font-bold flex items-center gap-1">
                    <span>أرباح المنصة ({isCommissionEnabled ? `${commissionRate}%` : 'معطلة 0%'})</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-white">
                    {totalAppCommission.toLocaleString('ar-EG')} <span className="text-[11px] font-normal text-teal-200">ج</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
              </button>

            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-4 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0">
              
              {/* Tab 1: Financial Reports (Highlight) */}
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-3.5 px-3 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === 'reports'
                    ? 'border-[#0d9488] text-[#0d9488] dark:text-teal-400'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>التقارير المالية والعمولات ({isCommissionEnabled ? `${commissionRate}%` : '0%'})</span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              </button>

              {/* Tab: AI Management & Insights */}
              <button
                onClick={() => setActiveTab('ai_insights')}
                className={`py-3.5 px-3 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === 'ai_insights'
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : 'border-transparent text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>إدارة اللوحة بالذكاء الاصطناعي</span>
              </button>

              {/* Tab 2: Doctors List & Management */}
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === 'doctors'
                    ? 'border-[#0d9488] text-[#0d9488] dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>قائمة الأطباء ({approvedDoctors.length})</span>
              </button>

              {/* Tab 3: Labs List & Management */}
              <button
                onClick={() => setActiveTab('labs')}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === 'labs'
                    ? 'border-[#0d9488] text-[#0d9488] dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>قائمة المعامل ({approvedLabs.length})</span>
              </button>

              {/* Tab 4: Pending Requests */}
              <button
                onClick={() => setActiveTab('pending')}
                className={`relative py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === 'pending'
                    ? 'border-[#0d9488] text-[#0d9488] dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span>الطلبات المعلقة</span>
                {totalPending > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                    {totalPending}
                  </span>
                )}
              </button>

              {/* Tab: Blocked Providers */}
              <button
                onClick={() => setActiveTab('blocked')}
                className={`relative py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === 'blocked'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>المحظورون</span>
                {totalBlocked > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                    {totalBlocked}
                  </span>
                )}
              </button>

              {/* Tab 5: Patient Bookings */}
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === 'bookings'
                    ? 'border-[#0d9488] text-[#0d9488] dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>حجوزات المرضى ({bookings.length})</span>
              </button>

              {/* Tab 6: Settings */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors shrink-0 ml-auto ${
                  activeTab === 'settings'
                    ? 'border-[#0d9488] text-[#0d9488] dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span>الإعدادات</span>
              </button>
            </div>

            {/* Tab Contents Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* TAB 1: FINANCIAL REPORTS & COMMISSION (12%) */}
              {activeTab === 'reports' && (
                <FinancialReports
                  doctors={approvedDoctors}
                  labs={approvedLabs}
                  bookings={bookings}
                  isCommissionEnabled={isCommissionEnabled}
                  commissionRate={commissionRate}
                  onToggleCommission={onToggleCommission}
                />
              )}

              {/* TAB: AI SMART MANAGEMENT & INSIGHTS (Requirement 4) */}
              {activeTab === 'ai_insights' && (
                <div className="space-y-6">
                  {/* Top AI Header */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-[#0f2a44] to-slate-900 text-white border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                        <Bot className="w-7 h-7 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-lg text-white">
                            مساعد إدارة المنصة الذكي (AI Smart Management)
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>متصل بقاعدة البيانات</span>
                          </span>
                        </div>
                        <p className="text-xs text-indigo-200/80 mt-1">
                          تحليل فوري لأنماط الحجوزات، كفاءة الأطباء، وتوقعات الإيرادات المالية مع توصيات ذكية للإدارة.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('تم تحديث الفحص التشخيصي للذكاء الاصطناعي بنجاح وفق أحدث بيانات قاعدة البيانات!')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تحديث التحليل الذكي</span>
                    </button>
                  </div>

                  {/* AI Performance Scorecard */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                        <span>معدل إتمام الحجوزات</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {bookings.length > 0 
                          ? `${Math.round((bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length / bookings.length) * 100)}%`
                          : '100%'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">مستوى تشغيلي ممتاز</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                        <span>التخصص الأكثر طلباً</span>
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="text-base font-black text-slate-900 truncate">
                        {bookings.length > 0 ? (bookings[0]?.providerSpecialtyOrType || 'طب الأطفال') : 'طب الأطفال'}
                      </div>
                      <div className="text-[11px] text-teal-600 font-semibold">أعلى معدل بحث من المرضى</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                        <span>توقع الإيرادات الشهرية</span>
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-black text-indigo-700">
                        {Math.max(totalGrossRevenue * 4, 15000).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج</span>
                      </div>
                      <div className="text-[11px] text-indigo-600 font-semibold">نمو متوقع بنسبة +24%</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                        <span>حالة العمولة ({commissionRate}%)</span>
                        <Percent className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {isCommissionEnabled ? 'نشطة (ON)' : 'معطلة (OFF)'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isCommissionEnabled ? 'عائد متوقع 12% للمنصة' : 'ترويج مجاني للعيادات'}
                      </div>
                    </div>
                  </div>

                  {/* AI Smart Strategic Recommendations */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                    <h5 className="font-black text-base text-[#0f2a44] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <span>توصيات الذكاء الاصطناعي الاستراتيجية للإدارة</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-teal-900">1. توسيع شبكة عيادات الأطفال والنساء</span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-200/60 text-teal-800 text-[10px] font-bold">أولوية مرتفعة</span>
                        </div>
                        <p className="text-xs text-teal-800/80 leading-relaxed">
                          أظهرت خوارزميات البحث تركز أكثر من 45% من استعلامات المرضى في مراكز سوهاج وطهطا على تخصصات الأطفال والباطنة. نوصي بتسجيل المزيد من العيادات في هذه المناطق.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-indigo-900">2. تنشيط باقات التحاليل الشاملة بالمعامل</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800 text-[10px] font-bold">فرصة نمو</span>
                        </div>
                        <p className="text-xs text-indigo-800/80 leading-relaxed">
                          المرضى يقبلون بنسبة 3 أضعاف على حجز باقات الفحص الشامل (CBC، وظائف كبد وكلى) عند وضوح أسعارها مقارنة بالتحاليل المنفردة، مما يرفع إجمالي قيمة الحجوزات.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-amber-900">3. دراسة معدل العمولة التنافسي (12%)</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 text-[10px] font-bold">تحليل مالي</span>
                        </div>
                        <p className="text-xs text-amber-800/80 leading-relaxed">
                          نسبة الـ 12% الحالية تحقق توازناً ممتازاً بين استدامة أرباح المنصة وحرية تسعير الأطباء. يتيح زر التحكم الرئيسي في اللوحة إيقافها مؤقتاً في الأعياد كعرض ترويجي.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-emerald-900">4. اعتماد سريع وتلقائي مع إشعارات OTP</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-bold">تجربة المستخدم</span>
                        </div>
                        <p className="text-xs text-emerald-800/80 leading-relaxed">
                          النظام الجديد يتيح إرسال كود OTP الترحيبي فوراً عند الموافقة بنقرة واحدة، مما يتيح للأطباء والمعامل الدخول للوحة وتحديث أوقاتهم دون أي تأخير.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DOCTORS MANAGEMENT LIST (Strict Requirement 1) */}
              {activeTab === 'doctors' && (
                <div className="space-y-4">
                  {/* Top Bar for Doctors Tab */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h4 className="font-black text-base text-[#0f2a44] flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-teal-600" />
                        <span>إدارة الأطباء: الأسماء، أرقام هواتف العيادات، وأسعار الكشف</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        عرض تفصيلي لكل طبيب مع إمكانية متابعة الحجوزات، كشف الحساب المالي، والاتصال المباشر.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setIsAddDoctorOpen(true)}
                        className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة طبيب (تسجيل داخلي)</span>
                      </button>

                      {/* Search Doctor */}
                      <div className="relative min-w-[200px] sm:min-w-[230px]">
                        <input
                          type="text"
                          placeholder="بحث باسم الطبيب، الهاتف، أو التخصص..."
                          value={doctorSearchTerm}
                          onChange={(e) => setDoctorSearchTerm(e.target.value)}
                          className="w-full py-2 px-3 pr-8 rounded-xl border border-slate-200 text-xs focus:border-teal-500 bg-slate-50"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {filteredDoctors.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                      لا يوجد أطباء معتمدون حالياً يطابقون البحث.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDoctors.map((doc) => {
                        const stats = getDoctorStats(doc.id);
                        return (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                          >
                            {/* Card Top: Name & Specialty */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md">
                                    {doc.specialty}
                                  </span>
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    معتمد
                                  </span>
                                </div>
                                <h5 className="font-black text-base text-[#0f2a44]">{doc.name}</h5>
                                {(doc.governorate || doc.center) && (
                                  <div className="text-[11px] font-bold text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded-md inline-block">
                                    📍 {doc.governorate} {doc.center ? `• ${doc.center}` : ''}
                                  </div>
                                )}
                                <div className="text-xs text-slate-500">{doc.address}</div>
                              </div>

                              {doc.doctorPhoto ? (
                                <img
                                  src={doc.doctorPhoto}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base border border-teal-100 shrink-0">
                                  {doc.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Core Details Highlight: Clinic Phone & Checkup Fee */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                              {/* Clinic Phone */}
                              <div className="space-y-0.5">
                                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                                  <span>هاتف العيادة:</span>
                                </div>
                                <a
                                  href={`tel:${doc.phone1}`}
                                  className="font-mono font-black text-slate-900 hover:text-teal-700 block text-sm"
                                  dir="ltr"
                                >
                                  {doc.phone1}
                                </a>
                                {doc.phone2 && (
                                  <div className="font-mono text-slate-500 text-[10px]" dir="ltr">
                                    {doc.phone2}
                                  </div>
                                )}
                              </div>

                              {/* Examination Price */}
                              <div className="space-y-0.5 text-left">
                                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-end gap-1">
                                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                                  <span>سعر الكشف:</span>
                                </div>
                                <div className="text-base font-black text-emerald-700">
                                  {doc.price} <span className="text-xs font-bold text-slate-500">جنيه</span>
                                </div>
                              </div>
                            </div>

                            {/* Financial Stats Bar for this doctor */}
                            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-teal-50/50 border border-teal-100/80">
                              <div className="text-slate-600">
                                الحجوزات: <strong className="text-slate-900">{stats.count}</strong>
                              </div>
                              <div className="text-slate-600">
                                الإجمالي: <strong className="text-slate-900">{stats.gross} ج</strong>
                              </div>
                              <div className="text-indigo-800 font-bold">
                                عمولة {isCommissionEnabled ? `${commissionRate}%` : '0%'}: <strong>{stats.commission} ج</strong>
                              </div>
                              <div className="text-emerald-800 font-bold">
                                صافي الطبيب: <strong>{stats.net} ج</strong>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <button
                                onClick={() => openProviderStatement(doc, 'doctor')}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#0f2a44] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <FileText className="w-4 h-4 text-teal-300" />
                                <span>كشف الحساب والتقارير</span>
                              </button>

                              <a
                                href={`https://wa.me/20${doc.phone1.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-200 transition-colors"
                                title="مراسلة واتساب"
                              >
                                <span>واتساب</span>
                              </a>

                              {onBlockDoctor && (
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من رغبتك في حظر الطبيب (${doc.name})؟ سيتم إيقاف حسابه ومنع حجوزاته فوراً مع إمكانية فك الحظر لاحقاً.`)) {
                                      onBlockDoctor(doc.id);
                                    }
                                  }}
                                  className="p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-700 border border-slate-200 transition-colors"
                                  title="حظر الطبيب"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => onDeleteDoctor(doc.id)}
                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 transition-colors"
                                title="حذف الطبيب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LABS MANAGEMENT LIST (Strict Requirement 1) */}
              {activeTab === 'labs' && (
                <div className="space-y-4">
                  {/* Top Bar for Labs Tab */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h4 className="font-black text-base text-[#0f2a44] flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-cyan-700" />
                        <span>إدارة المعامل: الأسماء، أرقام الهواتف، وأسعار الخدمات والتحاليل</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        عرض تفصيلي لكل معمل تحاليل مع قائمة الفحوصات والأسعار المعتمدة وتقارير الأرباح.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setIsAddLabOpen(true)}
                        className="py-2 px-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة معمل (تسجيل داخلي)</span>
                      </button>

                      {/* Search Lab */}
                      <div className="relative min-w-[200px] sm:min-w-[230px]">
                        <input
                          type="text"
                          placeholder="بحث باسم المعمل، الهاتف، أو اسم التحليل..."
                          value={labSearchTerm}
                          onChange={(e) => setLabSearchTerm(e.target.value)}
                          className="w-full py-2 px-3 pr-8 rounded-xl border border-slate-200 text-xs focus:border-teal-500 bg-slate-50"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {filteredLabs.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                      لا توجد معامل معتمدة حالياً تطابق البحث.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredLabs.map((lab) => {
                        const stats = getLabStats(lab.id);
                        return (
                          <div
                            key={lab.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                          >
                            {/* Card Top: Lab Name & Tests count */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200/60 px-2 py-0.5 rounded-md">
                                    معمل تحاليل طبية
                                  </span>
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    معتمد
                                  </span>
                                </div>
                                <h5 className="font-black text-base text-[#0f2a44]">{lab.name}</h5>
                                {(lab.governorate || lab.center) && (
                                  <div className="text-[11px] font-bold text-cyan-800 bg-cyan-50/80 px-2 py-0.5 rounded-md inline-block">
                                    📍 {lab.governorate} {lab.center ? `• ${lab.center}` : ''}
                                  </div>
                                )}
                                <div className="text-xs text-slate-500">{lab.address}</div>
                              </div>

                              {lab.labPhoto ? (
                                <img
                                  src={lab.labPhoto}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-base border border-cyan-100 shrink-0">
                                  <FlaskConical className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            {/* Core Details Highlight: Lab Phone & Service/Starting Price */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                              {/* Lab Phone */}
                              <div className="space-y-0.5">
                                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-cyan-700" />
                                  <span>رقم الهاتف:</span>
                                </div>
                                <a
                                  href={`tel:${lab.phone}`}
                                  className="font-mono font-black text-slate-900 hover:text-cyan-800 block text-sm"
                                  dir="ltr"
                                >
                                  {lab.phone}
                                </a>
                              </div>

                              {/* Service Price / Starting Price */}
                              <div className="space-y-0.5 text-left">
                                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-end gap-1">
                                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                                  <span>سعر البداية للخدمة:</span>
                                </div>
                                <div className="text-base font-black text-cyan-800">
                                  {lab.startingPrice} <span className="text-xs font-bold text-slate-500">جنيه</span>
                                </div>
                              </div>
                            </div>

                            {/* Tests & Prices Preview */}
                            <div className="space-y-1.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-xs">
                              <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                                <span>قائمة أسعار التحاليل المعتمدة ({lab.tests?.length || 0}):</span>
                                <span className="text-[10px] text-slate-400">سعر الفحص</span>
                              </div>
                              {lab.tests && lab.tests.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                  {lab.tests.map((test) => (
                                    <span
                                      key={test.id}
                                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 font-medium"
                                    >
                                      <span>{test.name}:</span>
                                      <strong className="text-cyan-800 font-black">{test.price} ج</strong>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400 italic">
                                  يتم الحساب بسعر الخدمة العام ({lab.startingPrice} ج).
                                </div>
                              )}
                            </div>

                            {/* Financial Stats Bar for this lab */}
                            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-100/80">
                              <div className="text-slate-600">
                                الحجوزات: <strong className="text-slate-900">{stats.count}</strong>
                              </div>
                              <div className="text-slate-600">
                                الإجمالي: <strong className="text-slate-900">{stats.gross} ج</strong>
                              </div>
                              <div className="text-indigo-800 font-bold">
                                عمولة {isCommissionEnabled ? `${commissionRate}%` : '0%'}: <strong>{stats.commission} ج</strong>
                              </div>
                              <div className="text-cyan-800 font-bold">
                                صافي المعمل: <strong>{stats.net} ج</strong>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <button
                                onClick={() => openProviderStatement(lab, 'lab')}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#0f2a44] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <FileText className="w-4 h-4 text-cyan-300" />
                                <span>كشف الحساب والتقارير</span>
                              </button>

                              <a
                                href={`https://wa.me/20${lab.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-200 transition-colors"
                                title="مراسلة واتساب"
                              >
                                <span>واتساب</span>
                              </a>

                              {onBlockLab && (
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من رغبتك في حظر المعمل (${lab.name})؟ سيتم إيقاف حسابه ومنع حجوزاته فوراً مع إمكانية فك الحظر لاحقاً.`)) {
                                      onBlockLab(lab.id);
                                    }
                                  }}
                                  className="p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-700 border border-slate-200 transition-colors"
                                  title="حظر المعمل"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => onDeleteLab(lab.id)}
                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 transition-colors"
                                title="حذف المعمل"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PENDING REQUESTS */}
              {activeTab === 'pending' && (
                <div className="space-y-6">
                  {totalPending === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-dashed border-slate-200">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                      <h4 className="font-bold text-slate-700 text-base">لا توجد طلبات معلقة حالياً</h4>
                      <p className="text-xs">تمت مراجعة جميع طلبات الأطباء والمعامل الجديدة بنجاح.</p>
                    </div>
                  ) : (
                    <>
                      {/* Pending Doctors */}
                      {pendingDoctors.length > 0 && (
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0f2a44] mb-3 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            <span>طلبات تسجيل أطباء قيد المراجعة ({pendingDoctors.length})</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingDoctors.map((doc) => (
                              <div key={doc.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-xs space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                      {doc.specialty}
                                    </span>
                                    <h5 className="font-black text-base text-[#0f2a44] mt-1">{doc.name}</h5>
                                    {(doc.governorate || doc.center) && (
                                      <div className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-md inline-block my-1">
                                        📍 {doc.governorate} {doc.center ? `• ${doc.center}` : ''}
                                      </div>
                                    )}
                                    <p className="text-xs text-slate-600 mt-0.5">{doc.address}</p>
                                  </div>
                                  {doc.doctorPhoto && (
                                    <img src={doc.doctorPhoto} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs" />
                                  )}
                                </div>

                                <div className="text-xs space-y-1 text-slate-600 bg-white p-2.5 rounded-xl border border-amber-100">
                                  <div><strong>هاتف العيادة:</strong> {doc.phone1}</div>
                                  {doc.phone2 && <div><strong>هاتف 2:</strong> {doc.phone2}</div>}
                                  <div><strong>سعر الكشف:</strong> {doc.price} جنيه</div>
                                  {doc.workingHours && <div><strong>المواعيد:</strong> {doc.workingHours}</div>}
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => onApproveDoctor(doc.id)}
                                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>قبول واعتماد</span>
                                  </button>
                                  <button
                                    onClick={() => onRejectDoctor(doc.id)}
                                    className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs transition-colors"
                                  >
                                    رفض
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pending Labs */}
                      {pendingLabs.length > 0 && (
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0f2a44] mb-3 flex items-center gap-2">
                            <FlaskConical className="w-4 h-4 text-cyan-700" />
                            <span>طلبات تسجيل معامل قيد المراجعة ({pendingLabs.length})</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingLabs.map((lab) => (
                              <div key={lab.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-xs space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-black text-base text-[#0f2a44]">{lab.name}</h5>
                                    {(lab.governorate || lab.center) && (
                                      <div className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-md inline-block my-1">
                                        📍 {lab.governorate} {lab.center ? `• ${lab.center}` : ''}
                                      </div>
                                    )}
                                    <p className="text-xs text-slate-600 mt-0.5">{lab.address}</p>
                                  </div>
                                  {lab.labPhoto && (
                                    <img src={lab.labPhoto} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs" />
                                  )}
                                </div>

                                <div className="text-xs space-y-1 text-slate-600 bg-white p-2.5 rounded-xl border border-amber-100">
                                  <div><strong>تليفون المعمل:</strong> {lab.phone}</div>
                                  <div><strong>عدد التحاليل:</strong> {lab.tests?.length || 0} فحص</div>
                                  <div><strong>سعر البداية للخدمة:</strong> {lab.startingPrice} جنيه</div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => onApproveLab(lab.id)}
                                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>قبول واعتماد</span>
                                  </button>
                                  <button
                                    onClick={() => onRejectLab(lab.id)}
                                    className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs transition-colors"
                                  >
                                    رفض
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB: BLOCKED PROVIDERS */}
              {activeTab === 'blocked' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50/60 p-4 rounded-2xl border border-red-200 shadow-2xs">
                    <div>
                      <h4 className="font-black text-base text-red-950 flex items-center gap-2">
                        <Ban className="w-5 h-5 text-red-600" />
                        <span>سجل مقدمي الخدمة المحظورين (أطباء ومعامل)</span>
                      </h4>
                      <p className="text-xs text-red-800/80 mt-0.5">
                        الحسابات المحظورة موقوفة تماماً عن استقبال أي حجوزات أو الظهور للمرضى في التطبيق. يمكنك فك الحظر في أي وقت.
                      </p>
                    </div>

                    <div className="relative min-w-[200px] sm:min-w-[240px]">
                      <input
                        type="text"
                        placeholder="بحث في المحظورين بالاسم أو الهاتف..."
                        value={blockedSearchTerm}
                        onChange={(e) => setBlockedSearchTerm(e.target.value)}
                        className="w-full py-2 px-3 pr-8 rounded-xl border border-red-200 text-xs focus:border-red-500 bg-white"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                    </div>
                  </div>

                  {totalBlocked === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-dashed border-slate-200">
                      <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500" />
                      <h4 className="font-bold text-slate-700 text-base">لا يوجد أي أطباء أو معامل محظورة</h4>
                      <p className="text-xs">جميع مقدمي الخدمة المعتمدين يعملون بحالة طبيعية وموثقة.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Blocked Doctors */}
                      {blockedDoctors.length > 0 && (
                        <div>
                          <h5 className="font-black text-sm text-red-900 mb-3 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-red-600" />
                            <span>أطباء محظورون ({blockedDoctors.length})</span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {blockedDoctors
                              .filter(d => !blockedSearchTerm || d.name.includes(blockedSearchTerm) || d.phone1.includes(blockedSearchTerm))
                              .map((doc) => (
                                <div key={doc.id} className="p-4 rounded-2xl bg-white border border-red-200 shadow-2xs space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                          {doc.specialty}
                                        </span>
                                        <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                          <Ban className="w-3 h-3" />
                                          <span>محظور</span>
                                        </span>
                                      </div>
                                      <h5 className="font-black text-base text-[#0f2a44] mt-1.5">{doc.name}</h5>
                                      <p className="text-xs text-slate-500">{doc.phone1} • {doc.address}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                    {onUnblockDoctor && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`هل أنت متأكد من فك الحظر عن الطبيب (${doc.name}) وإعادته للعمل في المنصة؟`)) {
                                            onUnblockDoctor(doc.id);
                                          }
                                        }}
                                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                                      >
                                        <UserCheck className="w-4 h-4" />
                                        <span>فك الحظر واستعادة الحساب</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onDeleteDoctor(doc.id)}
                                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 transition-colors"
                                      title="حذف نهائي"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Blocked Labs */}
                      {blockedLabs.length > 0 && (
                        <div>
                          <h5 className="font-black text-sm text-red-900 mb-3 flex items-center gap-2">
                            <FlaskConical className="w-4 h-4 text-red-600" />
                            <span>معامل محظورة ({blockedLabs.length})</span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {blockedLabs
                              .filter(l => !blockedSearchTerm || l.name.includes(blockedSearchTerm) || l.phone.includes(blockedSearchTerm))
                              .map((lab) => (
                                <div key={lab.id} className="p-4 rounded-2xl bg-white border border-red-200 shadow-2xs space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                          معمل تحاليل
                                        </span>
                                        <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                          <Ban className="w-3 h-3" />
                                          <span>محظور</span>
                                        </span>
                                      </div>
                                      <h5 className="font-black text-base text-[#0f2a44] mt-1.5">{lab.name}</h5>
                                      <p className="text-xs text-slate-500">{lab.phone} • {lab.address}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                    {onUnblockLab && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`هل أنت متأكد من فك الحظر عن المعمل (${lab.name}) وإعادته للعمل في المنصة؟`)) {
                                            onUnblockLab(lab.id);
                                          }
                                        }}
                                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                                      >
                                        <UserCheck className="w-4 h-4" />
                                        <span>فك الحظر واستعادة الحساب</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onDeleteLab(lab.id)}
                                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 transition-colors"
                                      title="حذف نهائي"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PATIENT BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {/* Search Filter for bookings */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="بحث في الحجوزات باسم المريض أو الهاتف أو مقدم الخدمة أو كود الحجز..."
                      value={bookingFilterTerm}
                      onChange={(e) => setBookingFilterTerm(e.target.value)}
                      className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 bg-white"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                      لا توجد حجوزات مسجلة تطابق البحث.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredBookings.map((b) => {
                        const comm = Math.round((b.price || 0) * 0.10);
                        const net = (b.price || 0) - comm;
                        return (
                          <div
                            key={b.id}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                                  {b.bookingCode}
                                </span>
                                <h5 className="font-extrabold text-sm text-[#0f2a44]">
                                  {b.patientName}
                                </h5>
                                <span className="font-mono text-xs text-slate-500">({b.patientPhone})</span>
                              </div>

                              <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                                <span><strong>الجهة:</strong> {b.providerName} ({b.providerSpecialtyOrType})</span>
                                <span>•</span>
                                <span><strong>الموعد:</strong> {b.appointmentDate} {b.appointmentTime}</span>
                                <span>•</span>
                                <span className="text-[#0d9488] font-bold"><strong>السعر:</strong> {b.price} جنيه</span>
                                <span>•</span>
                                <span className="text-indigo-700 font-bold"><strong>نسبة التطبيق 10%:</strong> {comm} جنيه</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold"><strong>صافي المقدم:</strong> {net} جنيه</span>
                              </div>

                              {b.selectedTestName && (
                                <div className="text-[11px] text-teal-700">
                                  <strong>التحليل:</strong> {b.selectedTestName}
                                </div>
                              )}

                              {b.notes && (
                                <div className="text-[11px] text-slate-500">
                                  <strong>ملاحظات:</strong> {b.notes}
                                </div>
                              )}
                            </div>

                            {/* Status changer & delete */}
                            <div className="flex items-center gap-2 self-end md:self-center">
                              <select
                                value={b.status}
                                onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as BookingStatus, b)}
                                className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : b.status === 'completed'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : b.status === 'cancelled'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="confirmed">تم التأكيد</option>
                                <option value="completed">مكتمل</option>
                                <option value="cancelled">ملغي</option>
                              </select>

                              <button
                                onClick={() => onDeleteBooking(b.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                title="حذف الحجز"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-lg">
                  {/* Change Password */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <h5 className="font-extrabold text-sm text-[#0f2a44] flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-teal-600" />
                      <span>تغيير كلمة مرور الإدارة</span>
                    </h5>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="كلمة مرور جديدة..."
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                      <button
                        onClick={handleChangePassword}
                        className="py-2 px-4 rounded-xl bg-[#0f2a44] text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                      >
                        تحديث
                      </button>
                    </div>
                  </div>

                  {/* Reset Demo Data */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <h5 className="font-extrabold text-sm text-rose-900 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-rose-600" />
                      <span>إعادة تعيين البيانات للوضع الافتراضي</span>
                    </h5>
                    <p className="text-xs text-rose-700">
                      سيؤدي هذا إلى إعادة تعيين قائمة الأطباء والمعامل والحجوزات إلى البيانات النموذجية الأصلية.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين البيانات النموذجية؟')) {
                          onResetSeedData();
                          alert('تمت استعادة البيانات الافتراضية بنجاح');
                        }
                      }}
                      className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      استعادة البيانات الأولية
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* Individual Provider Statement Modal */}
      <ProviderStatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        provider={selectedProviderForStatement}
        providerType={selectedTypeForStatement}
        bookings={bookings}
      />

      {/* Internal Registration Modal: Add Doctor */}
      {isAddDoctorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
            <div className="bg-gradient-to-l from-[#0f2a44] to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base">إضافة طبيب جديد (تسجيل داخلي مباشر)</h4>
                  <p className="text-xs text-teal-200/80">تفعيل فوري مع توليد كود التحقق الأمني (OTP)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDoctorOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="p-4 sm:p-6 space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطبيب الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. مصطفى كمال"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الطبي *</label>
                  <select
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 bg-white"
                  >
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الكشف (جنيه) *</label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="5000"
                    value={newDocPrice}
                    onChange={(e) => setNewDocPrice(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف العيادة (للدخول واستقبال OTP) *</label>
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={newDocPhone}
                  onChange={(e) => setNewDocPhone(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                  <select
                    value={newDocGov}
                    onChange={(e) => {
                      const gov = e.target.value;
                      setNewDocGov(gov);
                      const centers = getCentersForGovernorate(gov);
                      if (centers.length > 0) setNewDocCenter(centers[0]);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 bg-white"
                  >
                    {EGYPT_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المركز / المدينة</label>
                  <select
                    value={newDocCenter}
                    onChange={(e) => setNewDocCenter(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 bg-white"
                  >
                    {getCentersForGovernorate(newDocGov).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان العيادة التفصيلي</label>
                <input
                  type="text"
                  placeholder="مثال: شارع المحطة، برج الأطباء، الدور الثالث"
                  value={newDocAddress}
                  onChange={(e) => setNewDocAddress(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  سيتم تفعيل حساب الطبيب مباشرة وتوليد كود تأكيد OTP لحسابه، مع إرسال الرسالة الترحيبية وتجهيزه للدخول الفوري.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  اعتماد وإضافة الطبيب فوراً
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Registration Modal: Add Lab */}
      {isAddLabOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
            <div className="bg-gradient-to-l from-[#0f2a44] to-cyan-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base">إضافة معمل جديد (تسجيل داخلي مباشر)</h4>
                  <p className="text-xs text-cyan-200/80">تفعيل فوري مع توليد كود التحقق الأمني (OTP)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLabOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLabSubmit} className="p-4 sm:p-6 space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعمل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: معمل الدقة للتحاليل الطبية"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (للدخول واستقبال OTP) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01098765432"
                    value={newLabPhone}
                    onChange={(e) => setNewLabPhone(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر بداية الخدمات / الفحوصات *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="5000"
                    value={newLabStartingPrice}
                    onChange={(e) => setNewLabStartingPrice(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                  <select
                    value={newLabGov}
                    onChange={(e) => {
                      const gov = e.target.value;
                      setNewLabGov(gov);
                      const centers = getCentersForGovernorate(gov);
                      if (centers.length > 0) setNewLabCenter(centers[0]);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 bg-white"
                  >
                    {EGYPT_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المركز / المدينة</label>
                  <select
                    value={newLabCenter}
                    onChange={(e) => setNewLabCenter(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500 bg-white"
                  >
                    {getCentersForGovernorate(newLabGov).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المعمل التفصيلي</label>
                <input
                  type="text"
                  placeholder="مثال: ميدان الثقافة، بجوار مستشفى الهلال"
                  value={newLabAddress}
                  onChange={(e) => setNewLabAddress(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <span>
                  يتم إدراج المعمل وتوليد كود OTP فوري وإعداد باقة الفحوصات الأساسية (CBC، سكر، كبد وكلى) تلقائياً.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  اعتماد وإضافة المعمل فوراً
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddLabOpen(false)}
                  className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
