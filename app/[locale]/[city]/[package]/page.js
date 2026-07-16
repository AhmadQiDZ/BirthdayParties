import JsonLd from '@/components/seo/JsonLd';
import PackageClient from './PackageClient';
import {
  buildPageMetadata,
  breadcrumbSchema,
  packageProductSchema,
  localBusinessSchema,
  packageFaqsToSchema,
  fetchCityBySlug,
  fetchLivePackages,
  findPackageBySlug,
  getPackageSlug,
  localePath,
  truncate,
  stripHtml,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale, city: citySlug, package: packageSlugParam } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const city = await fetchCityBySlug(citySlug);
  const packages = city ? await fetchLivePackages(city.id) : await fetchLivePackages();
  const pkg = findPackageBySlug(packages, packageSlugParam, lang);

  if (!pkg || !city) {
    return buildPageMetadata({
      locale: lang,
      title: lang === 'ar' ? 'الباقة غير موجودة' : 'Package not found',
      description:
        lang === 'ar'
          ? 'لم يتم العثور على باقة حفلات أعياد الميلاد المطلوبة.'
          : 'The requested birthday party package was not found.',
      path: `/${citySlug}/${packageSlugParam}`,
      noIndex: true,
    });
  }

  const venueName = lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  const cityName = lang === 'ar' ? city.name_ar : city.name_en;
  const title =
    (lang === 'ar' ? pkg.seo_title_ar : pkg.seo_title_en) ||
    (lang === 'ar'
      ? `${venueName} في ${cityName} | باقة حفلة عيد ميلاد`
      : `${venueName} in ${cityName} | Birthday Party Package`);
  const description = truncate(
    (lang === 'ar' ? pkg.seo_description_ar : pkg.seo_description_en) ||
      (lang === 'ar' ? pkg.description_ar : pkg.description_en) ||
      (lang === 'ar'
        ? `احجز حفلة عيد ميلاد في ${venueName} بمدينة ${cityName} مع theQapp.`
        : `Book a birthday party at ${venueName} in ${cityName} with theQapp.`),
    165
  );
  const packageSlug = getPackageSlug(pkg, lang);
  const image = Array.isArray(pkg.images) ? pkg.images[0] : undefined;
  const keywords =
    (lang === 'ar' ? pkg.seo_keywords_ar : pkg.seo_keywords_en) ||
    (lang === 'ar'
      ? `${venueName}, حفلات أعياد ميلاد ${cityName}, باقات حفلات أطفال, حجز حفلة عيد ميلاد, theQapp`
      : `${venueName}, birthday parties ${cityName}, kids party packages, book birthday party, theQapp`);

  return buildPageMetadata({
    locale: lang,
    title,
    description,
    keywords,
    path: `/${city.slug}/${packageSlug}`,
    image,
  });
}

export default async function PackagePage({ params }) {
  const { locale, city: citySlug, package: packageSlugParam } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const city = await fetchCityBySlug(citySlug);
  const packages = city ? await fetchLivePackages(city.id) : [];
  const pkg = findPackageBySlug(packages, packageSlugParam, lang);

  const schemas = [];
  if (city && pkg) {
    const venueName = lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
    const cityName = lang === 'ar' ? city.name_ar : city.name_en;
    const packageSlug = getPackageSlug(pkg, lang);

    schemas.push(
      breadcrumbSchema([
        { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: localePath(lang) },
        { name: cityName, path: localePath(lang, `/${city.slug}`) },
        {
          name: venueName,
          path: localePath(lang, `/${city.slug}/${packageSlug}`),
        },
      ]),
      packageProductSchema({ locale: lang, pkg, city }),
      localBusinessSchema({ locale: lang, pkg, city }),
      packageFaqsToSchema(pkg, lang)
    );
  }

  return (
    <>
      <JsonLd data={schemas} />
      {city && pkg && (
        <noscript>
          <article>
            <h1>
              {lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en}
            </h1>
            <p>
              {stripHtml(
                lang === 'ar' ? pkg.description_ar : pkg.description_en
              )}
            </p>
            <p>
              <a href={localePath(lang, `/${city.slug}`)}>
                {lang === 'ar'
                  ? `حفلات أعياد الميلاد في ${city.name_ar}`
                  : `Birthday parties in ${city.name_en}`}
              </a>
            </p>
          </article>
        </noscript>
      )}
      <PackageClient />
    </>
  );
}
