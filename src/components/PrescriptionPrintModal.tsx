import React from 'react';
import { X, Printer, Stethoscope, Calendar, Phone, MapPin, Pill, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { EPrescription } from '../types';

interface PrescriptionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: EPrescription | null;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  isOpen,
  onClose,
  prescription
}) => {
  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-gradient-to-r from-[#0f2a44] via-slate-800 to-teal-900 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                الروشتة الطبية الإلكترونية ({prescription.prescriptionCode})
              </h3>
              <p className="text-[11px] text-teal-200/80">
                روشتة رسمية موثقة صادرة عن المنظومة الطبية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-xs"
              title="طباعة الروشتة أو حفظها بصيغة PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الروشتة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white dark:bg-slate-900 print:p-0 print:m-0 print:shadow-none print:border-none">
          <div className="border-2 border-teal-700/60 dark:border-teal-600/60 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-teal-50/20 via-white to-slate-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 relative shadow-sm print:border-2 print:border-black print:rounded-none">
            
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none">
              <span className="text-[140px] font-black text-teal-900 font-serif">Rx</span>
            </div>

            {/* Official Clinic Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-teal-600/30 dark:border-teal-500/30 relative">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f2a44] dark:text-white">
                      د. {prescription.doctorName}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-400">
                      {prescription.doctorSpecialty}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-left text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 font-mono font-bold text-xs border border-teal-200 dark:border-teal-800">
                  <span className="font-sans font-bold">كود الروشتة:</span>
                  <span>{prescription.prescriptionCode}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-start sm:justify-end text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>التاريخ: {new Date(prescription.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {prescription.doctorPhone && (
                  <div className="flex items-center gap-1.5 justify-start sm:justify-end font-mono">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>{prescription.doctorPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Meta Strip */}
            <div className="my-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">اسم المريض:</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{prescription.patientName}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-500 dark:text-slate-400 font-medium font-sans">رقم الهاتف:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{prescription.patientPhone}</span>
              </div>
              {prescription.bookingCode && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">كود الحجز:</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    {prescription.bookingCode}
                  </span>
                </div>
              )}
            </div>

            {/* Diagnosis (التشخيص الطبي) */}
            {prescription.diagnosis && (
              <div className="mb-6 p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 text-xs">
                <span className="font-black text-teal-900 dark:text-teal-200 ml-2">التشخيص الطبي:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{prescription.diagnosis}</span>
              </div>
            )}

            {/* Rx Medicine Section */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 pb-2 border-b border-teal-500/20 text-teal-800 dark:text-teal-300 font-black text-base">
                <span className="text-2xl font-serif text-[#0d9488]">℞</span>
                <span>الأدوية والعلاج الموصوف</span>
              </div>

              {prescription.medicines.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">لم يتم إدراج أدوية محددة</p>
              ) : (
                <div className="space-y-3">
                  {prescription.medicines.map((med, idx) => (
                    <div 
                      key={med.id || idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-black text-sm text-[#0f2a44] dark:text-white">
                            {med.name}
                          </h4>
                          {med.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {med.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:mr-auto">
                        <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-black border border-teal-200 dark:border-teal-800">
                          {med.dosage}
                        </span>
                        {med.duration && (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            {med.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctor's Advice & Instructions */}
            {prescription.advice && (
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1 mb-6">
                <span className="font-black text-amber-900 dark:text-amber-200 block">تعليمات وإرشادات الطبيب:</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {prescription.advice}
                </p>
              </div>
            )}

            {/* Follow-up & Footer Signature */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-1 text-center sm:text-right">
                {prescription.followUpDate && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold border border-blue-200 dark:border-blue-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>موعد الاستشارة القادمة: {prescription.followUpDate}</span>
                  </div>
                )}
                {prescription.clinicAddress && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{prescription.clinicAddress}</span>
                  </p>
                )}
              </div>

              {/* Digital Doctor Signature Badge */}
              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>توقيع إلكتروني موثق</span>
                </div>
                <div className="font-serif italic font-bold text-slate-700 dark:text-slate-300 text-sm">
                  Dr. {prescription.doctorName}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
