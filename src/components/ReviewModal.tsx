import React, { useState } from 'react';
import { X, Star, Sparkles, Send, CheckCircle2, User, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Doctor, Lab, Booking, Review } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Doctor | Lab | null;
  providerType: 'doctor' | 'lab';
  booking?: Booking | null;
  onSubmitReview: (review: Review) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  provider,
  providerType,
  booking,
  onSubmitReview
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [patientName, setPatientName] = useState<string>(booking?.patientName || '');
  const [patientPhone, setPatientPhone] = useState<string>(booking?.patientPhone || '');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !provider) return null;

  const ratingDescriptions: Record<number, string> = {
    1: 'تجربة سيئة جداً وغير مرضية',
    2: 'تجربة مقبولة ولكن تحتاج تحسين',
    3: 'تجربة جيدة ومناسبة',
    4: 'تجربة ممتازة وتعامل راقٍ',
    5: 'تجربة استثنائية وطبيب/معمل موصى به بشدة!'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('يرجى إدخال اسمك الكريم');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('يرجى كتابة تعليق لا يقل عن 5 أحرف لوصف تجربتك');
      return;
    }

    setIsSubmitting(true);

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      providerId: provider.id,
      providerType,
      providerName: provider.name,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || undefined,
      bookingId: booking?.id || undefined,
      bookingCode: booking?.bookingCode || undefined,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await onSubmitReview(newReview);
      setIsSuccess(true);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log('Confetti note:', e);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء حفظ التقييم، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-[#0f2a44] to-[#0d9488] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Star className="w-6 h-6 fill-amber-400 stroke-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                تقييم التجربة: {provider.name}
              </h3>
              <p className="text-xs text-teal-100">
                رأيك يساعد آلاف المرضى في اختيار أفضل رعاية صحية
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

        {/* Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-[#0f2a44] dark:text-white">
              شكراً جزيلاً لتقييمك!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
              تم تسجيل تقييمك بنجاح وسيظهر للجميع لمساعدة المرضى ودعم مقدمي الرعاية.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-right">
            
            {/* Star Rating Selector */}
            <div className="text-center space-y-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                اختر عدد النجوم:
              </span>
              
              <div className="flex items-center justify-center gap-2" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 dark:text-slate-600 hover:scale-125 transition-transform duration-150 focus:outline-none active:scale-95 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-extrabold text-[#0f2a44] dark:text-amber-300 transition-all">
                {ratingDescriptions[hoverRating || rating]}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Patient Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>اسم المريض / المراجع: <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="اكتب اسمك الثلاثي أو الثنائي..."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Patient Phone (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>رقم الهاتف (اختياري للتوثيق):</span>
              </label>
              <input
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="رقم هاتفك المسجل بالحجز إن وجد..."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono text-right"
                dir="ltr"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>تعليقك ورأيك في الخدمة: <span className="text-red-500">*</span></span>
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="صف تجربتك مع الكشف أو الفحص، المعاملة، مواعيد الانتظار، ونظافة المكان..."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 rotate-180" />
                <span>{isSubmitting ? 'جاري إرسال التقييم...' : 'إرسال التقييم الآن'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors active:scale-95"
              >
                إلغاء
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
