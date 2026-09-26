import JsonLd from '@/components/seo/JsonLd';
import PackageByIdClient from './PackageByIdClient';
import {
  buildPageMetadata,
  breadcrumbSchema,
  packageProductSchema,
  localBusinessSchema,
  fetchPackageById,
  getPackageSlug,
  localePath,
  truncate,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale, id } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const pkg = await fetchPackageById(id);

  if (!pkg) {
    return buildPageMetadata({
      locale: lang,
      title: lang === 'ar' ? 'الباقة غير موجودة' : 'Package not found',
      description:
        lang === 'ar'
          ? 'لم يتم العثور على باقة حفلات أعياد الميلاد المطلوبة.'
          : 'The requested birthday party package was not found.',
      path: `/package/${id}`,
      noIndex: true,
    });
  }

  const venueName = lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  const cityName = lang === 'ar' ? pkg.cities?.name_ar : pkg.cities?.name_en;
  const title =
    (lang === 'ar' ? pkg.seo_title_ar : pkg.seo_title_en) ||
    (lang === 'ar'
      ? `${venueName}${cityName ? ` في ${cityName}` : ''} | باقة حفلة عيد ميلاد`
      : `${venueName}${cityName ? ` in ${cityName}` : ''} | Birthday Party Package`);
  const description = truncate(
    (lang === 'ar' ? pkg.seo_description_ar : pkg.seo_description_en) ||
      (lang === 'ar' ? pkg.description_ar : pkg.description_en) ||
      (lang === 'ar'
        ? `احجز حفلة عيد ميلاد في ${venueName}${cityName ? ` بمدينة ${cityName}` : ''} مع theQapp.`
        : `Book a birthday party at ${venueName}${cityName ? ` in ${cityName}` : ''} with theQapp.`),
    165
  );
  const image = Array.isArray(pkg.images) ? pkg.images[0] : undefined;

  return buildPageMetadata({
    locale: lang,
    title,
    description,
    keywords: lang === 'ar' ? pkg.seo_keywords_ar : pkg.seo_keywords_en,
    path: `/package/${id}`,
    image,
  });
}

export default async function PackageByIdPage({ params }) {
  const { locale, id } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const pkg = await fetchPackageById(id);
  const city = pkg?.cities;
  const schemas = [];

  if (pkg) {
    const venueName = lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
    const cityName = lang === 'ar' ? city?.name_ar : city?.name_en;
    const crumbs = [
      { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: localePath(lang) },
    ];

    if (city?.slug) {
      crumbs.push({
        name: cityName,
        path: localePath(lang, `/${city.slug}`),
      });
      crumbs.push({
        name: venueName,
        path: localePath(lang, `/${city.slug}/${getPackageSlug(pkg, lang)}`),
      });
    } else {
      crumbs.push({
        name: venueName,
        path: localePath(lang, `/package/${id}`),
      });
    }

    schemas.push(
      breadcrumbSchema(crumbs),
      packageProductSchema({ locale: lang, pkg, city }),
      localBusinessSchema({ locale: lang, pkg, city })
    );
  }

  return (
    <>
      <JsonLd data={schemas} />
      <PackageByIdClient />
    </>
  );
}
