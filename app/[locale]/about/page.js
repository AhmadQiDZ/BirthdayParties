import AboutClient from './AboutClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';

  // يمكن جلب الـ SEO من قاعدة البيانات هنا
  // لكن نبقي القيم الافتراضية للسرعة
  const title = lang === 'ar' ? 'من نحن | theQapp' : 'About Us | theQapp';
  const description = lang === 'ar'
    ? 'تعرّف على theQapp، منصة حجز حفلات أعياد الميلاد الأولى في المنطقة.'
    : 'Learn about theQapp, the leading birthday party booking platform in the region.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';

  return <AboutClient />;
}