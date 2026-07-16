import JsonLd from '@/components/seo/JsonLd';
import HomeClient from './HomeClient';
import {
  pageCopy,
  buildPageMetadata,
  breadcrumbSchema,
  fetchVisibleCities,
  absoluteUrl,
  localePath,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const copy = pageCopy.home[lang];

  return buildPageMetadata({
    locale: lang,
    title: { absolute: copy.title },
    description: copy.description,
    keywords: copy.keywords,
    path: '',
  });
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const cities = await fetchVisibleCities();

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name:
      lang === 'ar'
        ? 'مدن حفلات أعياد الميلاد على theQapp'
        : 'Birthday party cities on theQapp',
    numberOfItems: cities.length,
    itemListElement: cities.map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: lang === 'ar' ? city.name_ar : city.name_en,
      url: absoluteUrl(localePath(lang, `/${city.slug}`)),
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            {
              name: lang === 'ar' ? 'الرئيسية' : 'Home',
              path: localePath(lang),
            },
          ]),
          itemList,
        ]}
      />
      <noscript>
        <section>
          <h1>{pageCopy.home[lang].title}</h1>
          <p>{pageCopy.home[lang].description}</p>
          <ul>
            {cities.map((city) => (
              <li key={city.id}>
                <a href={localePath(lang, `/${city.slug}`)}>
                  {lang === 'ar'
                    ? `حفلات أعياد الميلاد في ${city.name_ar}`
                    : `Birthday parties in ${city.name_en}`}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </noscript>
      <HomeClient />
    </>
  );
}
