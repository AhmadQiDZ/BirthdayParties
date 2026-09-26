import {
  SITE_URL,
  LOCALES,
  absoluteUrl,
  localePath,
  getPackageSlug,
  fetchVisibleCities,
  fetchLivePackages,
} from '@/lib/seo';

const STATIC_PATHS = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/add-package', changeFrequency: 'monthly', priority: 0.6 },
];

function withAlternates(path) {
  return {
    languages: {
      ar: absoluteUrl(localePath('ar', path)),
      en: absoluteUrl(localePath('en', path)),
      'x-default': absoluteUrl(localePath('ar', path)),
    },
  };
}

export default async function sitemap() {
  const now = new Date();
  const entries = [];

  entries.push({
    url: SITE_URL,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1,
  });

  for (const locale of LOCALES) {
    for (const item of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(localePath(locale, item.path)),
        lastModified: now,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: withAlternates(item.path),
      });
    }
  }

  const cities = await fetchVisibleCities();
  for (const city of cities) {
    if (!city?.slug) continue;
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/${city.slug}`)),
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
        alternates: withAlternates(`/${city.slug}`),
        images: Array.isArray(city.hero_images)
          ? city.hero_images.slice(0, 3)
          : undefined,
      });
    }
  }

  const packages = await fetchLivePackages();
  for (const pkg of packages) {
    const citySlug = pkg.cities?.slug;
    if (!citySlug) continue;

    for (const locale of LOCALES) {
      const packageSlug = getPackageSlug(pkg, locale);
      if (!packageSlug) continue;
      const path = `/${citySlug}/${packageSlug}`;
      entries.push({
        url: absoluteUrl(localePath(locale, path)),
        lastModified: pkg.updated_at ? new Date(pkg.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: {
            ar: absoluteUrl(
              localePath('ar', `/${citySlug}/${getPackageSlug(pkg, 'ar')}`)
            ),
            en: absoluteUrl(
              localePath('en', `/${citySlug}/${getPackageSlug(pkg, 'en')}`)
            ),
            'x-default': absoluteUrl(
              localePath('ar', `/${citySlug}/${getPackageSlug(pkg, 'ar')}`)
            ),
          },
        },
        images: Array.isArray(pkg.images) ? pkg.images.slice(0, 5) : undefined,
      });
    }
  }

  return entries;
}
