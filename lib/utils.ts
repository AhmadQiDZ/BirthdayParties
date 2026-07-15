// lib/utils.ts
export function createSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function compareSlugs(slug1: string, slug2: string): boolean {
  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[أآإ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[ؤ]/g, 'و')
      .replace(/[ئ]/g, 'ي');
  };
  return normalizeArabic(slug1) === normalizeArabic(slug2);
}

export function getCurrencySymbol(currency: string, locale: string = 'ar'): string {
  const currencies: Record<string, { ar: string; en: string }> = {
    'SAR': { ar: 'ر.س', en: 'SAR' },
    'AED': { ar: 'د.إ', en: 'AED' },
    'BHD': { ar: 'د.ب', en: 'BHD' },
    'QAR': { ar: 'ر.ق', en: 'QAR' },
    'EUR': { ar: '€', en: 'EUR' },
    'GBP': { ar: '£', en: 'GBP' }
  };
  const lang = locale === 'ar' ? 'ar' : 'en';
  return currencies[currency]?.[lang] || (locale === 'ar' ? 'ر.س' : 'SAR');
}

export function formatDate(date: string, locale: string = 'ar'): string {
  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function cleanDescription(html: string, maxLength: number = 160): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').slice(0, maxLength);
}