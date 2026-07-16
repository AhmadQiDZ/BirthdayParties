import JsonLd from '@/components/seo/JsonLd';
import {
  pageCopy,
  buildPageMetadata,
  breadcrumbSchema,
  localePath,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const copy = pageCopy.addPackage[lang];

  return buildPageMetadata({
    locale: lang,
    title: copy.title,
    description: copy.description,
    path: '/add-package',
  });
}

export default async function AddPackageLayout({ children, params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: localePath(lang) },
          {
            name: pageCopy.addPackage[lang].title,
            path: localePath(lang, '/add-package'),
          },
        ])}
      />
      {children}
    </>
  );
}
