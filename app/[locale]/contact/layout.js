import JsonLd from '@/components/seo/JsonLd';
import {
  pageCopy,
  buildPageMetadata,
  breadcrumbSchema,
  localePath,
  SITE_URL,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const copy = pageCopy.contact[lang];

  return buildPageMetadata({
    locale: lang,
    title: copy.title,
    description: copy.description,
    path: '/contact',
  });
}

export default async function ContactLayout({ children, params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: pageCopy.contact[lang].title,
    url: `${SITE_URL}${localePath(lang, '/contact')}`,
    mainEntity: {
      '@type': 'Organization',
      name: 'theQapp',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+966-55-255-2880',
          contactType: 'customer service',
          areaServed: 'SA',
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
      email: 'info@theqapp.com',
    },
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: localePath(lang) },
            {
              name: pageCopy.contact[lang].title,
              path: localePath(lang, '/contact'),
            },
          ]),
          contactSchema,
        ]}
      />
      {children}
    </>
  );
}
