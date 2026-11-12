import React, { useState } from 'react';
import { Download, Smartphone, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallGuideModal } from './PWAInstallGuideModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'pill';
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  onInstalled
}) => {
  const { isInstallable, isInstalled, isIOS, isStandalone, install } = usePWAInstall();
  const [guidePlatform, setGuidePlatform] = useState<'android' | 'ios' | null>(null);

  // If already running as an installed PWA or inside standalone webview, hide the button
  if (isInstalled || isStandalone) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome && onInstalled) {
        onInstalled();
      }
    } else if (isIOS) {
      setGuidePlatform('ios');
    } else {
      setGuidePlatform('android');
    }
  };

  if (variant === 'pill') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold shadow-sm transition-all active:scale-95 ${className}`}
          title="تثبيت التطبيق على الشاشة الرئيسية"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>تثبيت التطبيق</span>
        </button>

        {guidePlatform && (
          <PWAInstallGuideModal
            isOpen={true}
            onClose={() => setGuidePlatform(null)}
            platform={guidePlatform}
            canNativeInstall={isInstallable}
            onNativeInstallPrompt={install}
          />
        )}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-[#0f2a44] text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-teal-500/30 shadow-lg ${className}`}>
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white">تثبيت التطبيق السريع على هاتفك</h4>
              <p className="text-xs text-slate-300">أضف منصة «احجز عند دكتورك» لشاشتك الرئيسية لتصلك الإشعارات وتحجز فورياً دون متجر.</p>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>تثبيت الآن على الهاتف</span>
          </button>
        </div>

        {guidePlatform && (
          <PWAInstallGuideModal
            isOpen={true}
            onClose={() => setGuidePlatform(null)}
            platform={guidePlatform}
            canNativeInstall={isInstallable}
            onNativeInstallPrompt={install}
          />
        )}
      </>
    );
  }

  // Header default variant
  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all active:scale-95 border border-teal-500/40 ${className}`}
        title="تثبيت التطبيق على الشاشة الرئيسية (PWA)"
      >
        <Download className="w-4 h-4 text-teal-100 stroke-[2.5]" />
        <span>تثبيت التطبيق</span>
      </button>

      {guidePlatform && (
        <PWAInstallGuideModal
          isOpen={true}
          onClose={() => setGuidePlatform(null)}
          platform={guidePlatform}
          canNativeInstall={isInstallable}
          onNativeInstallPrompt={install}
        />
      )}
    </>
  );
};
