import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Sparkles,
  Clock,
  Star,
  Navigation
} from 'lucide-react';
import { Doctor, Review } from '../types';
import { getGoogleMapsUrl } from '../utils/maps';
import { sanitizeClinicImageUrl } from '../firebase';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  onAddDataClick?: () => void;
  reviews?: Review[];
  onViewReviews?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBook,
  onAddDataClick,
  reviews = [],
  onViewReviews
}) => {
  const [imgError, setImgError] = useState(false);

  // Compute doctor's ratings dynamically from reviews
  const docReviews = reviews.filter((r) => r.providerId === doctor.id);
  const totalReviews = docReviews.length || doctor.reviewsCount || 0;
  const avgRating = docReviews.length > 0
    ? (docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length).toFixed(1)
    : doctor.rating ? doctor.rating.toFixed(1) : null;

  // Google Maps directions URL
  const mapsUrl = getGoogleMapsUrl(
    doctor.name,
    doctor.address,
    doctor.governorate,
    doctor.center,
    doctor.googleMapsUrl
  );

  const clinicImageSrc =
    sanitizeClinicImageUrl(doctor.clinic_image) ||
    sanitizeClinicImageUrl(doctor.clinicPhoto);

  useEffect(() => {
    setImgError(false);
  }, [clinicImageSrc]);

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Clinic / Ad Image Only: Full Width, Auto Height, Object-Contain, Clean White Backdrop, Zero Overlays */}
      {clinicImageSrc && !imgError && (
        <div className="w-full bg-white border-b border-slate-100 dark:border-slate-800 shrink-0">
          <img
            src={clinicImageSrc}
            alt={doctor.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onError={() => {
              if (!imgError) setImgError(true);
            }}
            className="w-full h-auto object-contain block select-none"
          />
        </div>
      )}

      {/* White Card Body Below Image with All Doctor Information */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between space-y-3.5">
        
        <div className="space-y-2.5">
          {/* Top Metadata Row: Specialty + Verified Status + Star Rating */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/50 max-w-[65%]">
              <Stethoscope className="w-3.5 h-3.5 text-[#0d9488] dark:text-teal-400 shrink-0" />
              <span className="text-xs font-extrabold text-[#0d9488] dark:text-teal-300 truncate">
                {doctor.specialty}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {doctor.isDemo ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>مثال توضيحي</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>طبيب موثق</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => onViewReviews && onViewReviews(doctor)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 transition-all active:scale-95 text-xs font-bold shadow-2xs group/rating cursor-pointer"
                title="عرض تقييمات المرضى وآرائهم"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover/rating:scale-125 transition-transform duration-200" />
                <span className="font-black text-[#0f2a44] dark:text-white">{avgRating || '5.0'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold hidden xs:inline">
                  ({totalReviews > 0 ? `${totalReviews}` : 'جديد'})
                </span>
              </button>
            </div>
          </div>

          {/* Doctor Name */}
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-[#0f2a44] dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
              {doctor.name}
            </h3>

            {/* Governorate / Center Badge */}
            {(doctor.governorate || doctor.center) && (
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[11px] font-bold border border-teal-100 dark:border-teal-800/50">
                <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>
                  {doctor.governorate ? `${doctor.governorate}` : ''}
                  {doctor.governorate && doctor.center ? ' • ' : ''}
                  {doctor.center ? `${doctor.center}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Address + Google Maps Directions */}
          <div className="flex items-start justify-between gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
              <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed font-medium">{doctor.address}</span>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800 shrink-0 transition-all duration-200 shadow-2xs group/map active:scale-95"
              title="فتح الموقع ومسار الوصول في خرائط جوجل"
            >
              <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover/map:rotate-45 transition-transform duration-200" />
              <span>الاتجاهات</span>
            </a>
          </div>

          {/* Phone & Working Hours Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              {doctor.phone1 ? (
                <a href={`tel:${doctor.phone1}`} className="font-mono text-[#0f2a44] dark:text-slate-100 font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-colors" dir="ltr">
                  {doctor.phone1}
                </a>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">يُضاف رقم التواصل عند التسجيل</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {doctor.workingHours && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-300">
                  <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate max-w-[130px]">{doctor.workingHours}</span>
                </div>
              )}
              {doctor.phone1 && (
                <a href={`tel:${doctor.phone1}`} className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/50 px-2 py-0.5 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors">
                  اتصال
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer: Price + Book Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">قيمة الكشف</span>
            <div className="flex items-baseline gap-1 text-[#0f2a44] dark:text-white font-black text-lg sm:text-xl">
              <span>{doctor.price}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">جنيه</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {doctor.isDemo && onAddDataClick && (
              <button
                type="button"
                onClick={onAddDataClick}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="أضف بيانات عيادتك الحقيقية"
              >
                أضف بياناتك
              </button>
            )}

            <button
              type="button"
              onClick={() => onBook(doctor)}
              className="px-4 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>احجز الآن</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
