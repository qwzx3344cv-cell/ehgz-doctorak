import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Sparkles,
  TestTube2,
  Star,
  Navigation,
  Clock
} from 'lucide-react';
import { Lab, LabTestItem, Review } from '../types';
import { getGoogleMapsUrl } from '../utils/maps';
import { sanitizeClinicImageUrl } from '../firebase';
import { ProgressiveLazyImage } from './ProgressiveLazyImage';

interface LabCardProps {
  lab: Lab;
  onBook: (lab: Lab, selectedTest?: LabTestItem) => void;
  onAddLabClick?: () => void;
  reviews?: Review[];
  onViewReviews?: (lab: Lab) => void;
}

export const LabCard: React.FC<LabCardProps> = ({
  lab,
  onBook,
  onAddLabClick,
  reviews = [],
  onViewReviews
}) => {
  const [imgError, setImgError] = useState(false);

  // Compute lab ratings dynamically from reviews
  const labReviews = reviews.filter((r) => r.providerId === lab.id);
  const totalReviews = labReviews.length || lab.reviewsCount || 0;
  const avgRating = labReviews.length > 0
    ? (labReviews.reduce((sum, r) => sum + r.rating, 0) / labReviews.length).toFixed(1)
    : lab.rating ? lab.rating.toFixed(1) : null;

  // Google Maps directions URL
  const mapsUrl = getGoogleMapsUrl(
    lab.name,
    lab.address,
    lab.governorate,
    lab.center,
    lab.googleMapsUrl
  );

  const labImageSrc = sanitizeClinicImageUrl(lab.labPhoto);

  useEffect(() => {
    setImgError(false);
  }, [labImageSrc]);

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Lab Ad Image Only: Full Width, Auto Height, Object-Contain, Clean White Backdrop, Zero Overlays */}
      {labImageSrc && !imgError && (
        <div className="w-full bg-white border-b border-slate-100 dark:border-slate-800 shrink-0">
          <ProgressiveLazyImage
            src={labImageSrc}
            alt={lab.name}
            onFatalError={() => {
              if (!imgError) setImgError(true);
            }}
            containerClassName="relative w-full bg-white overflow-hidden"
            className="w-full h-auto object-contain block select-none"
          />
        </div>
      )}

      {/* White Card Body Below Image with All Lab Details */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2.5">
          {/* Tag: معمل تحاليل طبية + Verified Badge + Rating */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100/80 dark:border-teal-800/50">
              <FlaskConical className="w-3.5 h-3.5 text-[#0d9488] dark:text-teal-400 shrink-0" />
              <span className="text-xs font-extrabold text-[#0d9488] dark:text-teal-300">
                معمل تحاليل طبية
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {lab.isDemo ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>مثال توضيحي</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>معمل معتمد</span>
                </span>
              )}

              {/* Prominent Star Rating Badge */}
              <button
                type="button"
                onClick={() => onViewReviews && onViewReviews(lab)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 transition-all active:scale-95 text-xs font-bold shadow-2xs group/rating cursor-pointer"
                title="عرض تقييمات المرضى ومراجعات المعمل"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover/rating:scale-125 transition-transform duration-200" />
                <span className="font-black text-[#0f2a44] dark:text-white">{avgRating || '5.0'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold hidden xs:inline">
                  ({totalReviews > 0 ? `${totalReviews}` : 'جديد'})
                </span>
              </button>
            </div>
          </div>

          {/* Lab Name in Bold */}
          <h3 className="font-extrabold text-lg sm:text-xl text-[#0f2a44] dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
            {lab.name}
          </h3>

          {/* Location with Pin and Governorate / Center Badge */}
          <div className="space-y-1.5">
            {(lab.governorate || lab.center) && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[11px] font-bold border border-teal-100 dark:border-teal-800/50">
                <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>
                  {lab.governorate ? `${lab.governorate}` : ''}
                  {lab.governorate && lab.center ? ' • ' : ''}
                  {lab.center ? `${lab.center}` : ''}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-relaxed font-medium">{lab.address}</span>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 hover:text-blue-800 text-[11px] font-bold border border-blue-200 dark:border-blue-800 shrink-0 transition-all duration-200 shadow-2xs group/map active:scale-95"
                title="فتح الموقع ومسار الوصول في خرائط جوجل"
              >
                <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover/map:rotate-45 transition-transform duration-200" />
                <span>الاتجاهات</span>
              </a>
            </div>
          </div>

          {/* Phone & Working Hours */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              {lab.phone ? (
                <a href={`tel:${lab.phone}`} className="font-mono text-[#0f2a44] dark:text-slate-100 font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-colors" dir="ltr">
                  {lab.phone}
                </a>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">يُضاف رقم التواصل عند التسجيل</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lab.workingHours && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-300">
                  <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate max-w-[130px]">{lab.workingHours}</span>
                </div>
              )}
              {lab.phone && (
                <a href={`tel:${lab.phone}`} className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/40 px-2 py-0.5 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/80 transition-colors">
                  اتصال
                </a>
              )}
            </div>
          </div>

          {/* Key Tests preview with chips */}
          {lab.tests && lab.tests.length > 0 && (
            <div className="pt-1">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <TestTube2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>أبرز التحاليل المتاحة:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lab.tests.slice(0, 3).map((test) => (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => onBook(lab, test)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50/70 dark:bg-teal-950/50 hover:bg-teal-100/80 dark:hover:bg-teal-900/70 text-[11px] text-teal-900 dark:text-teal-200 font-medium border border-teal-100 dark:border-teal-800/60 transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <span>{test.name}</span>
                    <span className="font-bold text-[#0d9488] dark:text-teal-400">({test.price}ج)</span>
                  </button>
                ))}
                {lab.tests.length > 3 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                    +{lab.tests.length - 3} أخرى
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Starting Price + Book Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">سعر التحليل يبدأ من</span>
            <div className="flex items-baseline gap-1 text-[#0f2a44] dark:text-white font-black text-lg sm:text-xl">
              <span>{lab.startingPrice || 180}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">جنيه</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {lab.isDemo && onAddLabClick && (
              <button
                type="button"
                onClick={onAddLabClick}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="أضف معملك للخدمة"
              >
                أضف معملك
              </button>
            )}

            <button
              type="button"
              onClick={() => onBook(lab)}
              className="px-4 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>احجز تحليل</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
