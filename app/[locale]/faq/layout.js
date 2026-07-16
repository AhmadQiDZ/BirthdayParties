import JsonLd from '@/components/seo/JsonLd';
import {
  pageCopy,
  buildPageMetadata,
  breadcrumbSchema,
  faqSchema,
  localePath,
} from '@/lib/seo';

const FAQ_CONTENT = {
  ar: [
    {
      q: 'كيف يمكنني حجز حفلة عيد ميلاد؟',
      a: 'يمكنك حجز حفلة عيد ميلاد بسهولة من خلال تصفح الباقات المتاحة، اختيار الباقة المناسبة، ثم ملء نموذج الحجز. سنتواصل معك خلال دقائق لتأكيد الحجز.',
    },
    {
      q: 'ما هي طرق الدفع المتاحة؟',
      a: 'سيتم التواصل معك من قبل خدمة العملاء لتأكيد الحجز وتفاصيل الدفع. نوفر طرق دفع متعددة تشمل التحويل البنكي والدفع عند الاستلام.',
    },
    {
      q: 'هل يمكنني إلغاء الحجز؟',
      a: 'نعم، يمكنك إلغاء الحجز قبل 48 ساعة من موعد الحفلة. يرجى التواصل مع خدمة العملاء لمعرفة سياسة الإلغاء المطبقة على كل باقة.',
    },
    {
      q: 'كيف يمكنني إضافة مكاني إلى المنصة؟',
      a: 'يمكنك إضافة مكانك من خلال صفحة "أدرج باقاتك معنا" وملء النموذج. سنتواصل معك لتأهيل مكانك وإضافته إلى المنصة.',
    },
    {
      q: 'ما هي أوقات العمل لخدمة العملاء؟',
      a: 'خدمة العملاء متاحة من الساعة 8 صباحاً حتى 12 منتصف الليل، طوال أيام الأسبوع.',
    },
    {
      q: 'هل تقدمون خدمات في مدن أخرى؟',
      a: 'حالياً نقدم خدماتنا في الرياض، جدة، دبي، وأبوظبي. قريباً سنتوسع إلى مدن أخرى.',
    },
  ],
  en: [
    {
      q: 'How can I book a birthday party?',
      a: 'You can easily book a birthday party by browsing available packages, selecting the right package, and filling out the booking form. We will contact you within minutes to confirm your booking.',
    },
    {
      q: 'What payment methods are available?',
      a: 'Our customer service team will contact you to confirm the booking and payment details. We offer multiple payment methods including bank transfer and cash on delivery.',
    },
    {
      q: 'Can I cancel my booking?',
      a: 'Yes, you can cancel your booking up to 48 hours before the party date. Please contact customer service for the cancellation policy applicable to each package.',
    },
    {
      q: 'How can I add my venue to the platform?',
      a: 'You can add your venue through the "List Your Venue" page and fill out the form. We will contact you to qualify and add your venue to the platform.',
    },
    {
      q: 'What are customer service hours?',
      a: 'Customer service is available from 8 AM to 12 AM, 7 days a week.',
    },
    {
      q: 'Do you offer services in other cities?',
      a: 'Currently we offer services in Riyadh, Jeddah, Dubai, and Abu Dhabi. We will expand to other cities soon.',
    },
  ],
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';
  const copy = pageCopy.faq[lang];

  return buildPageMetadata({
    locale: lang,
    title: copy.title,
    description: copy.description,
    path: '/faq',
  });
}

export default async function FaqLayout({ children, params }) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ar';

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: localePath(lang) },
            {
              name: pageCopy.faq[lang].title,
              path: localePath(lang, '/faq'),
            },
          ]),
          faqSchema(FAQ_CONTENT[lang]),
        ]}
      />
      {children}
    </>
  );
}
