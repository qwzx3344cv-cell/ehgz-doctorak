import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, CheckCircle, ExternalLink } from 'lucide-react';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'android' | 'ios';
  onNativeInstallPrompt?: () => void;
  canNativeInstall?: boolean;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
  platform,
  onNativeInstallPrompt,
  canNativeInstall
}) => {
  if (!isOpen) return null;

  const isIOS = platform === 'ios';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-[#0f2a44] to-[#0d9488] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                {isIOS ? 'تثبيت التطبيق على آيفون (iOS)' : 'تثبيت التطبيق على أندرويد'}
              </h3>
              <p className="text-xs text-teal-200">
                بدون الحاجة لمتجر التطبيقات - خفيف وفوري
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Native Install Button if supported */}
          {!isIOS && canNativeInstall && onNativeInstallPrompt && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-center space-y-2">
              <p className="text-xs font-bold text-teal-900 dark:text-teal-200">
                متصفحك يدعم التثبيت الفوري بنقرة واحدة:
              </p>
              <button
                onClick={() => {
                  onNativeInstallPrompt();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت التطبيق فوراً الآن</span>
              </button>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isIOS ? 'خطوات التثبيت في متصفح Safari:' : 'خطوات التثبيت في Chrome / المتصفح:'}
            </h4>

            {isIOS ? (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#0f2a44] dark:text-white block">
                      اضغط على زر المشاركة (Share)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      ستجد أيقونة المشاركة مربع مع سهم للأعلى <span className="inline-block p-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">⎋</span> في أسفل أو أعلى شاشة متصفح Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#0f2a44] dark:text-white block">
                      اختر «إضافة إلى الشاشة الرئيسية»
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      قم بالتمرير للأسفل واضغط على <strong>Add to Home Screen</strong> أو <strong>إضافة إلى الصفحة الرئيسية</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#0f2a44] dark:text-white block">
                      اضغط على «إضافة» (Add)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      سيظهر أيقونة التطبيق باسم <strong>احجز عند دكتورك</strong> على شاشة جهازك كأي تطبيق رسمي!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#0f2a44] dark:text-white block">
                      افتح قائمة الخيارات (الثلاث نقاط)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      اضغط على قائمة الثلاث نقاط <span className="font-bold">⋮</span> في أعلى زاوية متصفح Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#0f2a44] dark:text-white block">
                      اختر «تثبيت التطبيق» أو «الإضافة للشاشة الرئيسية»
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      اضغط على <strong>Install app</strong> أو <strong>Add to Home screen</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#0f2a44] dark:text-white block">
                      تأكيد التثبيت
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      سيتم تثبيت التطبيق والوصول إليه بضغطة واحدة من شاشة هاتفك الرئيسية وبدون استهلاك للذاكرة.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors active:scale-95"
          >
            فهمت، إغلاق
          </button>

        </div>

      </div>
    </div>
  );
};
