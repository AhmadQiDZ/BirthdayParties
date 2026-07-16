import { supabase } from '@/lib/supabase';

export const SITE_URL = 'https://theqapp.com';
export const SITE_NAME = 'theQapp';
export const LOCALES = ['ar', 'en'];
export const DEFAULT_LOCALE = 'ar';

export const DEFAULT_OG_IMAGE =
  'https://theqapp.com/_next/image?url=%2Fimages%2Fq_app_logo_1.png&w=1200&q=75';

export function createSlug(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getPackageSlug(pkg, locale = 'ar') {
  if (!pkg) return '';
  const name = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  return pkg.slug_ar && locale === 'ar'
    ? pkg.slug_ar
    : pkg.slug_en && locale === 'en'
      ? pkg.slug_en
      : createSlug(name);
}

export function absoluteUrl(path = '') {
  if (!path) return SITE_URL;
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function localePath(locale, path = '') {
  const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `/${locale}${clean}`;
}

export function buildLanguageAlternates(path = '') {
  const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return {
    'ar': absoluteUrl(`/ar${clean}`),
    'en': absoluteUrl(`/en${clean}`),
    'x-default': absoluteUrl(`/ar${clean}`),
  };
}

export function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text = '', max = 160) {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export const pageCopy = {
  home: {
    ar: {
      title: 'حجز حفلات أعياد الميلاد في السعودية والإمارات | theQapp',
      description:
        'احجز أفضل حفلات أعياد الميلاد للأطفال في الرياض وجدة ودبي وأبوظبي. باقات جاهزة، أماكن ترفيهية موثوقة، وأكثر من 1,000,000 حجز ناجح مع theQapp.',
      keywords:
        'حفلات أعياد ميلاد, حجز حفلة عيد ميلاد, باقات حفلات أطفال, أماكن حفلات الرياض, حفلات أطفال جدة, حفلات أعياد ميلاد دبي, أبوظبي, السعودية, الإمارات, theQapp',
    },
    en: {
      title: 'Book Birthday Parties in Saudi Arabia & UAE | theQapp',
      description:
        'Book the best kids birthday party packages in Riyadh, Jeddah, Dubai and Abu Dhabi. Ready-made packages, trusted venues, and over 1,000,000 successful bookings with theQapp.',
      keywords:
        'birthday party booking, kids birthday parties, birthday party packages, Riyadh birthday parties, Jeddah kids parties, Dubai birthday party venues, Abu Dhabi, Saudi Arabia, UAE, theQapp',
    },
  },
  about: {
    ar: {
      title: 'من نحن',
      description:
        'تعرف على قصة theQapp، المنصة الرائدة لحجز حفلات أعياد الميلاد والأنشطة العائلية في السعودية والإمارات، وكيف نساعد العائلات على صناعة ذكريات لا تُنسى.',
    },
    en: {
      title: 'About Us',
      description:
        'Learn about theQapp, the leading platform for booking birthday parties and family activities in Saudi Arabia and the UAE, helping families create unforgettable memories.',
    },
  },
  faq: {
    ar: {
      title: 'الأسئلة الشائعة حول حجز حفلات أعياد الميلاد',
      description:
        'إجابات واضحة عن حجز حفلات أعياد الميلاد، الدفع، الإلغاء، وإضافة مكانك على منصة theQapp في السعودية والإمارات.',
    },
    en: {
      title: 'Birthday Party Booking FAQ',
      description:
        'Clear answers about booking birthday parties, payments, cancellations, and listing your venue on theQapp in Saudi Arabia and the UAE.',
    },
  },
  contact: {
    ar: {
      title: 'تواصل معنا',
      description:
        'تواصل مع فريق theQapp في السعودية والإمارات عبر واتساب أو الهاتف أو البريد الإلكتروني للمساعدة في حجز حفلة عيد الميلاد.',
    },
    en: {
      title: 'Contact Us',
      description:
        'Contact theQapp support in Saudi Arabia and the UAE via WhatsApp, phone, or email for help booking a birthday party.',
    },
  },
  addPackage: {
    ar: {
      title: 'أدرج باقات حفلات أعياد الميلاد معنا',
      description:
        'انضم إلى theQapp كشريك وأدرج باقات حفلات أعياد الميلاد الخاصة بك للوصول إلى آلاف العائلات في السعودية والإمارات.',
    },
    en: {
      title: 'List Your Birthday Party Packages',
      description:
        'Partner with theQapp and list your birthday party packages to reach thousands of families across Saudi Arabia and the UAE.',
    },
  },
};

export function buildPageMetadata({
  locale = 'ar',
  title,
  description,
  path = '',
  keywords,
  image,
  type = 'website',
  noIndex = false,
}) {
  const url = absoluteUrl(localePath(locale, path));
  const ogLocale = locale === 'ar' ? 'ar_SA' : 'en_US';
  const alternateLocale = locale === 'ar' ? 'en_US' : 'ar_SA';
  const ogImage = image || DEFAULT_OG_IMAGE;
  const plainTitle =
    typeof title === 'object' && title?.absolute ? title.absolute : title;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title: plainTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: ogLocale,
      alternateLocale: [alternateLocale],
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: plainTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: plainTitle,
      description,
      images: [ogImage],
      site: '@theqapp',
      creator: '@theqapp',
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description:
      'theQapp is the leading birthday party booking platform in Saudi Arabia and the UAE.',
    foundingDate: '2018',
    sameAs: [
      'https://www.instagram.com/theqapp_ksa/',
      'https://www.tiktok.com/@theqapp_ksa',
      'https://web.facebook.com/Qidzuae',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+966-55-255-2880',
        contactType: 'customer service',
        areaServed: ['SA', 'AE'],
        availableLanguage: ['Arabic', 'English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+971-52-772-9226',
        contactType: 'customer service',
        areaServed: 'AE',
        availableLanguage: ['Arabic', 'English'],
      },
    ],
  };
}

export function websiteSchema(locale = 'ar') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale === 'ar' ? 'ar-SA' : 'en-AE',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/${locale}/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(faqs = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

export function cityCollectionSchema({ locale, city, packageCount = 0 }) {
  const cityName = locale === 'ar' ? city.name_ar : city.name_en;
  const path = localePath(locale, `/${city.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name:
      locale === 'ar'
        ? `حفلات أعياد الميلاد في ${cityName}`
        : `Birthday Parties in ${cityName}`,
    description:
      locale === 'ar'
        ? `اكتشف واحجز أفضل باقات حفلات أعياد الميلاد في ${cityName} مع theQapp.`
        : `Discover and book the best birthday party packages in ${cityName} with theQapp.`,
    url: absoluteUrl(path),
    inLanguage: locale === 'ar' ? 'ar-SA' : 'en-AE',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: {
      '@type': 'City',
      name: cityName,
    },
    numberOfItems: packageCount,
  };
}

export function packageProductSchema({ locale, pkg, city }) {
  const venueName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  const description = truncate(
    locale === 'ar' ? pkg.description_ar : pkg.description_en,
    300
  );
  const cityName = locale === 'ar' ? city?.name_ar : city?.name_en;
  const packageSlug = getPackageSlug(pkg, locale);
  const citySlug = city?.slug || pkg.cities?.slug;
  const url = absoluteUrl(localePath(locale, `/${citySlug}/${packageSlug}`));
  const tiers = pkg.package_tiers || [];
  const prices = tiers.map((t) => Number(t.price)).filter((p) => p > 0);
  const lowPrice = prices.length ? Math.min(...prices) : undefined;
  const highPrice = prices.length ? Math.max(...prices) : undefined;
  const images = Array.isArray(pkg.images) ? pkg.images.filter(Boolean) : [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: venueName,
    description,
    image: images,
    sku: String(pkg.id),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: locale === 'ar' ? 'حفلات أعياد الميلاد' : 'Birthday Parties',
    url,
  };

  if (lowPrice != null) {
    schema.offers = {
      '@type': 'AggregateOffer',
      url,
      priceCurrency: pkg.currency || 'SAR',
      lowPrice: String(lowPrice),
      highPrice: String(highPrice ?? lowPrice),
      offerCount: String(tiers.length || 1),
      availability: 'https://schema.org/InStock',
    };
  }

  if (pkg.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(pkg.rating),
      reviewCount: String(pkg.reviews_count || 1),
      bestRating: '5',
      worstRating: '1',
    };
  }

  if (cityName) {
    schema.areaServed = {
      '@type': 'City',
      name: cityName,
    };
  }

  return schema;
}

export function localBusinessSchema({ locale, pkg, city }) {
  const venueName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  const description = truncate(
    locale === 'ar' ? pkg.description_ar : pkg.description_en,
    300
  );
  const cityName = locale === 'ar' ? city?.name_ar : city?.name_en;
  const packageSlug = getPackageSlug(pkg, locale);
  const citySlug = city?.slug || pkg.cities?.slug;
  const countryCode =
    city?.countries?.code ||
    pkg.cities?.countries?.code ||
    (pkg.currency === 'AED' ? 'AE' : 'SA');
  const streetAddress = locale === 'ar' ? pkg.address_ar : pkg.address_en;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: venueName,
    description,
    image: Array.isArray(pkg.images) ? pkg.images : [],
    url: absoluteUrl(localePath(locale, `/${citySlug}/${packageSlug}`)),
    address: {
      '@type': 'PostalAddress',
      streetAddress: streetAddress || undefined,
      addressLocality: cityName || '',
      addressCountry: countryCode,
    },
  };
}

export async function fetchVisibleCities() {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name_ar, name_en, slug, meta_title_ar, meta_title_en, meta_desc_ar, meta_desc_en, hero_images, countries(code, name_ar, name_en, flag_emoji)')
    .eq('is_visible', true)
    .order('name_ar');

  if (error) {
    console.error('SEO fetchVisibleCities error:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchCityBySlug(citySlug) {
  if (!citySlug) return null;
  const { data, error } = await supabase
    .from('cities')
    .select('*, countries(*)')
    .eq('slug', citySlug)
    .eq('is_visible', true)
    .maybeSingle();

  if (error) {
    console.error('SEO fetchCityBySlug error:', error.message);
    return null;
  }
  return data;
}

export async function fetchLivePackages(cityId) {
  let query = supabase
    .from('packages')
    .select(
      `
      id,
      venue_name_ar,
      venue_name_en,
      description_ar,
      description_en,
      images,
      currency,
      rating,
      reviews_count,
      city_id,
      updated_at,
      seo_title_ar,
      seo_title_en,
      seo_description_ar,
      seo_description_en,
      seo_keywords_ar,
      seo_keywords_en,
      address_ar,
      address_en,
      faq_ar,
      faq_en,
      has_multiple_branches,
      cities (id, name_ar, name_en, slug, countries(code)),
      package_tiers (id, price, price_before_discount)
    `
    )
    .eq('status', 'live')
    .is('deleted_at', null);

  if (cityId) {
    query = query.eq('city_id', cityId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('SEO fetchLivePackages error:', error.message);
    return [];
  }
  return data || [];
}

export function findPackageBySlug(packages, packageSlug, locale = 'ar') {
  if (!packages?.length || !packageSlug) return null;

  const normalizedSlug = decodeURIComponent(packageSlug);
  const slugField = locale === 'ar' ? 'slug_ar' : 'slug_en';

  return (
    packages.find((pkg) => {
      if (pkg[slugField] === normalizedSlug) return true;
      const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
      if (createSlug(pkgName) === normalizedSlug) return true;
      if (pkg.slug_ar && normalizedSlug.includes(pkg.slug_ar)) return true;
      if (pkg.slug_en && normalizedSlug.includes(pkg.slug_en)) return true;
      return false;
    }) || null
  );
}

export async function fetchPackageById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('packages')
    .select(
      `
      *,
      cities (*, countries(*)),
      package_tiers (*)
    `
    )
    .eq('id', id)
    .eq('status', 'live')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('SEO fetchPackageById error:', error.message);
    return null;
  }
  return data;
}

export function packageFaqsToSchema(pkg, locale = 'ar') {
  const raw = locale === 'ar' ? pkg?.faq_ar : pkg?.faq_en;
  if (!raw) return null;

  let faqs = raw;
  if (typeof raw === 'string') {
    try {
      faqs = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  const normalized = faqs
    .map((item) => ({
      q: item.q || item.question || item.title || '',
      a: item.a || item.answer || item.content || '',
    }))
    .filter((item) => item.q && item.a);

  if (!normalized.length) return null;
  return faqSchema(normalized);
}
