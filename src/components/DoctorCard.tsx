import React from 'react';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Sparkles,
  Clock,
  Star,
  Navigation
} from 'lucide-react';
import { Doctor, Review } from '../types';
import { getGoogleMapsUrl } from '../utils/maps';

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

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-300 dark:hover:border-teal-700/70 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Top Header Area with Stethoscope Icon + Badge */}
      <div className="relative bg-gradient-to-r from-teal-50/90 via-sky-50 to-teal-100/70 dark:from-slate-800 dark:via-slate-800/80 dark:to-teal-950/40 p-4 border-b border-teal-100/60 dark:border-slate-800 flex items-center justify-between">
        
        {/* Right side: Stethoscope icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-[#0d9488] dark:text-teal-400 shadow-xs flex items-center justify-center border border-teal-100/80 dark:border-slate-700 group-hover:scale-105 transition-transform duration-200">
            <Stethoscope className="w-5 h-5 text-[#0d9488] dark:text-teal-400" />
          </div>

          {doctor.doctorPhoto && (
            <img 
              src={doctor.doctorPhoto} 
              alt={doctor.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs hidden sm:block" 
            />
          )}
        </div>

        {/* Left side: "مثال توضيحي" or "طبيب موثق" badge */}
        <div className="flex items-center gap-2">
          {doctor.isDemo ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>مثال توضيحي</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>طبيب موثق</span>
            </span>
          )}

          <div className="w-6 h-6 rounded-full bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2.5">
          {/* Specialty in Teal + Rating Badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-[#0d9488] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-lg border border-teal-100/60 dark:border-teal-800/50">
              {doctor.specialty}
            </span>

            {/* Prominent Star Rating Badge with Micro-interaction */}
            <button
              type="button"
              onClick={() => onViewReviews && onViewReviews(doctor)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 transition-all active:scale-95 text-xs font-bold shadow-2xs group/rating cursor-pointer"
              title="عرض تقييمات المرضى وآرائهم"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover/rating:scale-125 transition-transform duration-200" />
              <span className="font-black text-[#0f2a44] dark:text-white">{avgRating || '5.0'}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                ({totalReviews > 0 ? `${totalReviews} تقييم` : 'جديد'})
              </span>
            </button>
          </div>

          {/* Doctor Name in Bold */}
          <h3 className="font-extrabold text-xl text-[#0f2a44] dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
            {doctor.name}
          </h3>

          {/* Location with Pin and Governorate / Center Badge */}
          <div className="space-y-1.5">
            {(doctor.governorate || doctor.center) && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-100 dark:border-teal-800/50">
                <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>
                  {doctor.governorate ? `${doctor.governorate}` : ''}
                  {doctor.governorate && doctor.center ? ' • ' : ''}
                  {doctor.center ? `${doctor.center}` : ''}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-relaxed">{doctor.address}</span>
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

          {/* Phone note with Phone Icon */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              {doctor.phone1 ? (
                <a href={`tel:${doctor.phone1}`} className="font-mono text-slate-800 dark:text-slate-100 font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-colors" dir="ltr">
                  {doctor.phone1}
                </a>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">يُضاف رقم التواصل عند التسجيل</span>
              )}
            </div>
            {doctor.phone1 && (
              <a href={`tel:${doctor.phone1}`} className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/40 px-2 py-0.5 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/80 transition-colors">
                اتصال
              </a>
            )}
          </div>

          {/* Working hours if present */}
          {doctor.workingHours && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{doctor.workingHours}</span>
            </div>
          )}
        </div>

        {/* Card Footer: Price + Action Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">قيمة الكشف</span>
            <div className="flex items-baseline gap-1 text-[#0f2a44] dark:text-white font-extrabold text-lg sm:text-xl">
              <span>{doctor.price}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">جنيه</span>
            </div>
          </div>

          {/* Action Buttons: Book or Add data */}
          <div className="flex items-center gap-1.5">
            {doctor.isDemo && onAddDataClick && (
              <button
                type="button"
                onClick={onAddDataClick}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-2xs active:scale-95"
                title="أضف بيانات عيادتك الحقيقية"
              >
                أضف بياناتك
              </button>
            )}

            <button
              type="button"
              onClick={() => onBook(doctor)}
              className="px-4 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5"
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
