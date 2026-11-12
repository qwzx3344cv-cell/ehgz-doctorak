import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Smartphone, 
  User, 
  Stethoscope, 
  FlaskConical, 
  Shield, 
  Volume2, 
  Send,
  Clock,
  Check
} from 'lucide-react';
import { Doctor, Lab, NotificationItem, NotificationRole, PushSubscriptionProfile } from '../types';
import { 
  requestAndRegisterPushNotifications, 
  triggerDevicePushNotification, 
  createNotificationInFirestore,
  markNotificationAsRead,
  sendPushNotification
} from '../firebase';

interface NotificationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  labs: LabsList[];
  notifications: NotificationItem[];
  userRole?: NotificationRole;
}

type LabsList = Lab;

export const NotificationManagerModal: React.FC<NotificationManagerModalProps> = ({
  isOpen,
  onClose,
  doctors,
  labs,
  notifications,
}) => {
  const [selectedRole, setSelectedRole] = useState<NotificationRole>('patient');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

  // Load existing profile from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }

    try {
      const saved = localStorage.getItem('ehgz_push_profile');
      if (saved) {
        const parsed: PushSubscriptionProfile = JSON.parse(saved);
        if (parsed.role) setSelectedRole(parsed.role);
        if (parsed.targetId) setSelectedProviderId(parsed.targetId);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    let targetName = '';
    if (selectedRole === 'doctor' && selectedProviderId) {
      const docObj = doctors.find(d => d.id === selectedProviderId);
      targetName = docObj ? docObj.name : '';
    } else if (selectedRole === 'lab' && selectedProviderId) {
      const labObj = labs.find(l => l.id === selectedProviderId);
      targetName = labObj ? labObj.name : '';
    }

    const result = await requestAndRegisterPushNotifications({
      role: selectedRole,
      targetId: selectedProviderId,
      targetName,
      phone: phone.trim()
    });

    setIsLoading(false);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'تم تفعيل الإشعارات بنجاح! تم إرسال إشعار ترحيبي تجريبي لهاتفك.'
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'تعذر تفعيل الإشعارات، يرجى السماح بها من إعدادات المتصفح.'
      });
    }
  };

  const handleSendTestNotification = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    const testTitle = selectedRole === 'doctor' 
      ? '🔔 إشعار تجريبي: حجز جديد لعيادتك'
      : selectedRole === 'lab'
      ? '🔔 إشعار تجريبي: حجز تحليل جديد'
      : '✅ إشعار تجريبي: تم تأكيد موعدك بنجاح!';

    const testBody = selectedRole === 'doctor' || selectedRole === 'lab'
      ? 'هكذا سيصلك إشعار فوري باهتزاز وصوت فور قيام أي مريض بحجز موعد جديد لديك، حتى والتطبيق مغلق!'
      : 'هكذا سيصلك إشعار فوري باهتزاز وصوت فور قيام الطبيب أو المعمل بقبول وتأكيد موعدك!';

    // Trigger local push immediately
    await triggerDevicePushNotification(testTitle, testBody, { test: true });

    // Also persist in Firestore
    await createNotificationInFirestore({
      title: testTitle,
      body: testBody,
      recipientType: selectedRole,
      recipientId: selectedProviderId || undefined,
      recipientPhone: phone.trim() || undefined,
      type: 'test'
    });

    setIsLoading(false);
    setStatusMessage({
      type: 'success',
      text: 'تم إرسال الإشعار التجريبي! تفقد شريط إشعارات هاتفك الآن وستسمع نغمة التنبيه.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f2a44] via-slate-800 to-teal-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                نظام الإشعارات الفورية (Push)
              </h3>
              <p className="text-xs text-teal-200/80 font-medium">
                تنبيهات لحظية عبر Firebase Cloud Messaging
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'settings' 
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900' 
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>طلب وتفعيل الإشعارات</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors relative ${
              activeTab === 'history' 
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900' 
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>سجل الإشعارات المستلمة</span>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {activeTab === 'settings' ? (
            <>
              {/* Permission Status Box */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                permissionState === 'granted'
                  ? 'bg-teal-50/80 border-teal-200 text-teal-900'
                  : permissionState === 'denied'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {permissionState === 'granted' ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ) : permissionState === 'denied' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <p className="font-black text-sm">
                    {permissionState === 'granted' 
                      ? 'الإشعارات مفعلة على هذا الهاتف / المتصفح'
                      : permissionState === 'denied'
                      ? 'إذن الإشعارات محظور في متصفحك'
                      : 'الإشعارات غير مفعلة بعد على هذا الجهاز'}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {permissionState === 'granted'
                      ? 'ستتلقى الإشعارات فورياً مع الصوت والاهتزاز حتى عندما يكون المتصفح أو التطبيق في الخلفية.'
                      : permissionState === 'denied'
                      ? 'يرجى النقر على أيقونة القفل أو إعدادات الموقع أعلى المتصفح والسماح بالإشعارات (Allow Notifications).'
                      : 'اضغط على زر التفعيل بالأسفل ووافق على إذن المتصفح لربط هاتفك بالنظام فوراً.'}
                  </p>
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className={`p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Persona / Role Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  حدد صفتك لتخصيص الإشعارات المناسبة لك:
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {/* Patient */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('patient')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                      selectedRole === 'patient'
                        ? 'border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 shadow-xs ring-2 ring-teal-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80'
                    }`}
                  >
                    <User className={`w-5 h-5 ${selectedRole === 'patient' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-black">مريض</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">تأكيد المواعيد</span>
                  </button>

                  {/* Doctor */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('doctor')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                      selectedRole === 'doctor'
                        ? 'border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 shadow-xs ring-2 ring-teal-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80'
                    }`}
                  >
                    <Stethoscope className={`w-5 h-5 ${selectedRole === 'doctor' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-black">طبيب / عيادة</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">حجوزات المرضى</span>
                  </button>

                  {/* Lab */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('lab')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                      selectedRole === 'lab'
                        ? 'border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 shadow-xs ring-2 ring-teal-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80'
                    }`}
                  >
                    <FlaskConical className={`w-5 h-5 ${selectedRole === 'lab' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-black">معمل تحاليل</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">حجوزات التحاليل</span>
                  </button>

                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                      selectedRole === 'admin'
                        ? 'border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 shadow-xs ring-2 ring-teal-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80'
                    }`}
                  >
                    <Shield className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-black">إدارة</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">كل التنبيهات</span>
                  </button>
                </div>
              </div>

              {/* Conditional Linking fields */}
              {selectedRole === 'doctor' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    اختر عيادتك لربط الإشعارات بها:
                  </label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-teal-600"
                  >
                    <option value="">-- ربط بكافة عيادات هذا الهاتف أو اختر عيادة --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty} - {d.center || d.city || 'سوهاج'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedRole === 'lab' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    اختر معملك لربط الإشعارات به:
                  </label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-teal-600"
                  >
                    <option value="">-- ربط بكافة معامل هذا الهاتف أو اختر معمل --</option>
                    {labs.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.center || l.city || 'سوهاج'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Phone linking */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  رقم الهاتف (اختياري للربط المباشر بالحجوزات):
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-bold text-right bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-teal-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0d9488] hover:bg-teal-700 active:scale-98 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <BellRing className="w-5 h-5" />
                  <span>
                    {isLoading ? 'جاري تفعيل الإشعارات...' : 'تفعيل وتأكيد الإشعارات الفورية'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 active:scale-98 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>🚀 تجربة إشعار فوري واختبار صوت واهتزاز الهاتف الآن</span>
                </button>

                {/* Specific Button for sendPushNotification(title, bodyText) */}
                <button
                  type="button"
                  onClick={() => {
                    sendPushNotification(
                      '🔔 تجربة دالة إرسال الإشعارات الفورية (PWA)',
                      'تم إرسال هذا الإشعار الفوري بنجاح من داخل المتصفح عبر دالة sendPushNotification مع أيقونة التطبيق وشارة التنبيه!'
                    );
                    setStatusMessage({
                      type: 'success',
                      text: 'تم استدعاء دالة sendPushNotification(title, bodyText) بنجاح!'
                    });
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 active:scale-98 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <Bell className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  <span>⚡ تشغيل دالة sendPushNotification المباشرة</span>
                </button>
              </div>

              {/* PWA Notifications Function Code & Details */}
              <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-900 dark:text-teal-200 space-y-1.5">
                <div className="flex items-center justify-between font-black">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>دالة إرسال الإشعارات الفورية المدمجة (PWA Notifications):</span>
                  </span>
                  <span className="font-mono text-[10px] bg-teal-200/70 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-md font-bold" dir="ltr">
                    sendPushNotification()
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  تتحقق الدالة أولاً من دعم المتصفح لـ <code className="font-mono bg-white dark:bg-slate-900 px-1 rounded border border-teal-200 dark:border-teal-800">Notification</code>، وتطلب إذن المستخدم، ثم تطلق الإشعار مع أيقونة التطبيق <code className="font-mono bg-white dark:bg-slate-900 px-1 rounded border border-teal-200 dark:border-teal-800">/assets/icon.png</code> وشارة <code className="font-mono bg-white dark:bg-slate-900 px-1 rounded border border-teal-200 dark:border-teal-800">/assets/badge.png</code> مع الصوت والاهتزاز.
                </p>
                <div className="text-[10px] text-teal-700 dark:text-teal-300 pt-0.5">
                  💡 الدالة متاحة عالمياً على <code className="font-mono font-bold">window.sendPushNotification(title, body)</code> ويمكن تجربتها أيضاً من كونسول المتصفح (DevTools).
                </div>
              </div>

              {/* How it works info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>كيف تعمل الإشعارات الفورية مع هاتفك؟</span>
                </p>
                <p>
                  • <strong>للطبيب أو المعمل:</strong> عند حجز مريض، يهتز هاتفك ويصدر صوتاً فورياً حتى لو كان المتصفح مغلقاً.
                </p>
                <p>
                  • <strong>للمريض:</strong> عند قبول الطبيب للحجز وتأكيده من لوحة الإدارة، يصلك إشعار فوري بتأكيد الموعد وكود الحجز.
                </p>
              </div>
            </>
          ) : (
            /* Notifications History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                  آخر الإشعارات المستلمة ({notifications.length})
                </span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                  تحديث لحظي مباشر
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">لا توجد إشعارات سابقة حتى الآن</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">ستظهر هنا تفاصيل أي حجز جديد أو تأكيد موعد</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-2xl border transition-all text-xs space-y-1 cursor-pointer active:scale-98 ${
                        notif.isRead 
                          ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300' 
                          : 'bg-teal-50/70 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-100 font-bold shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {notif.type === 'new_booking' && <span className="p-1 rounded-lg bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 text-[10px]">حجز جديد</span>}
                          {notif.type === 'booking_confirmed' && <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-[10px]">تم التأكيد</span>}
                          {notif.type === 'booking_cancelled' && <span className="p-1 rounded-lg bg-red-100 dark:bg-red-900/80 text-red-800 dark:text-red-200 text-[10px]">إلغاء</span>}
                          {notif.type === 'test' && <span className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 text-[10px]">تجريبي</span>}
                          <h4 className="font-black text-slate-800 dark:text-slate-100">{notif.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{notif.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
