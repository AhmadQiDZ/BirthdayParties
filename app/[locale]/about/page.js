'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
// ❌ حذف: import Header from '@/components/ui/Header';
// ❌ حذف: import Footer from '@/components/ui/Footer';
import { Heart, Users, Sparkles, Globe, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // تحديث اتجاه الصفحة
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
    document.documentElement.style.direction = dir;
  }, [locale]);

  const content = {
    ar: {
      title: 'من نحن',
      story1: 'كل قصة عظيمة تبدأ بسؤال، وكان سؤالنا بسيطًا: كيف يمكننا أن نجعل الحياة العائلية أسهل، وأكثر معنى، ومليئة باللحظات التي لا تُنسى؟',
      story2: 'بدأت رحلتنا باسم QiDZ، كشريك موثوق يساعد الآباء والأمهات على اكتشاف أفضل الأنشطة والتجارب لأطفالهم. ومع مرور الوقت، لم تتطور المنصة فحسب، بل تطورت العائلات أيضًا، ولذلك تطورنا معها. واليوم، تستمر هذه الرؤية بروح أكثر إشراقًا وطموحًا واتساعًا تحت اسم theQapp.',
      story3: 'لأن العائلات لا تبقى على حالها؛ فهي تنمو وتتغير وتخوض تجارب جديدة باستمرار. ولهذا صُمم theQapp ليكون المكان الذي يجمع كل مراحل الحياة العائلية في تطبيق واحد، من لقاءات اللعب وحفلات الأطفال، إلى الأنشطة بعد المدرسة، ورحلات نهاية الأسبوع، واكتشاف الأماكن الجديدة، وحتى التخطيط للسفر وصناعة أجمل الذكريات. أينما تأخذكم الحياة، نحن هنا لنجعل التخطيط أسهل، والاستمتاع بكل لحظة أبسط.',
      story4: 'انطلقت قصتنا مع QiDZ برؤية واضحة: تسهيل وصول العائلات إلى أفضل الأنشطة والتجارب للأطفال. ومع مرور السنوات، أصبحت المنصة أكثر من مجرد وسيلة للبحث عن الأنشطة؛ بل أصبحت رفيقًا موثوقًا للعائلات في مختلف أنحاء دول الخليج.',
      story5: 'ويجسد انتقالنا إلى theQapp هذه الرحلة، مع تطلعنا إلى المستقبل. فحرف Q يرمز إلى Quality (الجودة)، وQuick Access (سهولة وسرعة الوصول)، وإلى الأسئلة اليومية التي يطرحها الآباء والأمهات عند التخطيط لحياة أسرهم. كما أنه يحمل إشارة وفاء لجذورنا، ويؤكد أن رسالتنا الأساسية لم تتغير، مهما تطورت هويتنا.',
      story6: 'في theQapp، لا نقتصر على جمع الأنشطة والتجارب، بل نرافق العائلة في رحلتها بأكملها. تطبيق واحد. مجتمع واحد. ورسالة واحدة: أن نجعل الحياة أسهل، والذكريات أجمل وأغنى.',
      story7: 'إنها ليست مجرد هوية جديدة، بل فصل جديد في قصة نكتبها معًا. ويسعدنا أن تكونوا جزءًا من هذه الرحلة.',
      story8: 'نتطلع لانضمامكم إلينا، وصناعة المزيد من اللحظات الجميلة مع theQapp!',
      closing: 'theQapp — تطبيق واحد، مجتمع واحد، وتجارب لا تُنسى لكل أفراد العائلة',
      values: 'قيمنا',
      quality: 'الجودة',
      qualityDesc: 'نختار أفضل الأماكن والتجارب',
      community: 'المجتمع',
      communityDesc: 'نبني مجتمعاً من العائلات',
      care: 'الاهتمام',
      careDesc: 'نضع العائلة في قلب كل قرار',
      easy: 'الوصول السهل',
      easyDesc: 'نجعل التخطيط بسيطاً وسريعاً'
    },
    en: {
      title: 'About Us',
      story1: 'Every great story starts with a question, and ours was simple: How can we make family life easier, more meaningful, and full of unforgettable experiences?',
      story2: 'What began as QiDZ, a trusted companion helping parents discover fun things to do with their children, soon grew into something much more. As families evolved, so did we. Today, that same spark lives on: brighter, bolder, and broader, as theQapp.',
      story3: 'Because families don\'t stand still. They grow, change, and explore new possibilities. And we\'ve grown with them. theQapp is where every chapter of family life comes together — from playdates to parties, after-school adventures to weekend getaways, local discoveries to travel dreams. Wherever life takes your family, we\'re here to make it simpler to plan, and easier to enjoy.',
      story4: 'It all started when we launched as QiDZ, with a clear vision: to make it easier for parents to find great activities and experiences for their children. Over time, our platform became more than a tool; it became a trusted friend to families across the GCC.',
      story5: 'Our rebrand to theQapp honors that journey while embracing the future. The "Q" stands for quality experiences, quick access, and the questions parents ask every day when shaping family life. It\'s also a subtle nod to our roots; a promise that while we have evolved, our heart remains the same.',
      story6: 'With theQapp, we are not just curating activities; we are championing the entire family journey. One app. One community. One mission: to make life simpler, and memories richer.',
      story7: 'This isn\'t just a new name; it\'s a new chapter in a story we\'re writing together. And we\'re so happy you\'re part of it.',
      story8: 'Looking forward to you joining the fun with us!',
      closing: 'theQapp — One app, one community, and unforgettable experiences for every family member',
      values: 'Our Values',
      quality: 'Quality',
      qualityDesc: 'We choose the best venues and experiences',
      community: 'Community',
      communityDesc: 'We build a community of families',
      care: 'Care',
      careDesc: 'We put family at the heart of every decision',
      easy: 'Easy Access',
      easyDesc: 'We make planning simple and fast'
    }
  };

  const t = content[locale] || content.ar;

  const values = [
    { icon: <Heart className="w-8 h-8" />, title: t.care, desc: t.careDesc },
    { icon: <Sparkles className="w-8 h-8" />, title: t.quality, desc: t.qualityDesc },
    { icon: <Users className="w-8 h-8" />, title: t.community, desc: t.communityDesc },
    { icon: <Globe className="w-8 h-8" />, title: t.easy, desc: t.easyDesc }
  ];

  // تحديد موقع الصورة حسب اللغة
  const isRTL = locale === 'ar';
  const imagePosition = isRTL ? 'order-first' : 'order-last';

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
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{t.title}</h1>
          <div className="w-24 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Story Section with Image */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* الصورة والنص - ترتيب حسب اللغة */}
          <div className={`flex flex-col ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
            {/* الصورة */}
            <div className={`w-full md:w-2/5 ${imagePosition}`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/images/about.png"
                  alt="theQapp - Family Fun"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
            
            {/* النص */}
            <div className="w-full md:w-3/5 space-y-4">
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed font-medium text-primary">{t.story1}</p>
                <p className="text-base leading-relaxed">{t.story2}</p>
                <p className="text-base leading-relaxed">{t.story3}</p>
                <p className="text-base leading-relaxed">{t.story4}</p>
                <p className="text-base leading-relaxed">{t.story5}</p>
                <p className="text-base leading-relaxed">{t.story6}</p>
                <p className="text-base leading-relaxed">{t.story7}</p>
                <p className="text-lg leading-relaxed font-semibold text-primary">{t.story8}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">{t.values}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">{value.title}</h3>
                <p className="text-gray-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closing */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 border border-primary/10">
            <p className="text-2xl font-bold text-primary mb-4">{t.closing}</p>
            <div className="w-16 h-1 bg-primary/30 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
    // ❌ حذف: <Footer />
  );
}