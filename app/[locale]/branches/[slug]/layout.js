import JsonLd from '@/components/seo/JsonLd';
import {
  buildPageMetadata,
  breadcrumbSchema,
  fetchPackageById,
  localePath,
  truncate,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const pkg = await fetchPackageById(slug);

  if (!pkg) {
    return buildPageMetadata({
      locale: lang,
      title: lang === 'ar' ? 'الفروع' : 'Branches',
      description:
        lang === 'ar'
          ? 'اختر فرع باقة حفلة عيد الميلاد المناسب لك على theQapp.'
          : 'Choose the right birthday party package branch on theQapp.',
      path: `/branches/${slug}`,
    });
  }

  const venueName = lang === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  const cityName = lang === 'ar' ? pkg.cities?.name_ar : pkg.cities?.name_en;

  return buildPageMetadata({
    locale: lang,
    title:
      lang === 'ar'
        ? `فروع ${venueName}${cityName ? ` في ${cityName}` : ''}`
        : `${venueName} Branches${cityName ? ` in ${cityName}` : ''}`,
    description: truncate(
      lang === 'ar'
        ? `اختر أقرب فرع لـ ${venueName} واحجز باقة حفلة عيد ميلاد بسهولة مع theQapp.`
        : `Choose the nearest ${venueName} branch and book a birthday party package easily with theQapp.`,
      165
    ),
    path: `/branches/${slug}`,
    image: Array.isArray(pkg.images) ? pkg.images[0] : undefined,
  });
}

export default async function BranchesLayout({ children, params }) {
  const { locale, slug } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const pkg = await fetchPackageById(slug);
  const venueName = pkg
    ? lang === 'ar'
      ? pkg.venue_name_ar
      : pkg.venue_name_en
    : lang === 'ar'
      ? 'الفروع'
      : 'Branches';

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: localePath(lang) },
          {
            name: venueName,
            path: localePath(lang, `/branches/${slug}`),
          },
        ])}
      />
      {children}
    </>
  );
}
