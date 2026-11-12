import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  FlaskConical, 
  Calendar, 
  Phone, 
  MapPin, 
  Printer, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Percent,
  Search
} from 'lucide-react';
import { Doctor, Lab, Booking } from '../types';

interface ProviderStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Doctor | Lab | null;
  providerType: 'doctor' | 'lab';
  bookings: Booking[];
  isCommissionEnabled?: boolean;
  commissionRate?: number;
}

export const ProviderStatementModal: React.FC<ProviderStatementModalProps> = ({
  isOpen,
  onClose,
  provider,
  providerType,
  bookings,
  isCommissionEnabled = true,
  commissionRate = 12
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'confirmed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !provider) return null;

  const isDoctor = providerType === 'doctor';
  const doctor = isDoctor ? (provider as Doctor) : null;
  const lab = !isDoctor ? (provider as Lab) : null;

  // Provider's bookings
  const providerBookings = bookings.filter((b) => b.providerId === provider.id);

  // Time calculation
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredBookings = providerBookings.filter((b) => {
    // Time filtering
    if (timeFilter === 'today') {
      const isToday = b.appointmentDate === todayStr || (b.createdAt && b.createdAt.startsWith(todayStr));
      if (!isToday) return false;
    } else if (timeFilter === 'week') {
      const bDate = new Date(b.createdAt || b.appointmentDate);
      if (bDate < sevenDaysAgo) return false;
    } else if (timeFilter === 'month') {
      const bDate = new Date(b.createdAt || b.appointmentDate);
      if (bDate < thirtyDaysAgo) return false;
    }

    // Status filtering
    if (statusFilter === 'completed' && b.status !== 'completed') return false;
    if (statusFilter === 'confirmed' && b.status !== 'confirmed' && b.status !== 'completed') return false;

    // Search term filtering
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        b.patientName.toLowerCase().includes(term) ||
        b.patientPhone.includes(term) ||
        b.bookingCode.toLowerCase().includes(term) ||
        (b.selectedTestName && b.selectedTestName.toLowerCase().includes(term))
      );
    }

    return true;
  });

  // Financial Stats
  // Completed and active bookings calculate money
  const validForRevenue = filteredBookings.filter((b) => b.status !== 'cancelled');
  const totalGrossRevenue = validForRevenue.reduce((sum, b) => sum + (b.price || 0), 0);
  const effectiveRate = isCommissionEnabled ? (commissionRate / 100) : 0;
  const appCommission10 = Math.round(totalGrossRevenue * effectiveRate);
  const providerNet90 = totalGrossRevenue - appCommission10;

  const completedCount = filteredBookings.filter((b) => b.status === 'completed').length;
  const confirmedCount = filteredBookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = filteredBookings.filter((b) => b.status === 'pending').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0f2a44] text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              {isDoctor ? <Stethoscope className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  كشف حساب مالي تفصيلي: {provider.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                  {isDoctor ? doctor?.specialty : 'معمل تحاليل طبية'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                حساب نسبة التطبيق (10%) وصافي مستحقات مقدم الخدمة (90%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="طباعة كشف الحساب"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة التقرير</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          
          {/* Provider Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="font-bold">رقم الهاتف:</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold" dir="ltr">
                  {isDoctor ? doctor?.phone1 : lab?.phone}
                </span>
                {isDoctor && doctor?.phone2 && (
                  <span className="font-mono text-slate-500 dark:text-slate-400" dir="ltr">/ {doctor.phone2}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold">
                  {isDoctor ? 'سعر الكشف المحدد:' : 'سعر البداية / الخدمة:'}
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-400">
                  {isDoctor ? `${doctor?.price} جنيه` : `${lab?.startingPrice} جنيه`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{provider.address}</span>
                {(provider.governorate || provider.center) && (
                  <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-teal-800 dark:text-teal-300">
                    {provider.governorate} {provider.center ? `• ${provider.center}` : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              إجمالي الحجوزات المسجلة: <span className="font-bold text-slate-900 dark:text-white">{providerBookings.length}</span>
            </div>
          </div>

          {/* Time & Status Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs">
            {/* Period Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  timeFilter === 'today'
                    ? 'bg-[#0d9488] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                تقرير اليوم
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  timeFilter === 'week'
                    ? 'bg-[#0d9488] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                آخر أسبوع (7 أيام)
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  timeFilter === 'month'
                    ? 'bg-[#0d9488] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                آخر شهر (30 يوماً)
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  timeFilter === 'all'
                    ? 'bg-[#0d9488] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                كافة الفترات
              </button>
            </div>

            {/* Search in bookings */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="بحث بالمريض أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-1.5 px-3 pr-8 rounded-xl border border-slate-200 text-xs focus:border-teal-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          {/* Key Financial Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Gross Revenue */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-teal-800 font-bold mb-1">
                <span>إجمالي مبالغ الحجوزات</span>
                <Coins className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-[#0f2a44]">
                {totalGrossRevenue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-500">جنيه</span>
              </div>
              <div className="text-[11px] text-teal-700 mt-1 font-semibold">
                حساب إجمالي الكشوفات / التحاليل في الفترة المحددة
              </div>
            </div>

            {/* App 10% Commission */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-indigo-800 font-bold mb-1">
                <span className="flex items-center gap-1">
                  <span>حصة التطبيق</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-900 text-[10px]">10%</span>
                </span>
                <Percent className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-900">
                {appCommission10.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-500">جنيه</span>
              </div>
              <div className="text-[11px] text-indigo-700 mt-1 font-semibold">
                العمولة المستحقة لصالح منصة «احجز عند دكتورك»
              </div>
            </div>

            {/* Provider 90% Net */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                <span className="flex items-center gap-1">
                  <span>صافي مستحقات {isDoctor ? 'الطبيب' : 'المعمل'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 text-[10px]">90%</span>
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-800">
                {providerNet90.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-500">جنيه</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
                صافي دخل العيادة أو المعمل بعد خصم النسبة
              </div>
            </div>
          </div>

          {/* Booking Counts pill summary */}
          <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="font-bold text-slate-600">ملخص الحالات:</span>
            <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 font-bold">
              مكتمل: {completedCount}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              مؤكد: {confirmedCount}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold">
              قيد الانتظار: {pendingCount}
            </span>
            <span className="mr-auto font-bold text-slate-500 text-[11px]">
              عدد العمليات المعروضة: {filteredBookings.length}
            </span>
          </div>

          {/* Bookings Detailed Table */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-[#0f2a44] flex items-center justify-between">
              <span>سجل الحجوزات والعمليات المالية:</span>
              <span className="text-xs text-slate-400 font-normal">
                {timeFilter === 'today' ? 'تقرير اليوم' : timeFilter === 'week' ? 'آخر 7 أيام' : timeFilter === 'month' ? 'آخر 30 يوماً' : 'كل الحجوزات'}
              </span>
            </h4>

            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                لا توجد حجوزات مسجلة لهذا المقدم خلال الفترة المحددة.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#0f2a44] dark:bg-slate-950 text-white font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-3">كود الحجز</th>
                      <th className="py-3 px-3">المريض</th>
                      <th className="py-3 px-3">التاريخ والوقت</th>
                      <th className="py-3 px-3">الخدمة / الكشف</th>
                      <th className="py-3 px-3">الحالة</th>
                      <th className="py-3 px-3 text-left">المبلغ الإجمالي</th>
                      <th className="py-3 px-3 text-left">حصة التطبيق ({isCommissionEnabled ? `${commissionRate}%` : '0%'})</th>
                      <th className="py-3 px-3 text-left">صافي المقدم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredBookings.map((b) => {
                      const comm = Math.round((b.price || 0) * (isCommissionEnabled ? (commissionRate / 100) : 0));
                      const net = (b.price || 0) - comm;
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-teal-800 dark:text-teal-400">
                            {b.bookingCode}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{b.patientName}</div>
                            <div className="font-mono text-slate-400 dark:text-slate-500 text-[10px]" dir="ltr">{b.patientPhone}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            <div>{b.appointmentDate}</div>
                            {b.appointmentTime && <div className="text-[10px] text-slate-400 dark:text-slate-500">{b.appointmentTime}</div>}
                          </td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            {b.selectedTestName || (isDoctor ? 'كشف عيادة' : 'فحص معمل')}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'completed'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : b.status === 'confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : b.status === 'cancelled'
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}>
                              {b.status === 'completed' ? 'مكتمل' : b.status === 'confirmed' ? 'مؤكد' : b.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-left font-black text-slate-900 dark:text-white">
                            {b.price} ج
                          </td>
                          <td className="py-3 px-3 text-left font-bold text-indigo-700 dark:text-indigo-400">
                            {comm} ج
                          </td>
                          <td className="py-3 px-3 text-left font-black text-emerald-700 dark:text-emerald-400">
                            {net} ج
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px]">
                    <tr>
                      <td colSpan={5} className="py-3 px-3 font-black text-slate-900 dark:text-white">
                        الإجمالي ({validForRevenue.length} حجز غير ملغي):
                      </td>
                      <td className="py-3 px-3 text-left font-black text-slate-900 dark:text-white">
                        {totalGrossRevenue.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3 px-3 text-left font-black text-indigo-700 dark:text-indigo-400">
                        {appCommission10.toLocaleString('ar-EG')} ج
                      </td>
                      <td className="py-3 px-3 text-left font-black text-emerald-700 dark:text-emerald-400">
                        {providerNet90.toLocaleString('ar-EG')} ج
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            تم استخراج هذا التقرير من لوحة إدارة <strong>احجز عند دكتورك</strong> مع احتساب العمولات المحددة.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors active:scale-95 cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
