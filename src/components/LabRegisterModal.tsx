import React, { useState } from 'react';
import { 
  X, 
  FlaskConical, 
  Phone, 
  MapPin, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  TestTube2,
  Building2
} from 'lucide-react';
import { Lab, LabTestItem } from '../types';
import { EGYPT_GOVERNORATES, getCentersForGovernorate } from '../data/egyptLocations';

interface LabRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterLab: (lab: Lab) => void;
}

export const LabRegisterModal: React.FC<LabRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterLab
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('سوهاج');
  const [center, setCenter] = useState('سوهاج (المركز والمدينة)');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [workingHours, setWorkingHours] = useState('يومياً من ٨ ص حتى ١١ م');
  const [labPhoto, setLabPhoto] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  // Available centers for current selected governorate
  const availableCenters = getCentersForGovernorate(governorate);

  if (!isOpen) return null;

  const handleGovernorateChange = (newGov: string) => {
    setGovernorate(newGov);
    const newCenters = getCentersForGovernorate(newGov);
    setCenter(newCenters[0] || '');
  };

  // Dynamic list of tests: name + price
  const [tests, setTests] = useState<LabTestItem[]>([
    { id: 't-init-1', name: 'صورة دم كاملة (CBC)', price: 140 },
    { id: 't-init-2', name: 'سكر تراكمي (HbA1c)', price: 120 },
    { id: 't-init-3', name: 'وظائف كبد (SGOT, SGPT)', price: 180 }
  ]);
  const [newTestName, setNewTestName] = useState('');
  const [newTestPrice, setNewTestPrice] = useState<number | ''>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLabPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTest = () => {
    if (!newTestName.trim() || !newTestPrice) {
      alert('يرجى إدخال اسم التحليل وسعره');
      return;
    }
    const newTest: LabTestItem = {
      id: 'test-' + Date.now(),
      name: newTestName.trim(),
      price: Number(newTestPrice)
    };
    setTests([...tests, newTest]);
    setNewTestName('');
    setNewTestPrice('');
  };

  const handleRemoveTest = (id: string) => {
    setTests(tests.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('من فضلك أكمل الحقول المطلوبة');
      return;
    }

    const minPrice = tests.length > 0 ? Math.min(...tests.map((t) => t.price)) : 150;

    const newLab: Lab = {
      id: 'lab-' + Date.now(),
      name: name.trim().startsWith('معمل') ? name.trim() : `معمل ${name.trim()}`,
      phone: phone.trim(),
      governorate,
      center,
      city: center,
      address: address.trim(),
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      startingPrice: minPrice,
      tests: tests.length > 0 ? tests : [{ id: 'test-def', name: 'فحص عام', price: 150 }],
      labPhoto: labPhoto || undefined,
      workingHours: workingHours.trim() || undefined,
      isDemo: false,
      status: 'pending', // Pending admin approval
      createdAt: new Date().toISOString()
    };

    onRegisterLab(newLab);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="relative bg-gradient-to-l from-[#0f2a44] via-teal-900 to-[#0d9488] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                تسجيل معمل تحاليل جديد
              </h3>
              <p className="text-xs text-teal-200">
                أضف معملك وقائمتك وأسعار التحاليل للجمهور
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
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-[#0f2a44] dark:text-white">
              تم إرسال طلب انضمام المعمل بنجاح!
            </h4>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              <div className="flex items-center justify-center gap-1.5 font-bold mb-1 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>حالة المعمل: قيد المراجعة (معلق)</span>
              </div>
              سيتم فحص بيانات المعمل وقائمة التحاليل وتفعيل ظهورها للمرضى بعد موافقة الإدارة.
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-8 py-3 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-colors active:scale-95"
            >
              تم، العودة للصفحة الرئيسية
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                سيتم إرسال معملك بحالة <strong>معلق</strong> ليتم مراجعته واعتماده عبر لوحة الإدارة.
              </span>
            </div>

            {/* Lab Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المعمل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: معمل الدقة التخصصي للتحاليل"
                  className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <FlaskConical className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
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

            {/* Detailed Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان المعمل بالتفصيل والشارع <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: شارع سيتي - بجوار صيدلية الإسعاف"
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

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم تليفون المعمل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono focus:border-teal-500 text-right"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مواعيد العمل وخدمات السحب المنزلي
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="مثال: يومياً من ٨ صباحاً حتى ١١ مساءً مع خدمة سحب العينات بالمنزل"
                  className="w-full py-2.5 px-3 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-teal-500"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Dynamic List: Test Name + Price with + Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold text-[#0f2a44] dark:text-white flex items-center gap-1.5">
                  <TestTube2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>قائمة التحاليل والأسعار (ديناميكية)</span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {tests.length} تحاليل مسجلة
                </span>
              </div>

              {/* Add New Test Row */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">إضافة تحليل جديد للقائمة:</div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <input
                      type="text"
                      placeholder="اسم التحليل (مثال: فيتامين د)"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:border-teal-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="السعر (ج)"
                      value={newTestPrice}
                      onChange={(e) => setNewTestPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm font-bold focus:border-teal-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddTest}
                      className="w-full h-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                      title="إضافة التحليل"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">إضافة</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Render Current Tests List */}
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs hover:border-teal-200 dark:hover:border-teal-700 transition-colors"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{test.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0d9488] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100 dark:border-teal-800">
                        {test.price} جنيه
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(test.id)}
                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-500 transition-colors active:scale-95"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Photo Upload */}
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">صورة واجهة المعمل أو الشعار</span>
              {labPhoto ? (
                <div className="relative inline-block">
                  <img src={labPhoto} alt="Lab" className="w-28 h-20 rounded-xl object-cover border-2 border-teal-500 mx-auto shadow-xs" />
                  <button
                    type="button"
                    onClick={() => setLabPhoto('')}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2">
                  <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">رفع صورة المعمل</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">PNG / JPG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                إرسال طلب تسجيل المعمل
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
