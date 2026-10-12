import FAQClient from './FAQClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';

  const title = lang === 'ar' 
    ? 'الأسئلة الشائعة | theQapp' 
    : 'Frequently Asked Questions | theQapp';
    
  const description = lang === 'ar'
    ? 'إجابات على أكثر الأسئلة شيوعاً حول حجز حفلات أعياد الميلاد، طرق الدفع، سياسة الإلغاء، وأكثر.'
    : 'Answers to the most common questions about booking birthday parties, payment methods, cancellation policy, and more.';

  const url = lang === 'ar' 
    ? 'https://theqapp.com/ar/faq' 
    : 'https://theqapp.com/en/faq';

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'ar': 'https://theqapp.com/ar/faq',
        'en': 'https://theqapp.com/en/faq',
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'theQapp',
      locale: lang === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function FAQPage() {
  return <FAQClient />;
}