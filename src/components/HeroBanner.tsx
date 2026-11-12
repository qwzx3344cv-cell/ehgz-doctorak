import React from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onOpenDoctorModal: () => void;
  onTriggerInstall: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onOpenDoctorModal,
  onTriggerInstall
}) => {
  return (
    <section className="relative w-full pt-4 pb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Visual Container */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-teal-100 dark:border-slate-800 bg-gradient-to-br from-teal-900 via-[#0f2a44] to-slate-900">
          
          {/* Main Visual Image matching the screenshot provided by user */}
          <div className="relative w-full">
            <img 
              src="/assets/aistudio/Screenshot_________________ChatGPT_bf8b193f.jpg" 
              alt="احجز عند دكتورك - رعايتك الصحية أقرب مما تتخيل" 
              className="w-full h-auto object-cover object-center max-h-[580px] sm:max-h-[620px] transition-transform duration-500 hover:scale-[1.01]"
              loading="eager"
            />

            {/* Subtle Gradient Overlays for readability and integration */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none md:hidden"></div>

            {/* Mobile / Tablet interactive fast-action overlay at the bottom of the banner */}
            <div className="absolute bottom-1.5 inset-x-2.5 sm:bottom-3 sm:inset-x-6 lg:bottom-3.5 lg:inset-x-8 flex flex-wrap items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl border border-white/70 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0d9488] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0f2a44] dark:text-white text-sm sm:text-base">
                    رعايتك الصحية أسرع مما تتخيل
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 hidden sm:block">
                    احجز عند أفضل الأطباء ومعامل التحاليل بأسعار واضحة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mr-auto">
                <button
                  onClick={onExploreClick}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>احجز الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={onTriggerInstall}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f2a44] hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all active:scale-95"
                  title="تثبيت التطبيق"
                >
                  <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden xs:inline">تثبيت التطبيق</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Small Feature Badges right below the banner */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
          
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
    </section>
  );
};
