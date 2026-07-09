'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Search } from 'lucide-react';
// ❌ حذف: import Header from '@/components/ui/Header';
// ❌ حذف: import Footer from '@/components/ui/Footer';

export default function FAQPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
    document.documentElement.style.direction = dir;
  }, [locale]);

  const faqs = {
    ar: [
      { q: 'كيف يمكنني حجز حفلة عيد ميلاد؟', a: 'يمكنك حجز حفلة عيد ميلاد بسهولة من خلال تصفح الباقات المتاحة، اختيار الباقة المناسبة، ثم ملء نموذج الحجز. سنتواصل معك خلال دقائق لتأكيد الحجز.' },
      { q: 'ما هي طرق الدفع المتاحة؟', a: 'سيتم التواصل معك من قبل خدمة العملاء لتأكيد الحجز وتفاصيل الدفع. نوفر طرق دفع متعددة تشمل التحويل البنكي والدفع عند الاستلام.' },
      { q: 'هل يمكنني إلغاء الحجز؟', a: 'نعم، يمكنك إلغاء الحجز قبل 48 ساعة من موعد الحفلة. يرجى التواصل مع خدمة العملاء لمعرفة سياسة الإلغاء المطبقة على كل باقة.' },
      { q: 'كيف يمكنني إضافة مكاني إلى المنصة؟', a: 'يمكنك إضافة مكانك من خلال صفحة "أدرج باقاتك معنا" وملء النموذج. سنتواصل معك لتأهيل مكانك وإضافته إلى المنصة.' },
      { q: 'ما هي أوقات العمل لخدمة العملاء؟', a: 'خدمة العملاء متاحة من الساعة 8 صباحاً حتى 12 منتصف الليل، طوال أيام الأسبوع.' },
      { q: 'هل تقدمون خدمات في مدن أخرى؟', a: 'حالياً نقدم خدماتنا في الرياض، جدة، دبي، وأبوظبي. قريباً سنتوسع إلى مدن أخرى.' }
    ],
    en: [
      { q: 'How can I book a birthday party?', a: 'You can easily book a birthday party by browsing available packages, selecting the right package, and filling out the booking form. We will contact you within minutes to confirm your booking.' },
      { q: 'What payment methods are available?', a: 'Our customer service team will contact you to confirm the booking and payment details. We offer multiple payment methods including bank transfer and cash on delivery.' },
      { q: 'Can I cancel my booking?', a: 'Yes, you can cancel your booking up to 48 hours before the party date. Please contact customer service for the cancellation policy applicable to each package.' },
      { q: 'How can I add my venue to the platform?', a: 'You can add your venue through the "List Your Venue" page and fill out the form. We will contact you to qualify and add your venue to the platform.' },
      { q: 'What are customer service hours?', a: 'Customer service is available from 8 AM to 12 AM, 7 days a week.' },
      { q: 'Do you offer services in other cities?', a: 'Currently we offer services in Riyadh, Jeddah, Dubai, and Abu Dhabi. We will expand to other cities soon.' }
    ]
  };

  const t = {
    title: locale === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions',
    subtitle: locale === 'ar' ? 'إجابات على أكثر الأسئلة شيوعاً' : 'Answers to the most common questions',
    searchPlaceholder: locale === 'ar' ? 'ابحث عن سؤال...' : 'Search for a question...',
    noResults: locale === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results',
    contactSupport: locale === 'ar' ? 'لم تجد إجابتك؟ تواصل معنا' : 'Didn\'t find your answer? Contact us',
    contactButton: locale === 'ar' ? 'تواصل مع الدعم' : 'Contact Support'
  };

  const questions = faqs[locale] || faqs.ar;

  // تصفية الأسئلة حسب البحث
  const filteredQuestions = questions.filter((faq) =>
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    // ❌ حذف: <Header />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero - محسن */}
      <div className="relative bg-gradient-to-r from-primary to-blue-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <HelpCircle size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl opacity-90">{t.subtitle}</p>
        </div>
      </div>

      {/* Search Bar - جديد */}
      <div className="container mx-auto px-4 -mt-6 relative z-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-1 flex items-center">
            <div className="flex-1 flex items-center px-4">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-3 outline-none text-gray-700 bg-transparent"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FAQs - محسن */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">{t.noResults}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-right hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      openIndex === index ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className={`font-semibold text-lg transition ${
                      openIndex === index ? 'text-primary' : 'text-gray-800'
                    }`}>
                      {faq.q}
                    </span>
                  </div>
                  <ChevronDown
                    className={`transition-all duration-300 flex-shrink-0 ${
                      openIndex === index ? 'rotate-180 text-primary' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                    size={20}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'py-5 border-t border-gray-100' : 'max-h-0 py-0'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Support - محسن */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl border border-primary/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle size={28} className="text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">{t.contactSupport}</h3>
          <p className="text-gray-500 mb-4">
            {locale === 'ar' ? 'فريق الدعم لدينا جاهز لمساعدتك 24/7' : 'Our support team is ready to help you 24/7'}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition shadow-lg hover:shadow-xl"
          >
            {t.contactButton}
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
    // ❌ حذف: <Footer />
  );
}