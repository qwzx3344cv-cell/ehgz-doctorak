import React from 'react';
import { 
  FileCheck2, 
  Tag, 
  CalendarRange, 
  AlertTriangle, 
  ShieldCheck, 
  BellRing
} from 'lucide-react';

interface FooterProps {
  onOpenDoctorModal: () => void;
  onOpenLabModal: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  onNavigateSection: (section: 'doctors' | 'labs') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDoctorModal,
  onOpenLabModal,
  onOpenAdmin,
  onOpenNotifications,
  onNavigateSection
}) => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Grey Note Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-teal-700 dark:text-teal-300" />
          </div>
          <div>
            <span className="font-extrabold text-[#0f2a44] dark:text-white block mb-0.5">انضم لشبكة الرعاية الصحية:</span>
            <span>
              نرحب بالأطباء ومعامل التحاليل الطبية لإضافة بياناتهم وعياداتهم واستقبال حجوزات المرضى مباشرة بكل شفافية وسهولة مع إشعارات فورية على الهاتف.
            </span>
          </div>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Pillar 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-right space-y-2 hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-[#0f2a44] dark:text-white">
              كل التفاصيل قدامك
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              التخصص، العنوان، ورقم التواصل، مع معلومات دقيقة وسهلة الوصول من أي جهاز.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-right space-y-2 hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-[#0f2a44] dark:text-white">
              أسعار بسيطة
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              اعرف سعر الكشف أو التحليل قبل الفحص بدون مفاجآت وبشفافية كاملة.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-right space-y-2 hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center">
              <CalendarRange className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-[#0f2a44] dark:text-white">
              حجز بخطوات وإشعارات لحظية
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              اختار الوقت المناسب وتلقى إشعاراً فورياً على هاتفك عند تأكيد الموعد عبر Firebase Cloud Messaging.
            </p>
          </div>

        </div>

        {/* Brand & Links Footer Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0d9488] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              +
            </div>
            <span className="font-extrabold text-sm text-[#0f2a44] dark:text-white">
              احجز عند دكتورك - Ehgz 3nd Doctorak
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-teal-700 dark:text-teal-400 font-semibold">صحتك أولاً . في كل خطوة</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => onNavigateSection('doctors')}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              الأطباء
            </button>
            <button
              onClick={() => onNavigateSection('labs')}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              المعامل
            </button>
            <button
              onClick={onOpenDoctorModal}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              أضف عيادتك
            </button>
            <button
              onClick={onOpenLabModal}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              أضف معملك
            </button>
            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-bold transition-colors cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>إشعارات الهاتف</span>
            </button>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>لوحة الإدارة</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} احجز عند دكتورك
          </div>

        </div>

      </div>
    </footer>
  );
};
