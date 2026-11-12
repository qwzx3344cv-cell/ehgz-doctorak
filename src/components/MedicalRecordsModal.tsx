import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  Pill, 
  FileCheck2, 
  FileImage, 
  Printer, 
  Calendar, 
  Phone, 
  Stethoscope, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  FlaskConical,
  Filter
} from 'lucide-react';
import { EPrescription, MedicalRecordAttachment, MedicalAttachmentType, Booking } from '../types';
import { PrescriptionPrintModal } from './PrescriptionPrintModal';

interface MedicalRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptions: EPrescription[];
  medicalRecords: MedicalRecordAttachment[];
  bookings: Booking[];
  onSaveMedicalRecord: (record: MedicalRecordAttachment) => Promise<void>;
  onDeleteMedicalRecord: (id: string) => Promise<void>;
  onDeletePrescription?: (id: string) => Promise<void>;
  initialPhone?: string;
}

export const MedicalRecordsModal: React.FC<MedicalRecordsModalProps> = ({
  isOpen,
  onClose,
  prescriptions,
  medicalRecords,
  bookings,
  onSaveMedicalRecord,
  onDeleteMedicalRecord,
  onDeletePrescription,
  initialPhone = ''
}) => {
  // Patient phone identifier (persisted in localStorage)
  const [patientPhone, setPatientPhone] = useState<string>(() => {
    if (initialPhone) return initialPhone;
    try {
      return localStorage.getItem('ehgz_patient_phone') || '';
    } catch {
      return '';
    }
  });

  const [activeTab, setActiveTab] = useState<'prescriptions' | 'records' | 'upload'>('prescriptions');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected prescription to preview / print
  const [selectedPrescription, setSelectedPrescription] = useState<EPrescription | null>(null);

  // File Preview Overlay (for image/pdf)
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: 'image' | 'pdf' } | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<MedicalAttachmentType>('lab_test');
  const [uploadDoctorOrLab, setUploadDoctorOrLab] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadPatientName, setUploadPatientName] = useState('');
  const [selectedFileData, setSelectedFileData] = useState<{
    url: string;
    name: string;
    type: 'image' | 'pdf';
    size: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update localStorage when phone changes
  useEffect(() => {
    if (patientPhone.trim()) {
      try {
        localStorage.setItem('ehgz_patient_phone', patientPhone.trim());
      } catch (e) {
        // ignore
      }
    }
  }, [patientPhone]);

  if (!isOpen) return null;

  // Clean phone string for comparison
  const cleanPhone = patientPhone.replace(/\D/g, '').trim();

  // Filtered prescriptions for this patient
  const patientPrescriptions = prescriptions.filter((p) => {
    if (!cleanPhone) return true;
    const pPhone = p.patientPhone.replace(/\D/g, '').trim();
    return pPhone.includes(cleanPhone) || cleanPhone.includes(pPhone);
  });

  // Filtered medical records for this patient
  const patientRecords = medicalRecords.filter((r) => {
    if (cleanPhone) {
      const rPhone = r.patientPhone.replace(/\D/g, '').trim();
      if (!rPhone.includes(cleanPhone) && !cleanPhone.includes(rPhone)) {
        return false;
      }
    }
    if (selectedCategory !== 'all' && r.type !== selectedCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(term);
      const matchDoc = r.doctorOrLabName?.toLowerCase().includes(term);
      const matchNotes = r.notes?.toLowerCase().includes(term);
      return matchTitle || matchDoc || matchNotes;
    }
    return true;
  });

  // Recent phone suggestions from bookings
  const knownPhones = Array.from(
    new Set(bookings.map((b) => b.patientPhone).filter(Boolean))
  );

  // Handle File Selection and Base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 4MB for Firestore base64 storage safety
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('حجم الملف كبير جداً (الحد الأقصى ٤ ميجابايت)');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setUploadError('يرجى اختيار ملف صورة (PNG, JPG, WEBP) أو ملف PDF');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      setSelectedFileData({
        url: result,
        name: file.name,
        type: isPdf ? 'pdf' : 'image',
        size: sizeStr
      });

      // Auto-populate title if empty
      if (!uploadTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setUploadTitle(cleanName);
      }
    };
    reader.onerror = () => {
      setUploadError('فشل قراءة الملف، يرجى المحاولة مرة أخرى');
    };
    reader.readAsDataURL(file);
  };

  // Submit new medical attachment
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccessMsg('');

    if (!cleanPhone || cleanPhone.length < 8) {
      setUploadError('يرجى إدخال رقم هاتف صحيح لربط الملف الطبي به');
      return;
    }

    if (!uploadTitle.trim()) {
      setUploadError('يرجى كتابة عنوان للفحص أو التقرير');
      return;
    }

    if (!selectedFileData) {
      setUploadError('يرجى اختيار أو رفع صورة التحليل أو ملف الـ PDF');
      return;
    }

    setIsUploading(true);
    try {
      const newRecord: MedicalRecordAttachment = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        patientPhone: patientPhone.trim(),
        patientName: uploadPatientName.trim() || 'المريض',
        title: uploadTitle.trim(),
        type: uploadType,
        fileUrl: selectedFileData.url,
        fileName: selectedFileData.name,
        fileType: selectedFileData.type,
        fileSize: selectedFileData.size,
        doctorOrLabName: uploadDoctorOrLab.trim(),
        date: uploadDate,
        notes: uploadNotes.trim(),
        createdAt: new Date().toISOString()
      };

      await onSaveMedicalRecord(newRecord);
      setUploadSuccessMsg('تم حفظ الفحص الطبي في سجلك بنجاح!');
      setSelectedFileData(null);
      setUploadTitle('');
      setUploadNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setActiveTab('records');
        setUploadSuccessMsg('');
      }, 1200);
    } catch (err) {
      setUploadError('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f2a44] via-slate-800 to-teal-900 p-5 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2">
                  <span>السجل الطبي والروشتات الإلكترونية</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                    E-Prescriptions & Records
                  </span>
                </h3>
                <p className="text-xs text-teal-200/80">
                  استعرض روشتات الأطباء، وارفع واحتفظ بصور التحاليل والأشعة السابقة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mr-auto sm:mr-0">
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Patient Phone Filter Bar */}
          <div className="p-3.5 sm:px-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                رقم هاتف المريض:
              </span>
              <input
                type="tel"
                dir="ltr"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full max-w-[200px] px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
              />
              {patientPhone && (
                <button
                  type="button"
                  onClick={() => setPatientPhone('')}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline shrink-0"
                >
                  عرض الكل
                </button>
              )}
            </div>

            {/* Known phone tags if any */}
            {knownPhones.length > 0 && !patientPhone && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[11px] text-slate-400">أرقام سابقة:</span>
                {knownPhones.slice(0, 2).map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => setPatientPhone(ph)}
                    className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 font-mono text-[11px] border border-teal-200 dark:border-teal-800 transition-colors"
                  >
                    {ph}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'prescriptions'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/30'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>الروشتات الطبية ({patientPrescriptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'records'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/30'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>الفحوصات والأشعة السابقة ({patientRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/30'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع فحص طبي جديد</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* TAB 1: E-PRESCRIPTIONS */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>الروشتات الطبية الصادرة من الأطباء</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    اضغط على أي روشتة لمعاينتها وطباعتها بصيغة رسمية
                  </span>
                </div>

                {patientPrescriptions.length === 0 ? (
                  <div className="py-14 text-center rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                    <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      لا توجد روشتات إلكترونية مسجلة لهذا الرقم حتى الآن
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      يقوم الطبيب بإصدار الروشتة إلكترونياً بعد انتهاء الكشف، وتصلك لحظياً هنا مع إشعار صوتي فوري على هاتفك.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientPrescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-500 dark:hover:border-teal-500 transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                              {rx.prescriptionCode}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(rx.createdAt).toLocaleDateString('ar-EG')}</span>
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-black text-sm text-[#0f2a44] dark:text-white">
                                  د. {rx.doctorName}
                                </h4>
                                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                                  {rx.doctorSpecialty}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">التشخيص:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{rx.diagnosis}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>الأدوية الموصوفة: <strong>{rx.medicines.length} دواء</strong></span>
                              {rx.followUpDate && <span>استشارة: <strong>{rx.followUpDate}</strong></span>}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPrescription(rx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة وطباعة الروشتة</span>
                          </button>

                          {onDeletePrescription && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('هل ترغب حقاً في حذف هذه الروشتة من السجل؟')) {
                                  onDeletePrescription(rx.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MEDICAL RECORDS & LAB TESTS & X-RAYS */}
            {activeTab === 'records' && (
              <div className="space-y-4">
                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'lab_test', label: '🔬 تحاليل طبية' },
                      { id: 'x_ray', label: '🩻 أشعة وسونار' },
                      { id: 'report', label: '📋 تقارير طبية' },
                      { id: 'prescription', label: '💊 روشتات سابقة' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="ابحث في السجلات والفحوصات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {patientRecords.length === 0 ? (
                  <div className="py-14 text-center rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                    <FileImage className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      لا توجد فحوصات أو تحاليل مرفوعة حالياً
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      يمكنك رفع صور نتائج التحاليل، تقارير الأشعة (PDF/صور)، وكشوفاتك السابقة للاحتفاظ بها في مكان واحد وتقديمها لطبيبك.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs transition-all shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>رفع فحص أو تحليل الآن</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patientRecords.map((rec) => {
                      const badgeLabel = 
                        rec.type === 'lab_test' ? 'تحليل معمل' :
                        rec.type === 'x_ray' ? 'أشعة / سونار' :
                        rec.type === 'report' ? 'تقرير طبي' : 'مستند طبي';

                      return (
                        <div
                          key={rec.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-400 dark:hover:border-teal-500 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            {/* Thumbnail or Icon Preview */}
                            <div 
                              onClick={() => setPreviewFile({ url: rec.fileUrl, name: rec.fileName, type: rec.fileType })}
                              className="relative h-32 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 overflow-hidden flex items-center justify-center cursor-pointer group/thumb"
                            >
                              {rec.fileType === 'image' ? (
                                <img
                                  src={rec.fileUrl}
                                  alt={rec.title}
                                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="text-center p-3 space-y-1">
                                  <FileText className="w-10 h-10 text-red-500 mx-auto" />
                                  <span className="font-mono text-[10px] text-slate-500 block">PDF Document</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                <Eye className="w-4 h-4" />
                                <span>معاينة الفحص</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-1 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold">
                                {badgeLabel}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {rec.date || new Date(rec.createdAt).toLocaleDateString('ar-EG')}
                              </span>
                            </div>

                            <h4 className="font-black text-sm text-[#0f2a44] dark:text-white line-clamp-1">
                              {rec.title}
                            </h4>

                            {rec.doctorOrLabName && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <FlaskConical className="w-3 h-3 text-teal-600" />
                                <span>{rec.doctorOrLabName}</span>
                              </p>
                            )}

                            {rec.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-850 p-1.5 rounded-lg">
                                {rec.notes}
                              </p>
                            )}
                          </div>

                          {/* Footer action buttons */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewFile({ url: rec.fileUrl, name: rec.fileName, type: rec.fileType })}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 transition-colors"
                                title="معاينة"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={rec.fileUrl}
                                download={rec.fileName || 'medical-record'}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors"
                                title="تحميل الملف"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف "${rec.title}"؟`)) {
                                  onDeleteMedicalRecord(rec.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                              title="حذف المستند"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: UPLOAD NEW RECORD */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUploadSubmit} className="max-w-xl mx-auto space-y-4">
                {uploadSuccessMsg && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Patient Phone and Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      رقم هاتف المريض: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      اسم المريض (اختياري):
                    </label>
                    <input
                      type="text"
                      value={uploadPatientName}
                      onChange={(e) => setUploadPatientName(e.target.value)}
                      placeholder="اسم المريض ثلاثياً"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold"
                    />
                  </div>
                </div>

                {/* Category & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      نوع الفحص / المستند:
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as MedicalAttachmentType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="lab_test">تحليل معمل (دم، سكر، وظائف كبد...)</option>
                      <option value="x_ray">أشعة / سونار / رنين مغناطيسي</option>
                      <option value="report">تقرير طبي / استشارة سابقة</option>
                      <option value="prescription">صورة روشتة خارجية</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      عنوان أو اسم الفحص: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: تحليل CBC، أشعة مقطعية على الصدر"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold"
                    />
                  </div>
                </div>

                {/* Doctor/Lab Name & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      اسم المعمل أو مركز الأشعة أو الطبيب:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: معمل البرج، مركز النيل للأشعة"
                      value={uploadDoctorOrLab}
                      onChange={(e) => setUploadDoctorOrLab(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      تاريخ إجراء الفحص:
                    </label>
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    ملف الفحص (صورة أو PDF): <span className="text-red-500">*</span>
                  </label>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-teal-500/40 hover:border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFileData ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-900 dark:text-white">
                            {selectedFileData.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            الحجم: {selectedFileData.size} • النوع: {selectedFileData.type.toUpperCase()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFileData(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          تغيير الملف
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            انقر لاختيار صورة التحليل أو ملف الـ PDF
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            يدعم صيغ JPG، PNG، WEBP، وملفات PDF (حتى ٤ ميجابايت)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    ملاحظات الطبيب أو نتيجة الفحص:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="مثال: الهيموجلوبين ١٣.٥، السكر صائم ٩٠..."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isUploading || !selectedFileData}
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'جاري رفع الفحص وتشفيره...' : 'حفظ الفحص في السجل الطبي'}</span>
                </button>
              </form>
            )}

          </div>

        </div>
      </div>

      {/* Prescription Preview & Print Modal */}
      {selectedPrescription && (
        <PrescriptionPrintModal
          isOpen={true}
          onClose={() => setSelectedPrescription(null)}
          prescription={selectedPrescription}
        />
      )}

      {/* File Preview Overlay Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm truncate max-w-[80%]">
                {previewFile.name}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs flex items-center gap-1 font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/20 min-h-[300px]">
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-[75vh] rounded-xl border border-slate-700"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
