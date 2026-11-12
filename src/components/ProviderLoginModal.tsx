import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  KeyRound, 
  Stethoscope, 
  FlaskConical, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  Sparkles,
  RefreshCw,
  Lock,
  UserPlus
} from 'lucide-react';
import { Doctor, Lab, ProviderSession } from '../types';
import { STORAGE_KEYS } from '../constants';
import { 
  sendProviderApprovalWithOTP, 
  updateDoctorStatusInFirestore, 
  updateLabStatusInFirestore, 
  triggerDevicePushNotification 
} from '../firebase';

interface ProviderLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  labs: Lab[];
  onLoginSuccess: (session: ProviderSession) => void;
  onOpenDoctorRegister: () => void;
  onOpenLabRegister: () => void;
}

export const ProviderLoginModal: React.FC<ProviderLoginModalProps> = ({
  isOpen,
  onClose,
  doctors,
  labs,
  onLoginSuccess,
  onOpenDoctorRegister,
  onOpenLabRegister
}) => {
  // Step 1: phone entry, Step 2: otp verification
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [matchedProvider, setMatchedProvider] = useState<{
    provider: Doctor | Lab;
    type: 'doctor' | 'lab';
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [showSmsSimulatorBanner, setShowSmsSimulatorBanner] = useState(false);

  if (!isOpen) return null;

  // Helper to normalize phone numbers for comparison
  const normalizePhone = (p: string) => {
    return p
      .replace(/[\s\-\(\)\+]/g, '')
      .replace(/^20/, '0')
      .replace(/^0020/, '0')
      .trim();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPhone = normalizePhone(phoneNumber);

    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg('يرجى إدخال رقم هاتف صحيح مكون من 11 رقماً (مثال: 01012345678)');
      return;
    }

    // Find in doctors
    const foundDoctor = doctors.find((d) => {
      const p1 = normalizePhone(d.phone1);
      const p2 = d.phone2 ? normalizePhone(d.phone2) : '';
      return p1 === cleanPhone || p2 === cleanPhone;
    });

    // Find in labs
    const foundLab = labs.find((l) => normalizePhone(l.phone) === cleanPhone);

    if (!foundDoctor && !foundLab) {
      setErrorMsg('رقم الهاتف هذا غير مسجل لدينا في قائمة الأطباء أو المعامل. يمكنك تقديم طلب انضمام جديد الآن.');
      return;
    }

    const providerItem = foundDoctor || foundLab!;
    const providerType = foundDoctor ? ('doctor' as const) : ('lab' as const);

    // Check status
    if (providerItem.status === 'blocked') {
      setErrorMsg('عذراً، هذا الحساب محظور حالياً من قِبل إدارة المنصة. يرجى التواصل مع الدعم الفني للمنصة.');
      return;
    }

    if (providerItem.status === 'pending') {
      setErrorMsg('طلب انضمامك قيد المراجعة حالياً من قِبل إدارة التطبيق. ستصلك رسالة SMS بكود الدخول فور قبول الطلب.');
      return;
    }

    if (providerItem.status === 'rejected') {
      setErrorMsg('تم رفض طلب الانضمام المرتبط بهذا الرقم سابقاً. يرجى مراجعة إدارة التطبيق.');
      return;
    }

    // Approved provider -> generate 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setMatchedProvider({ provider: providerItem, type: providerType });

    // Save OTP to Firestore
    if (providerType === 'doctor') {
      await updateDoctorStatusInFirestore(providerItem.id, 'approved', { otpCode: newOtp });
    } else {
      await updateLabStatusInFirestore(providerItem.id, 'approved', { otpCode: newOtp });
    }

    // Send automated welcome & OTP notification
    await sendProviderApprovalWithOTP(providerItem, providerType, newOtp);

    // Show simulated SMS banner and sound chime
    setShowSmsSimulatorBanner(true);
    setStep('otp');
    setResendCooldown(60);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!matchedProvider) {
      setErrorMsg('حدث خطأ، يرجى إعادة المحاولة.');
      return;
    }

    if (otpInput.trim() !== generatedOtp.trim()) {
      setErrorMsg('كود التأكيد غير صحيح. تأكد من إدخال الأرقام الـ 6 المستلمة.');
      return;
    }

    setIsVerifying(true);

    const session: ProviderSession = {
      id: matchedProvider.provider.id,
      providerType: matchedProvider.type,
      name: matchedProvider.provider.name,
      phone: matchedProvider.type === 'doctor' 
        ? (matchedProvider.provider as Doctor).phone1 
        : (matchedProvider.provider as Lab).phone,
      specialtyOrType: matchedProvider.type === 'doctor' 
        ? (matchedProvider.provider as Doctor).specialty 
        : 'معمل تحاليل طبية',
      authenticatedAt: new Date().toISOString()
    };

    // Save session locally for persistent seamless login
    try {
      localStorage.setItem(STORAGE_KEYS.PROVIDER_SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save session to localStorage:', e);
    }

    // Mark as verified in Firestore
    if (matchedProvider.type === 'doctor') {
      updateDoctorStatusInFirestore(matchedProvider.provider.id, 'approved', { isVerified: true });
    } else {
      updateLabStatusInFirestore(matchedProvider.provider.id, 'approved', { isVerified: true });
    }

    setTimeout(() => {
      setIsVerifying(false);
      onLoginSuccess(session);
      onClose();
    }, 400);
  };

  const handleAutoFillOtp = () => {
    setOtpInput(generatedOtp);
    setErrorMsg('');
  };

  const handleResend = async () => {
    if (!matchedProvider) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setResendCooldown(60);
    setShowSmsSimulatorBanner(true);

    await sendProviderApprovalWithOTP(matchedProvider.provider, matchedProvider.type, newOtp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-900 via-[#0f2a44] to-slate-900 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <KeyRound className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-xl font-black">
            بوابة دخول الأطباء والمعامل
          </h3>
          <p className="text-xs text-teal-200/80 mt-1">
            تسجيل دخول آمن برقم الهاتف وكود التأكيد المؤقت (OTP)
          </p>
        </div>

        {/* SMS Simulator Banner (Instant feedback for OTP) */}
        {showSmsSimulatorBanner && generatedOtp && (
          <div className="m-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/70 dark:to-slate-800 border-2 border-teal-500/40 text-slate-800 dark:text-slate-100 shadow-md">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-black text-teal-800 dark:text-teal-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>رسالة SMS واردة من (احجز عند دكتورك)</span>
              </div>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95"
              >
                <Copy className="w-3 h-3" />
                <span>تعبئة تلقائية للكود</span>
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono select-all bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-teal-200/50 dark:border-teal-800">
              "تم قبول انضمامك بنجاح إلى تطبيق (احجز عند دكتورك)! كود التأكيد الخاص بك هو: <span className="font-black text-base text-teal-700 dark:text-teal-400 tracking-wider">[{generatedOtp}]</span>. نتمنى لك التوفيق والنجاح الدائم في خدمة مرضانا."
            </p>
          </div>
        )}

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {step === 'phone' ? (
            /* STEP 1: ENTER PHONE */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم الهاتف المسجل للعيادة أو المعمل:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="01012345678"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-base focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-center tracking-wider"
                  />
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  سيتم التحقق من وجود الرقم وإرسال كود التأكيد (OTP) في رسالة فورية.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-98 text-white font-black text-sm shadow-md shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
              >
                <span>إرسال كود التأكيد (OTP)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
                  لست مسجلاً بعد في المنظومة الطبية؟
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDoctorRegister();
                    }}
                    className="py-2.5 px-3 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>تسجيل عيادة جديدة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLabRegister();
                    }}
                    className="py-2.5 px-3 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>تسجيل معمل تحاليل</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* STEP 2: ENTER OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">الحساب: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{matchedProvider?.provider.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpInput('');
                    setShowSmsSimulatorBanner(false);
                  }}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-bold text-[11px]"
                >
                  تغيير الرقم
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أدخل كود التأكيد المكون من 6 أرقام:
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  dir="ltr"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="------"
                  className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-2xl tracking-[0.5em] text-center focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة إرسال الكود</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>صالح لمدة 10 دقائق</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || otpInput.length < 4}
                className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارِ التحقق وتأكيد الحساب...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد والدخول للوحة التحكم</span>
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 text-[11px] text-teal-800 dark:text-teal-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                <span>سيتم حفظ تسجيل دخولك محلياً لفتح لوحتك تلقائياً في الزيارات القادمة.</span>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
