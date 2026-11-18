import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  CheckCircle2,
  User,
  Stethoscope,
  FlaskConical,
  Building2,
  ArrowDown,
  X
} from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onGoToDoctorsOnly: () => void;
  onGoToLabsOnly: () => void;
  onOpenDoctorModal: () => void;
  onOpenLabModal: () => void;
  onDownloadAppClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onGoToDoctorsOnly,
  onGoToLabsOnly,
  onOpenDoctorModal,
  onOpenLabModal,
  onDownloadAppClick
}) => {
  const [showRegisterChoice, setShowRegisterChoice] = useState(false);

  return (
    <section className="relative w-full bg-white dark:bg-[#0b1320] pb-6">
      {/* Main Full-Width App Cover Image (Permanent, Uncropped, No Overlay Text) */}
      <div className="w-full bg-white">
        <img
          src="/assets/aistudio/857393128_2357599598318724_1090210002570918881_n_2720673a.webp"
          alt="احجز عند دكتورك - رعايتك الصحية أقرب مما تتخيل"
          className="w-full h-auto block object-contain select-none"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
      </div>

      {/* Stacked Primary Action Buttons Directly Under the Cover Image */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <div className="flex flex-col gap-3.5">
          {/* 1. أنا مريض */}
          <button
            type="button"
            onClick={onExploreClick}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-black text-base sm:text-lg shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span>أنا مريض</span>
          </button>

          {/* 2. احجز دكتورك (أخضر فاتح - صفحة الدكاترة فقط) */}
          <button
            type="button"
            onClick={onGoToDoctorsOnly}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-base sm:text-lg shadow-lg shadow-green-500/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span>احجز دكتورك</span>
          </button>

          {/* 3. احجز في معمل تحليل (أزرق - صفحة المعامل فقط) */}
          <button
            type="button"
            onClick={onGoToLabsOnly}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base sm:text-lg shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span>احجز في معمل تحليل</span>
          </button>

          {/* 4. تسجيل عيادة / معمل */}
          <button
            type="button"
            onClick={() => setShowRegisterChoice(true)}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#0f2a44] hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-base sm:text-lg shadow-lg shadow-slate-900/20 border border-slate-700/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 shrink-0" />
            <span>تسجيل عيادة / معمل</span>
          </button>

          {/* 5. تحميل التطبيق (أسود مع علامة تحميل ↓) */}
          <button
            type="button"
            onClick={onDownloadAppClick}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-black hover:bg-neutral-900 text-white font-black text-base sm:text-lg shadow-lg shadow-black/30 border border-neutral-800 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
            </span>
            <span>تحميل التطبيق</span>
          </button>
        </div>
      </div>

      {/* 3 Small Feature Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {/* Badge 1: Accurate Addresses */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-[#0f2a44] dark:text-white">
                عناوين دقيقة
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden xs:block">
                مواقع تفصيلية وسهلة الوصول لجميع العيادات والمعامل
              </p>
            </div>
          </div>

          {/* Badge 2: Accurate Appointments */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-[#0f2a44] dark:text-white">
                مواعيد دقيقة
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden xs:block">
                تأكيد فوري لوقت وموعد الكشف بدون انتظار طويل
              </p>
            </div>
          </div>

          {/* Badge 3: Easy Booking */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-[#0f2a44] dark:text-white">
                حجز سهل
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden xs:block">
                خطوات بسيطة وسريعة بدون تعقيد وبدون دفع مسبق
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic vs Lab Registration Chooser Modal */}
      {showRegisterChoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          dir="rtl"
          onClick={() => setShowRegisterChoice(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-l from-[#0f2a44] to-[#0d9488] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">تسجيل عيادة / معمل</h3>
                <p className="text-xs text-teal-100 mt-0.5">اختر نوع الحساب الذي ترغب في تسجيله</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterChoice(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowRegisterChoice(false);
                  onOpenDoctorModal();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/70 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 text-right transition-all active:scale-[0.98] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-base text-[#0f2a44] dark:text-white">
                    تسجيل عيادة طبيب
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    سجّل عيادتك واستقبل حجوزات المرضى مباشرة
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRegisterChoice(false);
                  onOpenLabModal();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/70 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 text-right transition-all active:scale-[0.98] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0f2a44] text-teal-300 flex items-center justify-center shrink-0 shadow-sm">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-base text-[#0f2a44] dark:text-white">
                    تسجيل معمل تحاليل
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    أضف معملك وقائمة الفحوصات وأسعار التحاليل
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
