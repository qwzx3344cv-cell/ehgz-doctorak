import React, { useState } from 'react';
import { X, Plus, Trash2, Pill, Stethoscope, Save, Calendar, AlertCircle } from 'lucide-react';
import { Booking, Doctor, EPrescription, PrescriptionMedicine } from '../types';

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  doctor?: Doctor;
  onSavePrescription: (prescription: EPrescription) => Promise<void>;
}

export const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({
  isOpen,
  onClose,
  booking,
  doctor,
  onSavePrescription
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'med_' + Date.now(),
      name: '',
      dosage: 'قرص بعد الأكل ٣ مرات يومياً',
      duration: 'لمدة ٥ أيام',
      notes: ''
    }
  ]);
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: 'med_' + Date.now() + Math.random().toString(36).substring(2, 6),
        name: '',
        dosage: 'قرص مرتين يومياً',
        duration: 'لمدة أسبوع',
        notes: ''
      }
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    if (medicines.length <= 1) {
      alert('يجب الإبقاء على دواء واحد على الأقل في الروشتة');
      return;
    }
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, value: string) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!diagnosis.trim()) {
      setErrorMsg('يرجى كتابة التشخيص الطبي للحالة');
      return;
    }

    const validMedicines = medicines.filter((m) => m.name.trim().length > 0);
    if (validMedicines.length === 0) {
      setErrorMsg('يرجى إضافة دواء واحد على الأقل مع تحديد اسمه وجرعته');
      return;
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newPrescription: EPrescription = {
      id: `rx_${Date.now()}`,
      prescriptionCode: `RX-${randomSuffix}`,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      doctorId: booking.providerId,
      doctorName: booking.providerName,
      doctorSpecialty: booking.providerSpecialtyOrType,
      doctorPhone: doctor?.phone1 || '',
      clinicAddress: booking.providerAddress,
      diagnosis: diagnosis.trim(),
      medicines: validMedicines,
      advice: advice.trim(),
      followUpDate: followUpDate || '',
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      await onSavePrescription(newPrescription);
      onClose();
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء حفظ الروشتة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-[#0f2a44] to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                إصدار روشتة إلكترونية للمريض
              </h3>
              <p className="text-xs text-teal-200/80">
                المريض: {booking.patientName} (#{booking.bookingCode})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Patient Details Snapshot */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">اسم المريض: </span>
              <span className="font-bold text-slate-800 dark:text-white">{booking.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">رقم الهاتف: </span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">{booking.patientPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">موعد الكشف: </span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{booking.appointmentDate}</span>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              التشخيص الطبي للحالة: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: التهاب حاد في الجيوب الأنفية، نزلة معوية، إلخ..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
            />
          </div>

          {/* Medicines List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>قائمة الأدوية الموصوفة (Rx):</span>
              </span>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دواء جديد</span>
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div 
                  key={med.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-teal-700 dark:text-teal-400 bg-teal-100/70 dark:bg-teal-900/60 px-2 py-0.5 rounded-md">
                      دواء #{index + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="حذف هذا الدواء"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="اسم الدواء والشكل (مثال: أوجمنتين ١ جم أقراص)"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="الجرعة (مثال: قرص كل ١٢ ساعة)"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(med.id, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="المدة (مثال: لمدة ٧ أيام، أو حتى انتهاء العبوة)"
                      value={med.duration || ''}
                      onChange={(e) => handleUpdateMedicine(med.id, 'duration', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="تعليمات إضافية (مثال: بعد الأكل، مع كوب ماء وفير)"
                      value={med.notes || ''}
                      onChange={(e) => handleUpdateMedicine(med.id, 'notes', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Advice & Instructions */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              تعليمات عامة وإرشادات طبية للمريض:
            </label>
            <textarea
              rows={2}
              placeholder="مثال: الراحة التامة في السرير، الإكثار من السوائل الدافئة، وتجنب الأطعمة الدسمة..."
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              موعد الاستشارة / المتابعة القادمة (اختياري):
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs sm:text-sm font-black shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري حفظ الروشتة...' : 'حفظ وإرسال الروشتة للمريض'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
