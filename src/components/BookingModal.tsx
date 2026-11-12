import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle, 
  FileText, 
  Sparkles,
  Printer,
  ChevronDown,
  Stethoscope,
  FlaskConical,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Doctor, Lab, LabTestItem, Booking } from '../types';
import { getGoogleMapsUrl } from '../utils/maps';

interface BookingModalProps {
  provider: Doctor | Lab | null;
  providerType: 'doctor' | 'lab';
  initialTest?: LabTestItem;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  provider,
  providerType,
  initialTest,
  onClose,
  onBookingSuccess
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    // Tomorrow as default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('06:00 م - 07:00 م');
  const [selectedTest, setSelectedTest] = useState<string>(
    initialTest ? initialTest.name : ''
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!provider) return null;

  const isDoctor = providerType === 'doctor';
  const doctor = isDoctor ? (provider as Doctor) : null;
  const lab = !isDoctor ? (provider as Lab) : null;

  const currentPrice = isDoctor
    ? doctor?.price || 280
    : selectedTest && lab?.tests
    ? lab.tests.find((t) => t.name === selectedTest)?.price || lab?.startingPrice || 180
    : lab?.startingPrice || 180;

  // Google Maps directions URL
  const mapsUrl = getGoogleMapsUrl(
    provider.name,
    provider.address,
    provider.governorate,
    provider.center,
    provider.googleMapsUrl
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert('من فضلك أدخل اسم المريض ورقم الهاتف');
      return;
    }

    setIsSubmitting(true);

    const bookingCode = 'EHZ-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      bookingCode,
      providerType,
      providerId: provider.id,
      providerName: provider.name,
      providerSpecialtyOrType: isDoctor ? doctor?.specialty || '' : 'معمل تحاليل طبية',
      providerAddress: provider.address,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      appointmentDate,
      appointmentTime: timeSlot,
      selectedTestName: selectedTest || undefined,
      price: currentPrice,
      notes: notes.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedBooking(newBooking);
      onBookingSuccess(newBooking);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header Bar */}
        <div className="relative bg-gradient-to-l from-[#0f2a44] via-teal-900 to-[#0d9488] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300">
              {isDoctor ? <Stethoscope className="w-5 h-5" /> : <FlaskConical className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                {confirmedBooking ? 'تم تأكيد موعدك بنجاح' : isDoctor ? 'حجز موعد كشف عيادة' : 'حجز موعد فحص معمل'}
              </h3>
              <p className="text-xs text-teal-200">
                {confirmedBooking ? 'احتفظ برقم وتفاصيل الحجز' : 'خدمة مجانية وبدون دفع مقدم'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {confirmedBooking ? (
          /* Confirmation Ticket Card */
          <div className="p-6 space-y-6 print:m-0">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-black text-[#0f2a44] dark:text-white">
                تم إرسال طلب الحجز بنجاح!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سيتم التواصل معك هاتفياً أو عبر واتساب لتأكيد الحضور
              </p>
            </div>

            {/* Ticket Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border-2 border-dashed border-teal-200 dark:border-teal-700/70 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">كود الحجز:</span>
                <span className="font-mono text-base font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                  {confirmedBooking.bookingCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">اسم المريض:</span>
                  <span className="font-bold text-[#0f2a44] dark:text-white">{confirmedBooking.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">رقم الهاتف:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{confirmedBooking.patientPhone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">مقدم الخدمة:</span>
                  <span className="font-bold text-[#0f2a44] dark:text-white">{confirmedBooking.providerName}</span>
                </div>
                {confirmedBooking.selectedTestName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">التحليل المطلوب:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">{confirmedBooking.selectedTestName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">تاريخ الموعد:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{confirmedBooking.appointmentDate} ({confirmedBooking.appointmentTime})</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 dark:text-slate-500">العنوان:</span>
                  <div className="text-left flex flex-col items-end gap-1">
                    <span className="font-medium text-slate-600 dark:text-slate-300 text-[11px] max-w-[200px]">{confirmedBooking.providerAddress}</span>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      <Navigation className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                      <span>الاتجاهات على خرائط جوجل</span>
                    </a>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                  <span className="text-[#0f2a44] dark:text-white">القيمة المستحقة عند الزيارة:</span>
                  <span className="text-[#0d9488] dark:text-teal-400">{confirmedBooking.price} جنيه</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة التذكرة</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-sm transition-colors shadow-md active:scale-95"
              >
                تم، إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Provider Quick Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50/70 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0 border border-teal-100/60 dark:border-slate-700">
                {isDoctor ? <Stethoscope className="w-6 h-6 text-[#0d9488] dark:text-teal-400" /> : <FlaskConical className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400">
                  {isDoctor ? doctor?.specialty : 'معمل تحاليل طبية'}
                </div>
                <h4 className="font-extrabold text-base text-[#0f2a44] dark:text-white truncate">
                  {provider.name}
                </h4>
                <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                    <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate">{provider.address}</span>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 shrink-0 transition-colors"
                  >
                    <Navigation className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                    <span>خريطة</span>
                  </a>
                </div>
              </div>
              <div className="text-left shrink-0">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">السعر</span>
                <span className="font-extrabold text-teal-700 dark:text-teal-400 text-base">{currentPrice} ج</span>
              </div>
            </div>

            {/* Lab Test Selection (if Lab) */}
            {!isDoctor && lab?.tests && lab.tests.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختر نوع التحليل المطلوب (اختياري)
                </label>
                <div className="relative">
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none"
                  >
                    <option value="">فحص عام / تحليل آخر بالمعمل</option>
                    {lab.tests.map((test) => (
                      <option key={test.id} value={test.name}>
                        {test.name} - ({test.price} جنيه)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Patient Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المريض بالكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="مثال: محمد أحمد علي"
                  className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Patient Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الموبايل / واتساب للتأكيد <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-right"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ الموعد المفضل
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الفترة الزمنية
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="11:00 ص - 01:00 م">صباحاً (11ص - 1م)</option>
                  <option value="02:00 م - 04:00 م">ظهراً (2م - 4م)</option>
                  <option value="05:00 م - 07:00 م">مساءً (5م - 7م)</option>
                  <option value="07:00 م - 09:00 م">مساءً (7م - 9م)</option>
                  <option value="09:00 م - 11:00 م">ليلاً (9م - 11م)</option>
                </select>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ملاحظات أو أعراض (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات تود إبلاغ العيادة أو المعمل بها..."
                rows={2}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Price notice */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">الدفع يتم مباشرة في العيادة / المعمل:</span>
              <span className="font-extrabold text-[#0d9488] dark:text-teal-400 text-sm">{currentPrice} جنيه</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>جاري تسجيل الحجز...</span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>تأكيد الحجز فوراً</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
