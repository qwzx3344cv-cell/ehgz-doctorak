import React, { useState } from 'react';
import { 
  Plus, 
  Stethoscope, 
  FlaskConical, 
  UserPlus, 
  ShieldCheck, 
  Menu, 
  X, 
  CalendarCheck,
  ChevronDown,
  Bell,
  BellRing,
  Sun,
  Moon,
  LogIn,
  KeyRound,
  FileText,
  Radio,
  Bot
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ProviderSession } from '../types';

interface HeaderProps {
  onOpenDoctorModal: () => void;
  onOpenLabModal: () => void;
  onOpenAdmin: () => void;
  onOpenMyBookings: () => void;
  onOpenMedicalRecords?: () => void;
  onOpenNotifications: () => void;
  onOpenLiveVoice?: () => void;
  onOpenChatbot?: () => void;
  bookingsCount: number;
  recordsCount?: number;
  unreadNotificationsCount: number;
  activeSection: string;
  onNavigateSection: (section: 'doctors' | 'labs') => void;
  isDark?: boolean;
  onToggleDarkMode?: () => void;
  providerSession?: ProviderSession | null;
  onOpenProviderLogin?: () => void;
  onOpenProviderPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDoctorModal,
  onOpenLabModal,
  onOpenAdmin,
  onOpenMyBookings,
  onOpenMedicalRecords,
  onOpenNotifications,
  onOpenLiveVoice,
  onOpenChatbot,
  bookingsCount,
  recordsCount = 0,
  unreadNotificationsCount,
  activeSection,
  onNavigateSection,
  isDark = false,
  onToggleDarkMode,
  providerSession,
  onOpenProviderLogin,
  onOpenProviderPortal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinDropdownOpen, setJoinDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand (Right side in RTL) */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              className="flex items-center gap-3 group focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {/* Logo Icon */}
              <div className="relative w-12 h-12 rounded-2xl bg-[#0d9488] flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="4" ry="4"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M8 14v2a2 2 0 0 0 4 0v-2"></path>
                </svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0f2a44] dark:bg-slate-950 text-[#5eead4] border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Text: Title + Subtitle */}
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0f2a44] dark:text-white">
                    احجز عند دكتورك
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-teal-700 dark:text-teal-400 font-semibold">صحتك أولاً . في كل خطوة</span>
                  <span className="text-slate-400 dark:text-slate-500 font-sans text-[11px] font-medium hidden sm:inline">
                    Ehgz 3nd Doctorak
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onNavigateSection('doctors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                activeSection === 'doctors'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0f2a44] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>الأطباء</span>
            </button>

            <button
              onClick={() => onNavigateSection('labs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                activeSection === 'labs'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0f2a44] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>المعامل</span>
            </button>

            {/* Join Providers Dropdown */}
            <div className="relative">
              <button
                onClick={() => setJoinDropdownOpen(!joinDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#0f2a44] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>انضم للمنظومة</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${joinDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {joinDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setJoinDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setJoinDropdownOpen(false);
                        onOpenDoctorModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100/70 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">تسجيل عيادة طبيب</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">أضف عيادتك واستقبل المرضى</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setJoinDropdownOpen(false);
                        onOpenLabModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-300 transition-colors mt-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100/70 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">تسجيل معمل تحاليل</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">أضف قائمتك وأسعار التحاليل</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Admin Shortcut */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#0f2a44] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>الإدارة</span>
            </button>
          </nav>

          {/* Left Action Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* Dark Mode Toggle Button with Micro-interactions */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`relative flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all duration-300 active:scale-95 border shadow-2xs group cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700 ring-1 ring-amber-400/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
                title={isDark ? 'التحويل للوضع النهاري (Light Mode)' : 'التحويل للوضع الليلي (Dark Mode)'}
                aria-label="تبديل الوضع الداكن والنهاري"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-xs font-bold text-amber-300 hidden lg:inline">نهاري</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-45 transition-transform duration-300" />
                    <span className="text-xs font-bold text-slate-700 hidden lg:inline">ليلي</span>
                  </>
                )}
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Gemini Live Voice Conversation Button */}
            {onOpenLiveVoice && (
              <button
                onClick={onOpenLiveVoice}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ring-1 ring-teal-400/30"
                title="المحادثة الصوتية المباشرة (Gemini Live)"
              >
                <Radio className="w-4 h-4 text-teal-200 animate-pulse" />
                <span>صوتي مباشر</span>
              </button>
            )}

            {/* Gemini AI Chatbot Button */}
            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ring-1 ring-blue-400/30"
                title="مساعد روبوت المحادثة الطبي الذكي (Gemini)"
              >
                <Bot className="w-4 h-4 text-blue-200" />
                <span>شات طبي</span>
              </button>
            )}

            {/* Push Notifications Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 text-teal-800 dark:text-teal-300 font-bold text-xs sm:text-sm transition-all border border-teal-200/60 dark:border-teal-800 active:scale-95"
              title="تفعيل الإشعارات الفورية (Push Notifications)"
            >
              <BellRing className={`w-4 h-4 text-teal-700 dark:text-teal-400 ${unreadNotificationsCount > 0 ? 'animate-bounce' : ''}`} />
              <span>الإشعارات</span>
              {unreadNotificationsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* My Bookings Button */}
            <button
              onClick={onOpenMyBookings}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all active:scale-95 border border-slate-200/40 dark:border-slate-700"
              title="عرض حجوزاتي السابقة"
            >
              <CalendarCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>حجوزاتي</span>
              {bookingsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                  {bookingsCount}
                </span>
              )}
            </button>

            {/* Medical Records & E-Prescriptions Button */}
            {onOpenMedicalRecords && (
              <button
                onClick={onOpenMedicalRecords}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50/90 hover:bg-teal-100 dark:bg-teal-950/70 dark:hover:bg-teal-900/80 text-teal-900 dark:text-teal-200 font-bold text-sm transition-all active:scale-95 border border-teal-200/80 dark:border-teal-800 shadow-2xs"
                title="السجل الطبي والروشتات الإلكترونية والفحوصات السابقة"
              >
                <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>سجلي الطبي</span>
                {recordsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                    {recordsCount}
                  </span>
                )}
              </button>
            )}

            {/* Doctor / Lab Account Portal or Login Button */}
            {providerSession ? (
              <button
                onClick={onOpenProviderPortal}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
                title={`لوحة حساب: ${providerSession.name}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <span>
                  {providerSession.providerType === 'doctor' ? `🩺 عيادتي (${providerSession.name.split(' ')[0]})` : `🧪 المعمل (${providerSession.name.split(' ')[0]})`}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenProviderLogin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-700 font-bold text-xs sm:text-sm transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
                title="تسجيل ودخول الأطباء والمعامل برقم الهاتف ورمز OTP"
              >
                <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>دخول الأطباء والمعامل</span>
              </button>
            )}

            {/* Direct Add Clinic Button */}
            <button
              onClick={onOpenDoctorModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f2a44] hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 text-teal-400 dark:text-teal-100" />
              <span>أضف عيادتك</span>
            </button>
          </div>

          {/* Mobile Menu & Quick Notification Buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Dark Mode Mobile Button */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200/60 dark:border-slate-700"
                aria-label="تبديل الوضع الداكن"
                title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
            )}

            {/* Notifications icon */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800"
              aria-label="الإشعارات"
              title="تفعيل الإشعارات الفورية"
            >
              <Bell className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Bookings icon */}
            <button
              onClick={onOpenMyBookings}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="حجوزاتي"
            >
              <CalendarCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {bookingsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {bookingsCount}
                </span>
              )}
            </button>

            {/* Menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0f2a44] dark:text-white transition-colors focus:outline-none"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onNavigateSection('doctors');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-colors ${
                activeSection === 'doctors' 
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>الأطباء</span>
            </button>

            <button
              onClick={() => {
                onNavigateSection('labs');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-colors ${
                activeSection === 'labs' 
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>المعامل</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {/* Mobile Dark Mode Toggle Item */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                  <span>{isDark ? 'التحويل للوضع النهاري (Light)' : 'التحويل للوضع الليلي (Dark)'}</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-amber-300 font-bold">
                  {isDark ? 'الوضع الليلي 🌙' : 'الوضع النهاري ☀️'}
                </span>
              </button>
            )}

            {/* Mobile PWA Install Banner */}
            <PWAInstallButton variant="banner" />

            {/* Mobile Gemini Live Voice Button */}
            {onOpenLiveVoice && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLiveVoice();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 text-white font-extrabold text-sm shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-teal-200 animate-pulse" />
                  <span>المحادثة الصوتية المباشرة (Gemini Live)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  صوتي
                </span>
              </button>
            )}

            {/* Mobile Gemini AI Chatbot Button */}
            {onOpenChatbot && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChatbot();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold text-sm shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-200" />
                  <span>المساعد الطبي الذكي (Gemini)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  شات
                </span>
              </button>
            )}

            {/* Mobile Notification Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenNotifications();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold text-sm border border-teal-200/80 dark:border-teal-800"
            >
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>تفعيل وتجربة الإشعارات الفورية (Push)</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                FCM
              </span>
            </button>

            {/* Mobile Medical Records Button */}
            {onOpenMedicalRecords && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMedicalRecords();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold text-sm border border-teal-200/80 dark:border-teal-800"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>السجل الطبي والروشتات الإلكترونية</span>
                </div>
                {recordsCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                    {recordsCount}
                  </span>
                )}
              </button>
            )}

            {/* Provider Login / Portal in Mobile Menu */}
            {providerSession ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProviderPortal && onOpenProviderPortal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                  <span>
                    لوحة حساب {providerSession.providerType === 'doctor' ? 'العيادة' : 'المعمل'} ({providerSession.name})
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-800 text-white font-bold">
                  فتح اللوحة
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProviderLogin && onOpenProviderLogin();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-900 dark:text-teal-200 font-bold text-sm border border-teal-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>دخول الأطباء والمعامل (الهاتف ورمز OTP)</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                  دخول
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDoctorModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>أضف عيادتك كطبيب</span>
              </div>
              <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLabModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>أضف معملك للتحاليل</span>
              </div>
              <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>لوحة تحكم الإدارة</span>
              </div>
              <span className="text-xs text-slate-400">دخول المشرف</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
