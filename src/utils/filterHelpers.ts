import { Review } from '../types';

/**
 * Checks if a doctor or lab is open and available on the current day.
 */
export function isProviderAvailableToday(workingHours?: string): boolean {
  if (!workingHours || !workingHours.trim()) return true;
  const text = workingHours.trim();

  // Arabic days of the week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const arabicDays = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت'
  ];
  const dayIndex = new Date().getDay();
  const todayName = arabicDays[dayIndex];

  // Check for explicit exclusion: e.g. "عدا الجمعة", "ماعدا الجمعة", "إلا الجمعة"
  const exclusionWords = ['عدا', 'ماعدا', 'ما عدا', 'إلا', 'باستثناء'];
  const hasExclusion = exclusionWords.some((word) => text.includes(word));

  if (hasExclusion) {
    // If today is explicitly the excluded day
    if (text.includes(todayName)) {
      return false;
    }
    // If it's daily except another day, and today is not that day
    if (text.includes('يومياً') || text.includes('يوميا') || text.includes('طوال الأسبوع')) {
      return true;
    }
  }

  // Daily availability
  if (
    text.includes('يومياً') ||
    text.includes('يوميا') ||
    text.includes('طوال الأسبوع') ||
    text.includes('طوال الاسبوع') ||
    text.includes('كل يوم') ||
    text.includes('24 ساعة') ||
    text.includes('على مدار الساعة')
  ) {
    return true;
  }

  // Check if today's day name is explicitly listed
  if (text.includes(todayName)) {
    return true;
  }

  // If specific other days are listed and today is NOT one of them
  const mentionedDays = arabicDays.filter((d) => text.includes(d));
  if (mentionedDays.length > 0) {
    return mentionedDays.includes(todayName);
  }

  // Default true if only hours like "من 5 إلى 9" are specified
  return true;
}

/**
 * Returns the Arabic name of today
 */
export function getTodayArabicName(): string {
  const arabicDays = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت'
  ];
  return arabicDays[new Date().getDay()];
}

/**
 * Calculates provider average rating from reviews with fallback to base rating or 5.0
 */
export function getProviderAverageRating(
  providerId: string,
  baseRating?: number,
  reviews: Review[] = []
): number {
  const providerReviews = reviews.filter((r) => r.providerId === providerId);
  if (providerReviews.length > 0) {
    const sum = providerReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / providerReviews.length).toFixed(1));
  }
  return baseRating ? Number(baseRating.toFixed(1)) : 5.0;
}

/**
 * Match doctor specialty flexibly (handles partial match and full match)
 */
export function matchesSpecialty(doctorSpecialty: string, selectedFilter: string): boolean {
  if (!selectedFilter || selectedFilter === 'all') return true;
  if (selectedFilter === 'تحاليل طبية') return false; // Handled in labs

  const docSpec = doctorSpecialty.toLowerCase();
  const filter = selectedFilter.toLowerCase();

  if (docSpec === filter) return true;
  if (docSpec.includes(filter) || filter.includes(docSpec)) return true;

  // Keyword associations
  if (filter === 'أطفال' && docSpec.includes('أطفال')) return true;
  if (filter === 'باطنة' && docSpec.includes('باطنة')) return true;
  if (filter === 'أسنان' && docSpec.includes('أسنان')) return true;
  if (filter === 'قلب' && (docSpec.includes('قلب') || docSpec.includes('أوعية'))) return true;
  if (filter === 'عظام' && (docSpec.includes('عظام') || docSpec.includes('مفاصل'))) return true;
  if (filter === 'نساء' && (docSpec.includes('نساء') || docSpec.includes('توليد'))) return true;
  if (filter === 'جلدية' && (docSpec.includes('جلدية') || docSpec.includes('تناسلية'))) return true;
  if (filter === 'مخ وأعصاب' && (docSpec.includes('مخ') || docSpec.includes('أعصاب'))) return true;
  if (filter === 'عيون' && (docSpec.includes('عيون') || docSpec.includes('رمد'))) return true;
  if (filter === 'أنف وأذن' && (docSpec.includes('أنف') || docSpec.includes('أذن') || docSpec.includes('حنجرة'))) return true;
  if (filter === 'جراحة' && docSpec.includes('جراحة')) return true;

  return false;
}
