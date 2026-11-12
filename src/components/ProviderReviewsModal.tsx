import React from 'react';
import { 
  X, 
  Star, 
  Stethoscope, 
  FlaskConical, 
  MapPin, 
  Phone, 
  Plus, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  Sparkles,
  User,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Doctor, Lab, Review } from '../types';
import { getGoogleMapsUrl } from '../utils/maps';

interface ProviderReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Doctor | Lab | null;
  providerType: 'doctor' | 'lab';
  reviews: Review[];
  onOpenAddReview: () => void;
  onBook?: (provider: Doctor | Lab) => void;
}

export const ProviderReviewsModal: React.FC<ProviderReviewsModalProps> = ({
  isOpen,
  onClose,
  provider,
  providerType,
  reviews,
  onOpenAddReview,
  onBook
}) => {
  if (!isOpen || !provider) return null;

  const isDoctor = providerType === 'doctor';
  const doctor = isDoctor ? (provider as Doctor) : null;
  const lab = !isDoctor ? (provider as Lab) : null;

  // Google Maps directions URL
  const mapsUrl = getGoogleMapsUrl(
    provider.name,
    provider.address,
    provider.governorate,
    provider.center,
    provider.googleMapsUrl
  );

  // Filter reviews for this provider
  const providerReviews = reviews.filter((r) => r.providerId === provider.id);

  // Compute average and breakdown
  const totalCount = providerReviews.length;
  const averageRating = totalCount > 0
    ? (providerReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : null;

  const starCounts = {
    5: providerReviews.filter((r) => r.rating === 5).length,
    4: providerReviews.filter((r) => r.rating === 4).length,
    3: providerReviews.filter((r) => r.rating === 3).length,
    2: providerReviews.filter((r) => r.rating === 2).length,
    1: providerReviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0f2a44] text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              {isDoctor ? <Stethoscope className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  تقييمات ومراجعات: {provider.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                  {isDoctor ? doctor?.specialty : 'معمل تحاليل'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تجارب المرضى الحقيقية وتقييمات الخدمة من 1 إلى 5 نجوم
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6">
          
          {/* Clinic / Lab Location & Google Maps Navigation Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-800/40 border border-blue-200/90 dark:border-blue-900/60 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100 dark:border-slate-700/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                    <MapPin className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    <span>موقع {isDoctor ? 'العيادة' : 'المعمل'} ومسار الوصول</span>
                  </span>
                  {(provider.governorate || provider.center) && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {provider.governorate} {provider.center ? `• ${provider.center}` : ''}
                    </span>
                  )}
                </div>
                <p className="text-sm font-extrabold text-[#0f2a44] dark:text-white leading-relaxed pt-1 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{provider.address}</span>
                </p>
                {provider.workingHours && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    مواعيد العمل: <strong className="text-slate-700 dark:text-slate-200">{provider.workingHours}</strong>
                  </p>
                )}
              </div>

              {/* Direct call button if phone exists */}
              {((isDoctor && doctor?.phone1) || (!isDoctor && lab?.phone)) && (
                <div className="shrink-0 flex items-center gap-2">
                  <a
                    href={`tel:${isDoctor ? doctor?.phone1 : lab?.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span dir="ltr">{isDoctor ? doctor?.phone1 : lab?.phone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Prominent Action Bar with Google Maps Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] group"
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
                </div>
                <span>الاتجاهات / الموقع على الخريطة (Google Maps)</span>
                <ExternalLink className="w-4 h-4 text-white/80" />
              </a>

              {onBook && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBook(provider);
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>احجز موعداً الآن</span>
                </button>
              )}
            </div>
          </div>

          {/* Rating Summary Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-teal-50/40 to-slate-50 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-800/40 border border-amber-200/80 dark:border-amber-900/50 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Big Star Average */}
            <div className="text-center sm:text-right space-y-1.5 shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">متوسط التقييم العام</div>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-4xl sm:text-5xl font-black text-[#0f2a44] dark:text-white">
                  {averageRating || 'جديد'}
                </span>
                {averageRating && (
                  <span className="text-sm font-bold text-slate-400">من 5.0</span>
                )}
              </div>
              
              <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-400" dir="ltr">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      averageRating && Number(averageRating) >= s
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                بناءً على <strong>{totalCount}</strong> تقييم من المرضى
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="flex-1 w-full max-w-xs space-y-1 text-xs">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = starCounts[s as keyof typeof starCounts];
                const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-7 font-bold text-slate-600 dark:text-slate-300 flex items-center gap-0.5 justify-end">
                      <span>{s}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-[11px] text-slate-400 dark:text-slate-500 text-left font-mono">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Add Review Action */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={onOpenAddReview}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-teal-200" />
                <span>أضف تقييمك وتجربتك</span>
              </button>
            </div>

          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-[#0f2a44] dark:text-white flex items-center justify-between">
              <span>آراء ومراجعات المرضى ({providerReviews.length}):</span>
              <span className="text-xs text-slate-400">مرتبة من الأحدث للأقدم</span>
            </h4>

            {providerReviews.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">
                    لا توجد تقييمات مسجلة بعد لهذا {isDoctor ? 'الطبيب' : 'المعمل'}
                  </h5>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    كن أول من يشارك تجربته مع الكشف أو التحاليل لمساعدة غيرك من المرضى.
                  </p>
                </div>
                <button
                  onClick={onOpenAddReview}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>اكتب أول تقييم الآن</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {providerReviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5 text-right"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-xs shrink-0 border border-teal-100 dark:border-teal-900">
                          {r.patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs sm:text-sm text-[#0f2a44] dark:text-white">
                              {r.patientName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                              مريض موثق
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(r.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400" dir="ltr">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              r.rating >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            تخضع التقييمات لسياسة جودة ومصداقية منصة <strong>«احجز عند دكتورك»</strong>.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors active:scale-95"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
