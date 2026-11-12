import React from 'react';
import { Smartphone, Download, Check, Sparkles } from 'lucide-react';

interface PWAInstallSectionProps {
  onAndroidClick: () => void;
  onIOSClick: () => void;
  isStandalone: boolean;
}

export const PWAInstallSection: React.FC<PWAInstallSectionProps> = ({
  onAndroidClick,
  onIOSClick,
  isStandalone
}) => {
  return (
    <section className="w-full py-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Card Container */}
        <div className="relative rounded-3xl bg-gradient-to-l from-slate-900 via-[#0f2a44] to-teal-950 text-white p-6 sm:p-8 md:p-10 shadow-lg overflow-hidden border border-slate-800">
          
          {/* Subtle Decorative Elements */}
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Right text content */}
            <div className="text-center md:text-right space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>تطبيق الويب التفاعلي PWA</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                رعايتك الصحية.. معاك في كل مكان
              </h3>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                أضف التطبيق لشاشتك الرئيسية واحجز بخطوات بسيطة وبدون الحاجة لمتجر التطبيقات وبحجم خفيف جداً.
              </p>

              {isStandalone && (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/60">
                  <Check className="w-3.5 h-3.5" />
                  <span>التطبيق مثبت وتعمل حالياً بالنسخة المستقلة المثبتة</span>
                </div>
              )}
            </div>

            {/* Left buttons (2 dark buttons requested) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              
              {/* Android Download Button */}
              <button
                onClick={onAndroidClick}
                className="group relative flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-black text-white font-bold text-xs sm:text-sm border border-slate-700/80 shadow-md hover:border-teal-400 transition-all active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-normal">تثبيت فوري مباشر</div>
                  <div className="font-extrabold text-xs sm:text-sm text-white">
                    حمل التطبيق للأندرويد
                  </div>
                  <div className="text-[10px] text-teal-300">نسخة الويب السريعة</div>
                </div>
              </button>

              {/* iPhone Download Button */}
              <button
                onClick={onIOSClick}
                className="group relative flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-black text-white font-bold text-xs sm:text-sm border border-slate-700/80 shadow-md hover:border-teal-400 transition-all active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-normal">إضافة للشاشة الرئيسية</div>
                  <div className="font-extrabold text-xs sm:text-sm text-white">
                    حمل التطبيق للآيفون
                  </div>
                  <div className="text-[10px] text-teal-300">نسخة الويب Safari</div>
                </div>
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
