import React, { useState } from 'react';
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
import defaultDoctorPortrait from '../assets/images/default_doctor_portrait_1794938584483.jpg';

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

  const isCustomPhoto = (url?: string) =>
    Boolean(
      url &&
        url.trim() !== '' &&
        url.trim() !== 'clinic_image' &&
        url.trim() !== 'doctor_image' &&
        url.trim() !== '/assets/default-doctor.jpg'
    );

  const customPhoto =
    (isCustomPhoto(doctor.doctorPhoto) ? doctor.doctorPhoto : undefined) ||
    (isCustomPhoto(doctor.clinic_image) ? doctor.clinic_image : undefined) ||
    (isCustomPhoto(doctor.clinicPhoto) ? doctor.clinicPhoto : undefined);

  const photoSrc = !imgError && customPhoto ? customPhoto : defaultDoctorPortrait;

  return (
    <div className="group relative bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[500px] sm:min-h-[530px]">
      
      {/* Full-bleed Background Doctor Photo (Top to Bottom) */}
      <img
        src={photoSrc}
        alt={doctor.name}
        referrerPolicy="no-referrer"
        onError={() => {
          if (!imgError) setImgError(true);
        }}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 select-none"
      />

      {/* Subtle Gradient Scrim over the background photo for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/75 pointer-events-none" />

      {/* Top Overlay Bar: Specialty Badge + Verified Status + Rating */}
      <div className="relative z-10 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        
        {/* Right side: Specialty + Stethoscope */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-white/60 dark:border-slate-700/70 shadow-sm max-w-[65%]">
          <Stethoscope className="w-4 h-4 text-[#0d9488] dark:text-teal-400 shrink-0" />
          <span className="text-xs font-extrabold text-[#0f2a44] dark:text-teal-300 truncate">
            {doctor.specialty}
          </span>
        </div>

        {/* Left side: Verified/Demo + Star Rating */}
        <div className="flex items-center gap-1.5">
          {doctor.isDemo ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-white/60 dark:border-slate-700/70 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>مثال توضيحي</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50/90 dark:bg-emerald-950/85 backdrop-blur-md text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm">
              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>طبيب موثق</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => onViewReviews && onViewReviews(doctor)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-950/80 backdrop-blur-md hover:bg-amber-50 dark:hover:bg-slate-900 border border-white/60 dark:border-slate-700/70 text-amber-900 dark:text-amber-200 transition-all active:scale-95 text-xs font-bold shadow-sm group/rating cursor-pointer"
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

      {/* Middle Clear Portrait Showcase Spacer */}
      <div className="relative z-10 flex-1 min-h-[175px] sm:min-h-[195px] pointer-events-none" />

      {/* Bottom Translucent Content Panel Over Photo */}
      <div className="relative z-10 m-3 sm:m-3.5 p-4 rounded-2xl bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-white/70 dark:border-slate-800/90 shadow-xl space-y-3">
        
        {/* Doctor Name */}
        <div>
          <h3 className="font-extrabold text-lg sm:text-xl text-[#0f2a44] dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
            {doctor.name}
          </h3>

          {/* Governorate / Center Badge */}
          {(doctor.governorate || doctor.center) && (
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50/90 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-[11px] font-bold border border-teal-200/70 dark:border-teal-800/60">
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
        <div className="flex items-start justify-between gap-2 text-xs text-slate-700 dark:text-slate-200">
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed font-medium">{doctor.address}</span>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/90 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800 shrink-0 transition-all duration-200 shadow-2xs group/map active:scale-95"
            title="فتح الموقع ومسار الوصول في خرائط جوجل"
          >
            <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover/map:rotate-45 transition-transform duration-200" />
            <span>الاتجاهات</span>
          </a>
        </div>

        {/* Phone & Working Hours Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-200 bg-slate-100/85 dark:bg-slate-900/80 px-2.5 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            {doctor.phone1 ? (
              <a href={`tel:${doctor.phone1}`} className="font-mono text-[#0f2a44] dark:text-slate-100 font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-colors" dir="ltr">
                {doctor.phone1}
              </a>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">يُضاف رقم التواصل عند التسجيل</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {doctor.workingHours && (
              <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate max-w-[130px]">{doctor.workingHours}</span>
              </div>
            )}
            {doctor.phone1 && (
              <a href={`tel:${doctor.phone1}`} className="text-[10px] font-bold text-teal-800 dark:text-teal-200 bg-teal-100/90 dark:bg-teal-900/60 px-2 py-0.5 rounded-md hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors">
                اتصال
              </a>
            )}
          </div>
        </div>

        {/* Card Footer: Price + Book Button */}
        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
          
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">قيمة الكشف</span>
            <div className="flex items-baseline gap-1 text-[#0f2a44] dark:text-white font-black text-lg sm:text-xl">
              <span>{doctor.price}</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">جنيه</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {doctor.isDemo && onAddDataClick && (
              <button
                type="button"
                onClick={onAddDataClick}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
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
