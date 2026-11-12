import React from 'react';
import { X, CalendarCheck, Clock, MapPin, Printer, Stethoscope, FlaskConical, Star, Navigation, Pill, FileText } from 'lucide-react';
import { Booking, EPrescription } from '../types';
import { getGoogleMapsUrl } from '../utils/maps';

interface PatientBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  prescriptions?: EPrescription[];
  onCancelBooking: (id: string) => void;
  onOpenRateBooking?: (booking: Booking) => void;
  onViewPrescription?: (rx: EPrescription) => void;
  onOpenMedicalRecords?: () => void;
}

export const PatientBookingsModal: React.FC<PatientBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  prescriptions = [],
  onCancelBooking,
  onOpenRateBooking,
  onViewPrescription,
  onOpenMedicalRecords
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-[#0f2a44] to-[#0d9488] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                حجوزاتي ومواعيدي الطبية
              </h3>
              <p className="text-xs text-teal-200">
                قائمة بجميع حجوزات العيادات ومعامل التحاليل
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

        {/* Medical Records Shortcut Banner */}
        {onOpenMedicalRecords && (
          <div className="px-6 py-2.5 bg-teal-50 dark:bg-teal-950/60 border-b border-teal-100 dark:border-teal-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>تريد استعراض روشتاتك أو رفع نتائج التحاليل السابقة؟</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMedicalRecords();
              }}
              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-black text-[11px] transition-all active:scale-95 shrink-0 shadow-2xs"
            >
              فتح السجل الطبي
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-600 dark:text-slate-300">لا توجد حجوزات مسجلة حتى الآن</p>
              <p className="text-xs">
                قم باختيار دكتور أو معمل من الصفحة الرئيسية لحجز موعدك الأول فوراً!
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-teal-300 dark:hover:border-teal-600 transition-all space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/70">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                      {booking.bookingCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(booking.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : booking.status === 'completed'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {booking.status === 'confirmed'
                      ? 'مؤكد'
                      : booking.status === 'completed'
                      ? 'مكتمل'
                      : booking.status === 'cancelled'
                      ? 'ملغي'
                      : 'قيد المراجعة'}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900">
                    {booking.providerType === 'doctor' ? (
                      <Stethoscope className="w-5 h-5 text-[#0d9488] dark:text-teal-400" />
                    ) : (
                      <FlaskConical className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h4 className="font-extrabold text-sm text-[#0f2a44] dark:text-white">
                      {booking.providerName}
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                      {booking.providerSpecialtyOrType}
                    </p>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                        <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{booking.providerAddress}</span>
                      </div>
                      <a
                        href={getGoogleMapsUrl(booking.providerName, booking.providerAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 shrink-0 transition-colors active:scale-95"
                        title="فتح الموقع في خرائط جوجل"
                      >
                        <Navigation className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                        <span>الاتجاهات</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">المريض:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{booking.patientName} ({booking.patientPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">موعد الزيارة:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{booking.appointmentDate} - {booking.appointmentTime}</span>
                  </div>
                  {booking.selectedTestName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">التحليل:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">{booking.selectedTestName}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">المبلغ المستحق:</span>
                    <span className="font-extrabold text-[#0d9488] dark:text-teal-400">{booking.price} جنيه</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Prescription Button if issued */}
                    {(() => {
                      const matchingRx = prescriptions.find(
                        (p) => p.bookingId === booking.id || (p.bookingCode && p.bookingCode === booking.bookingCode)
                      );
                      if (!matchingRx || !onViewPrescription) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => onViewPrescription(matchingRx)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700 text-xs font-black flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                        >
                          <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>الروشتة ({matchingRx.prescriptionCode})</span>
                        </button>
                      );
                    })()}

                    {booking.status !== 'cancelled' && onOpenRateBooking && (
                      <button
                        type="button"
                        onClick={() => onOpenRateBooking(booking)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>تقييم التجربة</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mr-auto">
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 font-semibold transition-colors active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة</span>
                    </button>

                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (confirm('هل ترغب حقاً في إلغاء هذا الحجز؟')) {
                            onCancelBooking(booking.id);
                          }
                        }}
                        className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 font-semibold p-1 transition-colors active:scale-95"
                      >
                        إلغاء الموعد
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
