import JsonLd from '@/components/seo/JsonLd';
import CityClient from './CityClient';
import {
  buildPageMetadata,
  breadcrumbSchema,
  cityCollectionSchema,
  fetchCityBySlug,
  fetchLivePackages,
  getPackageSlug,
  absoluteUrl,
  localePath,
  truncate,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale, city: citySlug } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const city = await fetchCityBySlug(citySlug);

  if (!city) {
    return buildPageMetadata({
      locale: lang,
      title: lang === 'ar' ? 'المدينة غير موجودة' : 'City not found',
      description:
        lang === 'ar'
          ? 'لم يتم العثور على هذه المدينة على منصة theQapp.'
          : 'This city was not found on theQapp.',
      path: `/${citySlug}`,
      noIndex: true,
    });
  }

  const cityName = lang === 'ar' ? city.name_ar : city.name_en;
  const title =
    lang === 'ar'
      ? city.meta_title_ar || `حفلات أعياد الميلاد في ${cityName} | احجز الآن`
      : city.meta_title_en || `Birthday Parties in ${cityName} | Book Now`;
  const description =
    lang === 'ar'
      ? city.meta_desc_ar ||
        `اكتشف أفضل باقات حفلات أعياد الميلاد في ${cityName}. قارن الأماكن والأسعار واحجز بسهولة مع theQapp.`
      : city.meta_desc_en ||
        `Discover the best birthday party packages in ${cityName}. Compare venues and prices and book easily with theQapp.`;
  const image = Array.isArray(city.hero_images) ? city.hero_images[0] : undefined;

  return buildPageMetadata({
    locale: lang,
    title,
    description: truncate(description, 165),
    keywords:
      lang === 'ar'
        ? `حفلات أعياد ميلاد ${cityName}, باقات حفلات ${cityName}, أماكن حفلات أطفال ${cityName}, حجز حفلة عيد ميلاد, theQapp`
        : `birthday parties ${cityName}, kids party packages ${cityName}, birthday venues ${cityName}, book birthday party, theQapp`,
    path: `/${city.slug}`,
    image,
  });
}

export default async function CityPage({ params }) {
  const { locale, city: citySlug } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const city = await fetchCityBySlug(citySlug);
  const packages = city ? await fetchLivePackages(city.id) : [];

  const schemas = [];
  if (city) {
    const cityName = lang === 'ar' ? city.name_ar : city.name_en;
    schemas.push(
      breadcrumbSchema([
        { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: localePath(lang) },
        { name: cityName, path: localePath(lang, `/${city.slug}`) },
      ]),
      cityCollectionSchema({
        locale: lang,
        city,
        packageCount: packages.length,
      }),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name:
          lang === 'ar'
            ? `باقات حفلات أعياد الميلاد في ${cityName}`
            : `Birthday party packages in ${cityName}`,
        numberOfItems: packages.length,
        itemListElement: packages.slice(0, 50).map((pkg, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en,
          url: absoluteUrl(
            localePath(lang, `/${city.slug}/${getPackageSlug(pkg, lang)}`)
          ),
        })),
      }
    );
  }

  return (
    <>
      <JsonLd data={schemas} />
      {city && (
        <noscript>
          <section>
            <h1>
              {lang === 'ar'
                ? `حفلات أعياد الميلاد في ${city.name_ar}`
                : `Birthday Parties in ${city.name_en}`}
            </h1>
            <p>
              {lang === 'ar'
                ? city.meta_desc_ar ||
                  `احجز أفضل باقات حفلات أعياد الميلاد في ${city.name_ar} مع theQapp.`
                : city.meta_desc_en ||
                  `Book the best birthday party packages in ${city.name_en} with theQapp.`}
            </p>
            <ul>
              {packages.map((pkg) => (
                <li key={pkg.id}>
                  <a
                    href={localePath(
                      lang,
                      `/${city.slug}/${getPackageSlug(pkg, lang)}`
                    )}
                  >
                    {lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </noscript>
      )}
      <CityClient />
    </>
  );
}
