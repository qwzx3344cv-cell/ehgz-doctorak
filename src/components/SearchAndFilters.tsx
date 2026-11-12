import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  Filter, 
  MapPin, 
  ChevronDown, 
  RotateCcw, 
  Star, 
  DollarSign, 
  Clock, 
  Zap, 
  SlidersHorizontal, 
  Check, 
  Building2, 
  Stethoscope, 
  FlaskConical,
  ChevronUp
} from 'lucide-react';
import { EGYPT_GOVERNORATES, getCentersForGovernorate } from '../data/egyptLocations';
import { SPECIALTIES } from '../constants';
import { getTodayArabicName } from '../utils/filterHelpers';

export type SortOption = 'recommended' | 'highest_rated' | 'lowest_price' | 'highest_price' | 'available_today';
export type PriceFilter = 'all' | 'under_200' | '200_to_350' | 'above_350';
export type ProviderTypeView = 'all' | 'doctors' | 'labs';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  selectedCenter: string;
  onCenterChange: (center: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceFilter: PriceFilter;
  onPriceFilterChange: (price: PriceFilter) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  onlyAvailableToday: boolean;
  onOnlyAvailableTodayToggle: () => void;
  providerTypeView: ProviderTypeView;
  onProviderTypeViewChange: (view: ProviderTypeView) => void;
  doctorsCount: number;
  labsCount: number;
  onResetAllFilters: () => void;
  onSearchSubmit: () => void;
}

export const QUICK_FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'أطفال', label: 'طب الأطفال' },
  { id: 'باطنة', label: 'باطنة وجهاز هضمي' },
  { id: 'أسنان', label: 'أسنان' },
  { id: 'قلب', label: 'قلب وأوعية' },
  { id: 'عظام', label: 'عظام ومفاصل' },
  { id: 'نساء', label: 'نساء وتوليد' },
  { id: 'جلدية', label: 'جلدية' },
  { id: 'عيون', label: 'عيون ورمد' },
  { id: 'تحاليل طبية', label: '🔬 معامل تحاليل' }
];

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedGovernorate,
  onGovernorateChange,
  selectedCenter,
  onCenterChange,
  sortBy,
  onSortChange,
  priceFilter,
  onPriceFilterChange,
  minRating,
  onMinRatingChange,
  onlyAvailableToday,
  onOnlyAvailableTodayToggle,
  providerTypeView,
  onProviderTypeViewChange,
  doctorsCount,
  labsCount,
  onResetAllFilters,
  onSearchSubmit
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const todayArabicName = getTodayArabicName();

  // Available centers based on selected governorate
  const availableCenters = selectedGovernorate ? getCentersForGovernorate(selectedGovernorate) : [];

  const handleGovernorateSelect = (govName: string) => {
    onGovernorateChange(govName);
    onCenterChange(''); // Reset center when governorate changes
  };

  // Determine if any non-default filter is currently active
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    activeFilter !== 'all' ||
    selectedGovernorate ||
    selectedCenter ||
    sortBy !== 'recommended' ||
    priceFilter !== 'all' ||
    minRating > 0 ||
    onlyAvailableToday ||
    providerTypeView !== 'all'
  );

  return (
    <section className="w-full pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Headings */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-100 dark:border-teal-800/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>نظام بحث وفلترة ذكي وسريع</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0f2a44] dark:text-white tracking-tight">
            دكتورك ومعملك، في مكان واحد.
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            ابحث بالاسم، التخصص، المحافظة والمركز، رتّب حسب التقييم أو السعر الأقل، وتأكد من التوفر اليوم فوراً.
          </p>
        </div>

        {/* Search Bar & Location Controls Container */}
        <div className="max-w-4xl mx-auto space-y-3.5">
          
          {/* Main Search Input & Submit */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
            className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-lg shadow-slate-200/60 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-800 focus-within:border-teal-500 dark:focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-950 transition-all duration-200"
          >
            <div className="p-2 text-slate-400 dark:text-slate-500">
              <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث باسم الطبيب، التخصص، اسم المعمل، التحليل، أو الشارع..."
              className="w-full py-2.5 px-2 bg-transparent text-[#0f2a44] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base focus:outline-none"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ml-1"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 sm:py-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
            >
              <span>ابحث الآن</span>
            </button>
          </form>

          {/* Quick Filters Toolbar: Sort buttons, Today toggle, Advanced Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
            
            {/* Sort by Dropdown / Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>الترتيب:</span>
              </span>

              <button
                type="button"
                onClick={() => onSortChange('recommended')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  sortBy === 'recommended'
                    ? 'bg-[#0f2a44] dark:bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                الافتراضي
              </button>

              <button
                type="button"
                onClick={() => onSortChange('highest_rated')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  sortBy === 'highest_rated'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>التقييم الأعلى</span>
              </button>

              <button
                type="button"
                onClick={() => onSortChange('lowest_price')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  sortBy === 'lowest_price'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>الأقل سعراً</span>
              </button>

              {/* Available Today Pill with micro-interaction */}
              <button
                type="button"
                onClick={onOnlyAvailableTodayToggle}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                  onlyAvailableToday || sortBy === 'available_today'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300 dark:ring-blue-700'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60'
                }`}
                title={`تصفية العيادات والمعامل المفتوحة والمتاحة اليوم (${todayArabicName})`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>متوفر اليوم ({todayArabicName})</span>
                {(onlyAvailableToday || sortBy === 'available_today') && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
            </div>

            {/* Toggle Advanced Filters Button */}
            <div className="flex items-center gap-2 mr-auto">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  showAdvancedFilters
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>فلاتر متقدمة</span>
                {showAdvancedFilters ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetAllFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors active:scale-95"
                  title="إلغاء جميع الفلاتر والبحث"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>

          </div>

          {/* Location Selector: Governorate & Center Dropdowns */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              
              {/* Location Label */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 px-1">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>تحديد المنطقة:</span>
              </div>

              {/* Governorate Dropdown */}
              <div className="relative flex-1">
                <select
                  value={selectedGovernorate}
                  onChange={(e) => handleGovernorateSelect(e.target.value)}
                  className="w-full appearance-none py-2 px-3 pl-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors cursor-pointer"
                >
                  <option value="">كل المحافظات (جمهورية مصر العربية)</option>
                  <optgroup label="المحافظة المميزة">
                    <option value="سوهاج">⭐ محافظة سوهاج (مراكزها كاملة)</option>
                  </optgroup>
                  <optgroup label="باقي محافظات مصر">
                    {EGYPT_GOVERNORATES.filter((g) => g.id !== 'sohag').map((gov) => (
                      <option key={gov.id} value={gov.name}>
                        محافظة {gov.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Center / City Dropdown */}
              <div className="relative flex-1">
                <select
                  value={selectedCenter}
                  onChange={(e) => onCenterChange(e.target.value)}
                  disabled={!selectedGovernorate}
                  className={`w-full appearance-none py-2 px-3 pl-8 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    !selectedGovernorate 
                      ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed border-dashed' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                  }`}
                >
                  <option value="">
                    {selectedGovernorate 
                      ? `كل مراكز ومدن ${selectedGovernorate}` 
                      : 'اختر المحافظة أولاً لتحديد المركز بدقة'}
                  </option>
                  {availableCenters.map((centerName) => (
                    <option key={centerName} value={centerName}>
                      {centerName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset Location Filter Button */}
              {(selectedGovernorate || selectedCenter) && (
                <button
                  type="button"
                  onClick={() => {
                    onGovernorateChange('');
                    onCenterChange('');
                  }}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold transition-colors shrink-0"
                  title="إلغاء فلتر الموقع"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إلغاء الموقع</span>
                </button>
              )}

            </div>

            {/* Quick shortcuts for Sohag centers */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">مراكز سوهاج السريعة:</span>
              <button
                type="button"
                onClick={() => {
                  onGovernorateChange('سوهاج');
                  onCenterChange('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  selectedGovernorate === 'سوهاج' && !selectedCenter
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/60 dark:border-teal-800/60'
                }`}
              >
                📍 كل سوهاج
              </button>

              {['طهطا', 'أخميم', 'جرجا', 'المراغة', 'طما', 'سوهاج (المركز والمدينة)', 'البلينا'].map((c) => {
                const isSelected = selectedGovernorate === 'سوهاج' && selectedCenter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onGovernorateChange('سوهاج');
                      onCenterChange(c);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#0f2a44] dark:bg-teal-600 text-white font-bold shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          {showAdvancedFilters && (
            <div className="bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-md rounded-2xl p-4 border border-teal-200/70 dark:border-slate-750 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Category view */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>نوع الخدمة:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => onProviderTypeViewChange('all')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        providerTypeView === 'all'
                          ? 'bg-[#0d9488] text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => onProviderTypeViewChange('doctors')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        providerTypeView === 'doctors'
                          ? 'bg-[#0d9488] text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Stethoscope className="w-3 h-3" />
                      <span>أطباء</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onProviderTypeViewChange('labs')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        providerTypeView === 'labs'
                          ? 'bg-[#0d9488] text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FlaskConical className="w-3 h-3" />
                      <span>معامل</span>
                    </button>
                  </div>
                </div>

                {/* 2. Price Bracket */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>نطاق السعر:</span>
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => onPriceFilterChange(e.target.value as PriceFilter)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold focus:border-teal-500 cursor-pointer"
                  >
                    <option value="all">كل الأسعار (أي قيمة كشف أو تحليل)</option>
                    <option value="under_200">🟢 اقتصادي (أقل من 200 جنيه)</option>
                    <option value="200_to_350">🟡 متوسط (من 200 إلى 350 جنيه)</option>
                    <option value="above_350">🔵 استشاري (أكثر من 350 جنيه)</option>
                  </select>
                </div>

                {/* 3. Minimum Star Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>الحد الأدنى للتقييم:</span>
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => onMinRatingChange(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold focus:border-teal-500 cursor-pointer"
                  >
                    <option value={0}>كل التقييمات</option>
                    <option value={4.0}>⭐ 4.0 نجوم فأعلى</option>
                    <option value={4.5}>⭐⭐ 4.5 نجوم فأعلى (المميزون)</option>
                  </select>
                </div>

              </div>

              {/* All Specialties Full Dropdown */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
                  قائمة التخصصات الكاملة:
                </span>
                <div className="relative flex-1">
                  <select
                    value={activeFilter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="w-full appearance-none py-1.5 px-3 pl-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:border-teal-500 cursor-pointer"
                  >
                    <option value="all">جميع التخصصات الطبية</option>
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>
          )}

          {/* Quick Filters: Specialty Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start pt-1">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">
              <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>التخصص:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_FILTERS.map((pill) => {
                const isActive = activeFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => onFilterChange(pill.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#0f2a44] dark:bg-teal-600 text-white shadow-xs scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-750'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filters Summary Pills & Live Results Counter */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            {/* Live Count Badge */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                النتائج الحالية:{' '}
                <strong className="text-teal-700 dark:text-teal-400">{doctorsCount} عيادة طبيب</strong>
                {' و '}
                <strong className="text-teal-700 dark:text-teal-400">{labsCount} معمل تحاليل</strong>
              </span>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">الفلاتر النشطة:</span>

                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
                    <span>البحث: "{searchTerm}"</span>
                    <button onClick={() => onSearchChange('')} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
                    <span>التخصص: {activeFilter}</span>
                    <button onClick={() => onFilterChange('all')} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedGovernorate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                    <span>{selectedGovernorate} {selectedCenter ? `• ${selectedCenter}` : ''}</span>
                    <button 
                      onClick={() => {
                        onGovernorateChange('');
                        onCenterChange('');
                      }} 
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {sortBy !== 'recommended' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    <span>
                      {sortBy === 'highest_rated' ? '⭐ الأعلى تقييماً' : sortBy === 'lowest_price' ? '💵 الأقل سعراً' : sortBy === 'highest_price' ? 'الأعلى سعراً' : '⚡ متاح اليوم'}
                    </span>
                    <button onClick={() => onSortChange('recommended')} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(onlyAvailableToday || sortBy === 'available_today') && sortBy !== 'available_today' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                    <span>⚡ متاح اليوم</span>
                    <button onClick={onOnlyAvailableTodayToggle} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <span>
                      {priceFilter === 'under_200' ? '< 200 ج' : priceFilter === '200_to_350' ? '200 - 350 ج' : '> 350 ج'}
                    </span>
                    <button onClick={() => onPriceFilterChange('all')} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    <span>⭐ {minRating}+ نجوم</span>
                    <button onClick={() => onMinRatingChange(0)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {providerTypeView !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                    <span>{providerTypeView === 'doctors' ? 'الأطباء فقط' : 'المعامل فقط'}</span>
                    <button onClick={() => onProviderTypeViewChange('all')} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={onResetAllFilters}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline font-bold mr-1"
                >
                  مسح الكل
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
