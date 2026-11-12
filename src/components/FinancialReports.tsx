import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Percent, 
  Calendar, 
  Stethoscope, 
  FlaskConical, 
  Printer, 
  FileText, 
  ArrowUpRight, 
  Search, 
  Phone, 
  Eye, 
  Filter, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Doctor, Lab, Booking } from '../types';
import { ProviderStatementModal } from './ProviderStatementModal';

interface FinancialReportsProps {
  doctors: Doctor[];
  labs: Lab[];
  bookings: Booking[];
  isCommissionEnabled?: boolean;
  commissionRate?: number;
  onToggleCommission?: (enabled: boolean) => void;
}

export type TimeRange = 'today' | 'week' | 'month' | 'all';
export type RevenueStatusFilter = 'all_active' | 'completed_only' | 'all';

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  doctors,
  labs,
  bookings,
  isCommissionEnabled = true,
  commissionRate = 12,
  onToggleCommission
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [statusFilter, setStatusFilter] = useState<RevenueStatusFilter>('all_active');
  const [searchTerm, setSearchTerm] = useState('');
  const [providerTypeFilter, setProviderTypeFilter] = useState<'all' | 'doctors' | 'labs'>('all');

  // Selected provider for single statement modal
  const [selectedProvider, setSelectedProvider] = useState<Doctor | Lab | null>(null);
  const [selectedProviderType, setSelectedProviderType] = useState<'doctor' | 'lab'>('doctor');
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // Time boundaries
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Effective commission rate based on master switch (12% if enabled, 0% if disabled)
  const effectiveRate = isCommissionEnabled ? (commissionRate / 100) : 0;

  // Helper to test if a booking falls in a given range
  const matchesTimeRange = (b: Booking, range: TimeRange) => {
    if (range === 'all') return true;
    if (range === 'today') {
      return b.appointmentDate === todayStr || (b.createdAt && b.createdAt.startsWith(todayStr));
    }
    const bDate = new Date(b.createdAt || b.appointmentDate);
    if (range === 'week') {
      return bDate >= sevenDaysAgo;
    }
    if (range === 'month') {
      return bDate >= thirtyDaysAgo;
    }
    return true;
  };

  // Helper to test status
  const matchesStatus = (b: Booking, filter: RevenueStatusFilter) => {
    if (filter === 'all') return true;
    if (filter === 'completed_only') return b.status === 'completed';
    // all_active: excludes cancelled
    return b.status !== 'cancelled';
  };

  // Filtered bookings in selected timeframe
  const currentFilteredBookings = useMemo(() => {
    return bookings.filter((b) => matchesTimeRange(b, timeRange) && matchesStatus(b, statusFilter));
  }, [bookings, timeRange, statusFilter, todayStr]);

  // Overall platform stats in the chosen timeframe
  const overallStats = useMemo(() => {
    const totalCount = currentFilteredBookings.length;
    const totalGross = currentFilteredBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const appCommission = Math.round(totalGross * effectiveRate);
    const providersNet = totalGross - appCommission;

    const doctorBookings = currentFilteredBookings.filter((b) => b.providerType === 'doctor');
    const labBookings = currentFilteredBookings.filter((b) => b.providerType === 'lab');

    const doctorGross = doctorBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const labGross = labBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    const doctorCommission = Math.round(doctorGross * effectiveRate);
    const labCommission = Math.round(labGross * effectiveRate);

    const doctorNet = doctorGross - doctorCommission;
    const labNet = labGross - labCommission;

    // Today specific counts for reference
    const todayBookings = bookings.filter((b) => matchesTimeRange(b, 'today') && b.status !== 'cancelled');
    const weekBookings = bookings.filter((b) => matchesTimeRange(b, 'week') && b.status !== 'cancelled');
    const monthBookings = bookings.filter((b) => matchesTimeRange(b, 'month') && b.status !== 'cancelled');

    return {
      totalCount,
      totalGross,
      appCommission,
      providersNet,
      doctorCount: doctorBookings.length,
      doctorGross,
      doctorCommission,
      doctorNet,
      labCount: labBookings.length,
      labGross,
      labCommission,
      labNet,
      todayCount: todayBookings.length,
      todayGross: todayBookings.reduce((sum, b) => sum + (b.price || 0), 0),
      todayCommission: Math.round(todayBookings.reduce((sum, b) => sum + (b.price || 0), 0) * effectiveRate),
      weekCount: weekBookings.length,
      weekGross: weekBookings.reduce((sum, b) => sum + (b.price || 0), 0),
      weekCommission: Math.round(weekBookings.reduce((sum, b) => sum + (b.price || 0), 0) * effectiveRate),
      monthCount: monthBookings.length,
      monthGross: monthBookings.reduce((sum, b) => sum + (b.price || 0), 0),
      monthCommission: Math.round(monthBookings.reduce((sum, b) => sum + (b.price || 0), 0) * effectiveRate),
    };
  }, [currentFilteredBookings, bookings, effectiveRate]);

  // Compute breakdown for each doctor
  const doctorFinancialList = useMemo(() => {
    return doctors.map((doc) => {
      const docBookings = currentFilteredBookings.filter((b) => b.providerId === doc.id);
      const gross = docBookings.reduce((sum, b) => sum + (b.price || 0), 0);
      const commission = Math.round(gross * effectiveRate);
      const net = gross - commission;

      // Also compute daily, weekly, and monthly counts for quick badge display
      const allDocBookings = bookings.filter((b) => b.providerId === doc.id && b.status !== 'cancelled');
      const todayCount = allDocBookings.filter((b) => matchesTimeRange(b, 'today')).length;
      const todayGross = allDocBookings.filter((b) => matchesTimeRange(b, 'today')).reduce((s, b) => s + (b.price || 0), 0);
      const weekCount = allDocBookings.filter((b) => matchesTimeRange(b, 'week')).length;
      const weekGross = allDocBookings.filter((b) => matchesTimeRange(b, 'week')).reduce((s, b) => s + (b.price || 0), 0);
      const monthCount = allDocBookings.filter((b) => matchesTimeRange(b, 'month')).length;
      const monthGross = allDocBookings.filter((b) => matchesTimeRange(b, 'month')).reduce((s, b) => s + (b.price || 0), 0);

      return {
        doctor: doc,
        count: docBookings.length,
        gross,
        commission,
        net,
        todayCount,
        todayGross,
        todayCommission: Math.round(todayGross * effectiveRate),
        weekCount,
        weekGross,
        weekCommission: Math.round(weekGross * effectiveRate),
        monthCount,
        monthGross,
        monthCommission: Math.round(monthGross * effectiveRate),
        totalAllCount: allDocBookings.length,
      };
    }).filter((item) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.doctor.name.toLowerCase().includes(term) ||
        item.doctor.specialty.toLowerCase().includes(term) ||
        item.doctor.phone1.includes(term) ||
        (item.doctor.governorate && item.doctor.governorate.toLowerCase().includes(term))
      );
    });
  }, [doctors, currentFilteredBookings, bookings, searchTerm, effectiveRate]);

  // Compute breakdown for each lab
  const labFinancialList = useMemo(() => {
    return labs.map((lab) => {
      const labBookings = currentFilteredBookings.filter((b) => b.providerId === lab.id);
      const gross = labBookings.reduce((sum, b) => sum + (b.price || 0), 0);
      const commission = Math.round(gross * effectiveRate);
      const net = gross - commission;

      const allLabBookings = bookings.filter((b) => b.providerId === lab.id && b.status !== 'cancelled');
      const todayCount = allLabBookings.filter((b) => matchesTimeRange(b, 'today')).length;
      const todayGross = allLabBookings.filter((b) => matchesTimeRange(b, 'today')).reduce((s, b) => s + (b.price || 0), 0);
      const weekCount = allLabBookings.filter((b) => matchesTimeRange(b, 'week')).length;
      const weekGross = allLabBookings.filter((b) => matchesTimeRange(b, 'week')).reduce((s, b) => s + (b.price || 0), 0);
      const monthCount = allLabBookings.filter((b) => matchesTimeRange(b, 'month')).length;
      const monthGross = allLabBookings.filter((b) => matchesTimeRange(b, 'month')).reduce((s, b) => s + (b.price || 0), 0);

      return {
        lab,
        count: labBookings.length,
        gross,
        commission,
        net,
        todayCount,
        todayGross,
        todayCommission: Math.round(todayGross * effectiveRate),
        weekCount,
        weekGross,
        weekCommission: Math.round(weekGross * effectiveRate),
        monthCount,
        monthGross,
        monthCommission: Math.round(monthGross * effectiveRate),
        totalAllCount: allLabBookings.length,
      };
    }).filter((item) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.lab.name.toLowerCase().includes(term) ||
        item.lab.phone.includes(term) ||
        (item.lab.governorate && item.lab.governorate.toLowerCase().includes(term))
      );
    });
  }, [labs, currentFilteredBookings, bookings, searchTerm, effectiveRate]);

  const handleOpenStatement = (provider: Doctor | Lab, type: 'doctor' | 'lab') => {
    setSelectedProvider(provider);
    setSelectedProviderType(type);
    setIsStatementOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Master Commission Control Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0f2a44] via-teal-950 to-slate-900 text-white border border-teal-500/30 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-base sm:text-lg">
                زر التحكم الرئيسي لعمولة المنصة ({commissionRate}%)
              </h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                isCommissionEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                  : 'bg-slate-700/60 text-slate-300 border-slate-600'
              }`}>
                {isCommissionEnabled ? 'مفعلة (ON)' : 'معطلة (OFF)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isCommissionEnabled 
                ? `يتم احتساب ${commissionRate}% تلقائياً من قيمة كشف الطبيب أو سعر تحليل المعمل.`
                : 'العمولة معطلة حالياً (0%) - كامل الإيرادات تذهب للأطباء والمعامل مجاناً.'}
            </p>
          </div>
        </div>

        {onToggleCommission && (
          <button
            type="button"
            onClick={() => onToggleCommission(!isCommissionEnabled)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md ${
              isCommissionEnabled
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-300/40'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${isCommissionEnabled ? 'bg-slate-950 animate-pulse' : 'bg-red-400'}`} />
            <span>{isCommissionEnabled ? 'العمولة مفعلة [إيقاف الآن]' : 'العمولة معطلة [تفعيل 12% الآن]'}</span>
          </button>
        )}
      </div>

      {/* Top Header & Range Switcher */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl text-[#0f2a44]">
                تقارير الحجوزات والعمولات المالية ({isCommissionEnabled ? `${commissionRate}%` : '0% مجاني'})
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-800 text-xs font-black border border-teal-500/30">
                {isCommissionEnabled ? `نسبة التطبيق ${commissionRate}% تلقائياً` : 'بدون عمولة حالياً'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              متابعة حسابات الأطباء والمعامل اليومية، الأسبوعية، والشهرية، مع حساب صافي المستحقات.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="طباعة التقرير الشامل"
            >
              <Printer className="w-4 h-4 text-teal-600" />
              <span>طباعة التقرير</span>
            </button>
          </div>
        </div>

        {/* Filters: Period & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Period Tabs: اليوم / آخر 7 أيام / آخر 30 يوماً / الكل */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                timeRange === 'today'
                  ? 'bg-[#0d9488] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تقرير اليوم
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                timeRange === 'week'
                  ? 'bg-[#0d9488] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر أسبوع (7 أيام)
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                timeRange === 'month'
                  ? 'bg-[#0d9488] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر شهر (30 يوماً)
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                timeRange === 'all'
                  ? 'bg-[#0d9488] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جميع الفترات
            </button>
          </div>

          {/* Booking Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold hidden md:inline">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RevenueStatusFilter)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="all_active">الحجوزات النشطة (غير الملغاة)</option>
              <option value="completed_only">الحجوزات المكتملة فقط</option>
              <option value="all">كل الحجوزات (بما فيها الملغاة)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Main Executive Financial KPI Cards for the Selected Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Gross Platform Revenue */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0f2a44] to-slate-900 text-white shadow-md relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1">
            <span>إجمالي المبالغ المحصلة</span>
            <Coins className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {overallStats.totalGross.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-bold text-teal-300">جنيه</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>عدد الحجوزات: <strong className="text-white">{overallStats.totalCount}</strong></span>
            <span>
              {timeRange === 'today' ? 'اليوم' : timeRange === 'week' ? 'آخر 7 أيام' : timeRange === 'month' ? 'آخر 30 يوماً' : 'الإجمالي'}
            </span>
          </div>
        </div>

        {/* Card 2: App 10% Commission */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white shadow-md relative overflow-hidden border border-indigo-800">
          <div className="flex items-center justify-between text-xs text-indigo-200 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <span>أرباح التطبيق</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">10%</span>
            </span>
            <Percent className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
            {overallStats.appCommission.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-bold text-white">جنيه</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-indigo-200 border-t border-indigo-800/80 pt-2">
            <span>الأطباء: <strong className="text-white">{overallStats.doctorCommission} ج</strong></span>
            <span>المعامل: <strong className="text-white">{overallStats.labCommission} ج</strong></span>
          </div>
        </div>

        {/* Card 3: Doctors Net 90% */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 text-slate-800 shadow-2xs border border-teal-200">
          <div className="flex items-center justify-between text-xs text-teal-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#0d9488]" />
              <span>صافي مستحقات الأطباء</span>
              <span className="px-1 py-0.2 rounded bg-teal-100 text-teal-900 text-[10px] font-bold">90%</span>
            </span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0f2a44] mt-1">
            {overallStats.doctorNet.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-bold text-slate-500">جنيه</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-teal-700 border-t border-teal-200/80 pt-2 font-semibold">
            <span>من إجمالي: {overallStats.doctorGross} ج</span>
            <span>{overallStats.doctorCount} كشف</span>
          </div>
        </div>

        {/* Card 4: Labs Net 90% */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 text-slate-800 shadow-2xs border border-cyan-200">
          <div className="flex items-center justify-between text-xs text-cyan-900 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-cyan-600" />
              <span>صافي مستحقات المعامل</span>
              <span className="px-1 py-0.2 rounded bg-cyan-100 text-cyan-900 text-[10px] font-bold">90%</span>
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0f2a44] mt-1">
            {overallStats.labNet.toLocaleString('ar-EG')}{' '}
            <span className="text-xs font-bold text-slate-500">جنيه</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-cyan-800 border-t border-cyan-200/80 pt-2 font-semibold">
            <span>من إجمالي: {overallStats.labGross} ج</span>
            <span>{overallStats.labCount} فحص</span>
          </div>
        </div>

      </div>

      {/* Snapshot Reference Summary (Today vs 7 Days vs 30 Days) */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Today Snapshot */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>تقرير اليوم ({todayStr})</span>
            </div>
            <div className="text-lg font-black text-[#0f2a44] mt-0.5">
              {overallStats.todayGross.toLocaleString('ar-EG')} ج
            </div>
            <div className="text-[11px] text-teal-700 font-bold">
              عمولة التطبيق 10%: {overallStats.todayCommission} ج
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 font-black">
              {overallStats.todayCount} حجز
            </span>
          </div>
        </div>

        {/* Weekly Snapshot */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>تقرير آخر أسبوع (7 أيام)</span>
            </div>
            <div className="text-lg font-black text-[#0f2a44] mt-0.5">
              {overallStats.weekGross.toLocaleString('ar-EG')} ج
            </div>
            <div className="text-[11px] text-indigo-700 font-bold">
              عمولة التطبيق 10%: {overallStats.weekCommission} ج
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 font-black">
              {overallStats.weekCount} حجز
            </span>
          </div>
        </div>

        {/* Monthly Snapshot */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>تقرير آخر شهر (30 يوماً)</span>
            </div>
            <div className="text-lg font-black text-[#0f2a44] mt-0.5">
              {overallStats.monthGross.toLocaleString('ar-EG')} ج
            </div>
            <div className="text-[11px] text-emerald-700 font-bold">
              عمولة التطبيق 10%: {overallStats.monthCommission} ج
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-black">
              {overallStats.monthCount} حجز
            </span>
          </div>
        </div>
      </div>

      {/* Provider Section Tabs (All vs Doctors vs Labs) + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProviderTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              providerTypeFilter === 'all'
                ? 'bg-[#0f2a44] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            الكل ({doctors.length + labs.length})
          </button>
          <button
            onClick={() => setProviderTypeFilter('doctors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              providerTypeFilter === 'doctors'
                ? 'bg-[#0d9488] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>الأطباء ({doctors.length})</span>
          </button>
          <button
            onClick={() => setProviderTypeFilter('labs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              providerTypeFilter === 'labs'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>معامل التحاليل ({labs.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="بحث بالاسم أو التخصص أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-3 pr-8 rounded-xl border border-slate-200 text-xs focus:border-teal-500 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* SECTION 1: DOCTORS FINANCIAL REPORTS TABLE */}
      {(providerTypeFilter === 'all' || providerTypeFilter === 'doctors') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0d9488] flex items-center justify-center font-bold">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-[#0f2a44]">
                  تقارير وحسابات الأطباء (عمولة 10%)
                </h4>
                <p className="text-xs text-slate-500">
                  عرض اسم الطبيب، هاتف العيادة، سعر الكشف، عدد الحجوزات، وصافي المستحقات.
                </p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 font-bold">
              {doctorFinancialList.length} طبيب
            </span>
          </div>

          {doctorFinancialList.length === 0 ? (
            <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
              لا يوجد أطباء مسجلون حالياً أو لا يوجد نتائج تطابق البحث.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0f2a44] text-white font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-3">اسم الطبيب والتخصص</th>
                    <th className="py-3 px-3">هاتف العيادة</th>
                    <th className="py-3 px-3">سعر الكشف</th>
                    <th className="py-3 px-3 text-center">
                      عدد الحجوزات ({timeRange === 'today' ? 'اليوم' : timeRange === 'week' ? 'أسبوعي' : timeRange === 'month' ? 'شهري' : 'الإجمالي'})
                    </th>
                    <th className="py-3 px-3 text-left">إجمالي المبالغ</th>
                    <th className="py-3 px-3 text-left">حصة التطبيق (10%)</th>
                    <th className="py-3 px-3 text-left">صافي الطبيب (90%)</th>
                    <th className="py-3 px-3 text-center">كشف الحساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {doctorFinancialList.map(({ doctor, count, gross, commission, net, todayCount, weekCount, monthCount }) => (
                    <tr key={doctor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-[#0f2a44] text-sm">{doctor.name}</div>
                        <div className="text-[11px] text-teal-700 font-semibold">{doctor.specialty}</div>
                        {doctor.governorate && (
                          <div className="text-[10px] text-slate-400">
                            📍 {doctor.governorate} {doctor.center ? `• ${doctor.center}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700" dir="ltr">
                        <div>{doctor.phone1}</div>
                        {doctor.phone2 && <div className="text-[10px] text-slate-400">{doctor.phone2}</div>}
                      </td>
                      <td className="py-3.5 px-3 font-black text-emerald-700">
                        {doctor.price} جنيه
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-xl bg-teal-50 text-teal-900 font-black text-xs inline-block">
                          {count} حجز
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                          <span title="حجوزات اليوم">يومي: {todayCount}</span>
                          <span>•</span>
                          <span title="حجوزات الأسبوع">أسبوعي: {weekCount}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-left font-black text-[#0f2a44]">
                        {gross.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3.5 px-3 text-left font-extrabold text-indigo-700">
                        {commission.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3.5 px-3 text-left font-black text-emerald-700">
                        {net.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenStatement(doctor, 'doctor')}
                          className="px-2.5 py-1.5 rounded-xl bg-[#0f2a44] hover:bg-slate-800 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 active:scale-95 shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-300" />
                          <span>كشف مفصل</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LABS FINANCIAL REPORTS TABLE */}
      {(providerTypeFilter === 'all' || providerTypeFilter === 'labs') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-[#0f2a44]">
                  تقارير وحسابات معامل التحاليل (عمولة 10%)
                </h4>
                <p className="text-xs text-slate-500">
                  عرض اسم المعمل، رقم الهاتف، سعر الخدمة/التحليل، عدد الحجوزات، وصافي المستحقات.
                </p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-800 font-bold">
              {labFinancialList.length} معمل
            </span>
          </div>

          {labFinancialList.length === 0 ? (
            <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
              لا توجد معامل مسجلة حالياً أو لا يوجد نتائج تطابق البحث.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0f2a44] text-white font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-3">اسم المعمل</th>
                    <th className="py-3 px-3">رقم الهاتف</th>
                    <th className="py-3 px-3">سعر الخدمة / التحليل</th>
                    <th className="py-3 px-3 text-center">
                      عدد الفحوصات ({timeRange === 'today' ? 'اليوم' : timeRange === 'week' ? 'أسبوعي' : timeRange === 'month' ? 'شهري' : 'الإجمالي'})
                    </th>
                    <th className="py-3 px-3 text-left">إجمالي المبالغ</th>
                    <th className="py-3 px-3 text-left">حصة التطبيق (10%)</th>
                    <th className="py-3 px-3 text-left">صافي المعمل (90%)</th>
                    <th className="py-3 px-3 text-center">كشف الحساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {labFinancialList.map(({ lab, count, gross, commission, net, todayCount, weekCount, monthCount }) => (
                    <tr key={lab.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-[#0f2a44] text-sm">{lab.name}</div>
                        <div className="text-[11px] text-cyan-800">
                          {lab.tests?.length || 0} تحليل معتمد
                        </div>
                        {lab.governorate && (
                          <div className="text-[10px] text-slate-400">
                            📍 {lab.governorate} {lab.center ? `• ${lab.center}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700" dir="ltr">
                        {lab.phone}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-black text-cyan-800">
                          يبدأ من {lab.startingPrice} ج
                        </div>
                        {lab.tests && lab.tests.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {lab.tests[0].name}: {lab.tests[0].price} ج
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-900 font-black text-xs inline-block">
                          {count} حجز
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                          <span title="حجوزات اليوم">يومي: {todayCount}</span>
                          <span>•</span>
                          <span title="حجوزات الأسبوع">أسبوعي: {weekCount}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-left font-black text-[#0f2a44]">
                        {gross.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3.5 px-3 text-left font-extrabold text-indigo-700">
                        {commission.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3.5 px-3 text-left font-black text-cyan-800">
                        {net.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenStatement(lab, 'lab')}
                          className="px-2.5 py-1.5 rounded-xl bg-[#0f2a44] hover:bg-slate-800 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 active:scale-95 shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-300" />
                          <span>كشف مفصل</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Provider Detailed Statement Modal */}
      <ProviderStatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        provider={selectedProvider}
        providerType={selectedProviderType}
        bookings={bookings}
      />

    </div>
  );
};
