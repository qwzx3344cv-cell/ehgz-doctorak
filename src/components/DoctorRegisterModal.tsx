import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  User, 
  Phone, 
  MapPin, 
  Upload, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Building2
} from 'lucide-react';
import { SPECIALTIES } from '../constants';
import { Doctor } from '../types';
import { EGYPT_GOVERNORATES, getCentersForGovernorate } from '../data/egyptLocations';

interface DoctorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterDoctor: (doctor: Doctor) => void;
}

export const DoctorRegisterModal: React.FC<DoctorRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterDoctor
}) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [governorate, setGovernorate] = useState('سوهاج');
  const [center, setCenter] = useState('سوهاج (المركز والمدينة)');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [price, setPrice] = useState(250);
  const [workingHours, setWorkingHours] = useState('يومياً من ٥م إلى ٩م');
  const [doctorPhoto, setDoctorPhoto] = useState<string>('');
  const [clinicPhoto, setClinicPhoto] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  // Available centers for current selected governorate
  const availableCenters = getCentersForGovernorate(governorate);

  if (!isOpen) return null;

  const handleGovernorateChange = (newGov: string) => {
    setGovernorate(newGov);
    const newCenters = getCentersForGovernorate(newGov);
    setCenter(newCenters[0] || '');
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone1.trim() || !address.trim() || !price) {
      alert('من فضلك أكمل الحقول المطلوبة');
      return;
    }

    const newDoctor: Doctor = {
      id: 'doc-' + Date.now(),
      name: name.trim().startsWith('د.') ? name.trim() : `د. ${name.trim()}`,
      specialty,
      phone1: phone1.trim(),
      phone2: phone2.trim() || undefined,
      governorate,
      center,
      city: center,
      address: address.trim(),
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      price: Number(price),
      workingHours: workingHours.trim() || undefined,
      doctorPhoto: doctorPhoto || undefined,
      clinicPhoto: clinicPhoto || undefined,
      isDemo: false,
      status: 'pending', // Pending admin approval
      createdAt: new Date().toISOString()
    };

    onRegisterDoctor(newDoctor);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="relative bg-gradient-to-l from-[#0f2a44] via-teal-900 to-[#0d9488] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                تسجيل عيادة طبيب جديدة
              </h3>
              <p className="text-xs text-teal-200">
                انضم لشبكة الأطباء واستقبل حجوزات المرضى مباشرة
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

        {submitted ? (
          /* Submission success banner */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-[#0f2a44] dark:text-white">
              تم إرسال طلب انضمام عيادتك بنجاح!
            </h4>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              <div className="flex items-center justify-center gap-1.5 font-bold mb-1 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>حالة الطلب: قيد المراجعة (معلق)</span>
              </div>
              سيتم مراجعة بيانات عيادتك من قِبل الإدارة وتفعيل ظهورها في قائمة الأطباء المتاحة للمرضى في أقرب وقت.
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-8 py-3 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-colors active:scale-95"
            >
              تم، العودة للصفحة الرئيسية
            </button>
          </div>
        ) : (
          /* Doctor Registration Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Notice */}
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                سيتم حفظ طلبك بحالة <strong>معلق</strong> ليتم اعتماده من لوحة الإدارة قبل ظهوره العام.
              </span>
            </div>

            {/* Doctor Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم الدكتور بالكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: د. حسام عبد الفتاح"
                  className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Specialty Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                التخصص الطبي <span className="text-red-500">*</span>
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Governorate & Center Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>المحافظة <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => handleGovernorateChange(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:border-teal-500"
                >
                  <optgroup label="المحافظة المميزة">
                    <option value="سوهاج">⭐ محافظة سوهاج</option>
                  </optgroup>
                  <optgroup label="باقي المحافظات">
                    {EGYPT_GOVERNORATES.filter((g) => g.id !== 'sohag').map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>المركز / المدينة <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:border-teal-500"
                >
                  {availableCenters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان العيادة بالتفصيل والشارع <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: شارع الجمهورية - أمام المحطة - برج الأطباء - الدور الثاني"
                  className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-teal-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Optional Google Maps Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>رابط الموقع على خرائط جوجل (Google Maps)</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">اختياري - يسهل وصول المرضى</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  dir="ltr"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... أو اتركه فارغاً وسيتم إنشاؤه تلقائياً"
                  className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:border-teal-500 font-sans text-left"
                />
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Two Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف الأول (أساسي) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    placeholder="01012345678"
                    className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono focus:border-teal-500 text-right"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف الثاني (بديل / واتساب)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    placeholder="01298765432"
                    className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono focus:border-teal-500 text-right"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Price & Working Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سعر الكشف (بالجنيه) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={30}
                    step={10}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-bold focus:border-teal-500"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  أيام وساعات العمل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="مثال: يومياً من ٤م إلى ٩م ماعدا الجمعة"
                    className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-teal-500"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            </div>

            {/* Photos Upload: Doctor Photo & Clinic Photo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Doctor Photo */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">صورة الطبيب الشخصية</span>
                {doctorPhoto ? (
                  <div className="relative inline-block">
                    <img src={doctorPhoto} alt="Doctor" className="w-20 h-20 rounded-full object-cover border-2 border-teal-500 mx-auto shadow-xs" />
                    <button
                      type="button"
                      onClick={() => setDoctorPhoto('')}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">رفع صورة الطبيب</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">PNG / JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setDoctorPhoto)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Clinic Photo */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">صورة العيادة / المدخل</span>
                {clinicPhoto ? (
                  <div className="relative inline-block">
                    <img src={clinicPhoto} alt="Clinic" className="w-28 h-20 rounded-xl object-cover border-2 border-teal-500 mx-auto shadow-xs" />
                    <button
                      type="button"
                      onClick={() => setClinicPhoto('')}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">رفع صورة العيادة</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">PNG / JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setClinicPhoto)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                إرسال طلب تسجيل العيادة
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
