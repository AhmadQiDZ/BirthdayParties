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

const WORKING_HOURS_DAY_ORDER = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const WORKING_HOURS_DAY_LABELS: Record<'ar' | 'en', Record<string, string>> = {
  ar: {
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
  },
  en: {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  },
};

function formatDayHours(value: unknown, locale: 'ar' | 'en'): string {
  if (value === null || value === undefined || value === '') {
    return locale === 'ar' ? 'مغلق' : 'Closed';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (record.closed === true || record.isClosed === true) {
      return locale === 'ar' ? 'مغلق' : 'Closed';
    }

    const open = record.open ?? record.from ?? record.start;
    const close = record.close ?? record.to ?? record.end;

    if (open && close) {
      return `${open} - ${close}`;
    }

    const textValues = Object.values(record).filter(
      (entry) => typeof entry === 'string' || typeof entry === 'number'
    );

    if (textValues.length > 0) {
      return textValues.join(' - ');
    }
  }

  return String(value);
}

export function parseWorkingHours(workingHours: unknown): Record<string, unknown> | string | null {
  if (!workingHours) return null;

  if (typeof workingHours === 'string') {
    const trimmed = workingHours.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (typeof workingHours === 'object' && !Array.isArray(workingHours)) {
    return workingHours as Record<string, unknown>;
  }

  return String(workingHours);
}

export function formatWorkingHours(
  workingHours: unknown,
  locale: string = 'ar',
  compact: boolean = false
): string {
  const parsed = parseWorkingHours(workingHours);
  if (!parsed) return '';

  if (typeof parsed === 'string' || typeof parsed === 'number') {
    return String(parsed);
  }

  const lang: 'ar' | 'en' = locale === 'en' ? 'en' : 'ar';
  const labels = WORKING_HOURS_DAY_LABELS[lang];
  const record = parsed as Record<string, unknown>;

  const formattedDays = WORKING_HOURS_DAY_ORDER.filter(
    (day) => record[day] !== undefined && record[day] !== null && record[day] !== ''
  ).map((day) => {
    const hours = formatDayHours(record[day], lang);
    return `${labels[day] || day}: ${hours}`;
  });

  if (formattedDays.length === 0) {
    return Object.entries(record)
      .map(([day, hours]) => `${labels[day.toLowerCase()] || day}: ${formatDayHours(hours, lang)}`)
      .join(compact ? ' · ' : '\n');
  }

  if (compact && formattedDays.length > 0) {
    const uniqueHours = [...new Set(formattedDays.map((line) => line.split(': ').slice(1).join(': ')))];
    if (uniqueHours.length === 1) {
      return uniqueHours[0];
    }
  }

  return formattedDays.join(compact ? ' · ' : '\n');
}

export function getReviewComment(
  review: Record<string, unknown> | null | undefined,
  locale: string = 'ar'
): string {
  if (!review) return '';

  const comment =
    review.comment ??
    (locale === 'ar'
      ? review.comment_ar ?? review.comment_en
      : review.comment_en ?? review.comment_ar);

  return typeof comment === 'string' ? comment.trim() : '';
}

export function getVisibleTiers(
  tiers: Array<{ branch_id?: number | null; id?: number }> = [],
  selectedBranch: { id?: number } | null = null,
  branchCount: number = 0
) {
  if (!tiers.length) return [];

  if (selectedBranch?.id) {
    return tiers.filter(
      (tier) => !tier.branch_id || tier.branch_id === selectedBranch.id
    );
  }

  if (branchCount <= 1) {
    return tiers;
  }

  return tiers;
}

export function parseBranchRecord<T extends { working_hours?: unknown }>(branch: T): T {
  return {
    ...branch,
    working_hours: parseWorkingHours(branch.working_hours),
  };
}