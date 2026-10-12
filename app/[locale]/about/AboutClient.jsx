'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Heart, Users, Sparkles, Globe, ChevronLeft, ChevronRight,
  Pause, Play, X, ZoomIn
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AboutClient() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // ============================================
  // النصوص الافتراضية — مقسمة إلى:
  // intro (فقرة افتتاحية بارزة)
  // story (فقرات القصة)
  // closing (فقرة ختامية بارزة)
  // ============================================
  const defaultContent = {
    ar: {
      title: 'من نحن',
      // ✅ الفقرة الافتتاحية (Bold)
      intro: 'كل قصة عظيمة تبدأ بسؤال، وكان سؤالنا بسيطًا: كيف يمكننا أن نجعل الحياة العائلية أسهل، وأكثر معنى، ومليئة باللحظات التي لا تُنسى؟',
      // ✅ فقرات القصة (عادية)
      story: [
        'بدأت رحلتنا باسم QiDZ، كشريك موثوق يساعد الآباء والأمهات على اكتشاف أفضل الأنشطة والتجارب لأطفالهم. ومع مرور الوقت، لم تتطور المنصة فحسب، بل تطورت العائلات أيضًا، ولذلك تطورنا معها. واليوم، تستمر هذه الرؤية بروح أكثر إشراقًا وطموحًا واتساعًا تحت اسم theQapp.',
        'لأن العائلات لا تبقى على حالها؛ فهي تنمو وتتغير وتخوض تجارب جديدة باستمرار. ولهذا صُمم theQapp ليكون المكان الذي يجمع كل مراحل الحياة العائلية في تطبيق واحد، من لقاءات اللعب وحفلات الأطفال، إلى الأنشطة بعد المدرسة، ورحلات نهاية الأسبوع، واكتشاف الأماكن الجديدة، وحتى التخطيط للسفر وصناعة أجمل الذكريات. أينما تأخذكم الحياة، نحن هنا لنجعل التخطيط أسهل، والاستمتاع بكل لحظة أبسط.',
        'انطلقت قصتنا مع QiDZ برؤية واضحة: تسهيل وصول العائلات إلى أفضل الأنشطة والتجارب للأطفال. ومع مرور السنوات، أصبحت المنصة أكثر من مجرد وسيلة للبحث عن الأنشطة؛ بل أصبحت رفيقًا موثوقًا للعائلات في مختلف أنحاء دول الخليج.',
        'ويجسد انتقالنا إلى theQapp هذه الرحلة، مع تطلعنا إلى المستقبل. فحرف Q يرمز إلى Quality (الجودة)، وQuick Access (سهولة وسرعة الوصول)، وإلى الأسئلة اليومية التي يطرحها الآباء والأمهات عند التخطيط لحياة أسرهم. كما أنه يحمل إشارة وفاء لجذورنا، ويؤكد أن رسالتنا الأساسية لم تتغير، مهما تطورت هويتنا.',
        'في theQapp، لا نقتصر على جمع الأنشطة والتجارب، بل نرافق العائلة في رحلتها بأكملها. تطبيق واحد. مجتمع واحد. ورسالة واحدة: أن نجعل الحياة أسهل، والذكريات أجمل وأغنى.',
        'إنها ليست مجرد هوية جديدة، بل فصل جديد في قصة نكتبها معًا. ويسعدنا أن تكونوا جزءًا من هذه الرحلة.'
      ],
      // ✅ الفقرة الختامية (Bold + لون مميز)
      closingStory: 'نتطلع لانضمامكم إلينا، وصناعة المزيد من اللحظات الجميلة مع theQapp!',
      values: 'قيمنا',
      quality: 'الجودة',
      qualityDesc: 'نختار أفضل الأماكن والتجارب',
      community: 'المجتمع',
      communityDesc: 'نبني مجتمعاً من العائلات',
      care: 'الاهتمام',
      careDesc: 'نضع العائلة في قلب كل قرار',
      easy: 'الوصول السهل',
      easyDesc: 'نجعل التخطيط بسيطاً وسريعاً',
      imageView: 'اضغط لعرض الصورة بالحجم الكامل',
      closing: 'theQapp — تطبيق واحد، مجتمع واحد، وتجارب لا تُنسى لكل أفراد العائلة'
    },
    en: {
      title: 'About Us',
      intro: 'Every great story starts with a question, and ours was simple: How can we make family life easier, more meaningful, and full of unforgettable experiences?',
      story: [
        'What began as QiDZ, a trusted companion helping parents discover fun things to do with their children, soon grew into something much more. As families evolved, so did we. Today, that same spark lives on: brighter, bolder, and broader, as theQapp.',
        'Because families don\'t stand still. They grow, change, and explore new possibilities. And we\'ve grown with them. theQapp is where every chapter of family life comes together — from playdates to parties, after-school adventures to weekend getaways, local discoveries to travel dreams. Wherever life takes your family, we\'re here to make it simpler to plan, and easier to enjoy.',
        'It all started when we launched as QiDZ, with a clear vision: to make it easier for parents to find great activities and experiences for their children. Over time, our platform became more than a tool; it became a trusted friend to families across the GCC.',
        'Our rebrand to theQapp honors that journey while embracing the future. The "Q" stands for quality experiences, quick access, and the questions parents ask every day when shaping family life. It\'s also a subtle nod to our roots; a promise that while we have evolved, our heart remains the same.',
        'With theQapp, we are not just curating activities; we are championing the entire family journey. One app. One community. One mission: to make life simpler, and memories richer.',
        'This isn\'t just a new name; it\'s a new chapter in a story we\'re writing together. And we\'re so happy you\'re part of it.'
      ],
      closingStory: 'Looking forward to you joining the fun with us!',
      values: 'Our Values',
      quality: 'Quality',
      qualityDesc: 'We choose the best venues and experiences',
      community: 'Community',
      communityDesc: 'We build a community of families',
      care: 'Care',
      careDesc: 'We put family at the heart of every decision',
      easy: 'Easy Access',
      easyDesc: 'We make planning simple and fast',
      imageView: 'Click to view full size',
      closing: 'theQapp — One app, one community, and unforgettable experiences for every family member'
    }
  };

  // ============================================
  // التأثيرات الأولية
  // ============================================
  useEffect(() => {
    setMounted(true);
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.style.direction = dir;
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
  }, [locale]);

  useEffect(() => {
    fetchContent();
  }, []);

  // ============================================
  // جلب المحتوى من Supabase
  // ============================================
  async function fetchContent() {
    setLoading(true);
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .eq('section_key', 'main')
      .eq('is_active', true)
      .single();

    if (!error && data) {
      console.log('📄 About content loaded:', data);
      setContent(data);
    } else {
      console.warn('⚠️ No about content in DB, using defaults');
    }
    setLoading(false);
  }

  // ============================================
  // التبديل التلقائي بين الصور
  // ============================================
  useEffect(() => {
    if (!content?.images || content.images.length <= 1 || isAutoplayPaused) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % content.images.length);
    }, content.autoplay_interval || 4000);

    return () => clearInterval(interval);
  }, [content?.images, content?.autoplay_interval, isAutoplayPaused]);

  // ============================================
  // إغلاق الـ Lightbox بزر Escape
  // ============================================
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isLightboxOpen]);

  const nextImage = useCallback(() => {
    if (!content?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % content.images.length);
  }, [content?.images]);

  const prevImage = useCallback(() => {
    if (!content?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + content.images.length) % content.images.length);
  }, [content?.images]);

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // ============================================
  // حالات التحميل
  // ============================================
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ============================================
  // دمج المحتوى
  // ============================================
  const defaults = defaultContent[locale] || defaultContent.ar;
  const title = (locale === 'ar' ? content?.title_ar : content?.title_en) || defaults.title;
  
  // ✅ إذا كان هناك description من قاعدة البيانات، نقسمه إلى فقرات
  // وإلا نستخدم النص الافتراضي (intro + story + closingStory)
  const rawDescription = (locale === 'ar' ? content?.description_ar : content?.description_en) || '';
  
  let intro = defaults.intro;
  let storyParagraphs = defaults.story;
  let closingStory = defaults.closingStory;

  // إذا كان هناك description في قاعدة البيانات، نقسمه بالأسطر الفارغة
  if (rawDescription.trim()) {
    const paragraphs = rawDescription
      .split(/\n\s*\n/)       // فقرة = سطر فارغ
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    if (paragraphs.length >= 3) {
      intro = paragraphs[0];
      closingStory = paragraphs[paragraphs.length - 1];
      storyParagraphs = paragraphs.slice(1, -1);
    } else if (paragraphs.length === 2) {
      intro = paragraphs[0];
      storyParagraphs = [];
      closingStory = paragraphs[1];
    } else if (paragraphs.length === 1) {
      intro = paragraphs[0];
      storyParagraphs = [];
      closingStory = '';
    }
  }

  const images = content?.images || [];
  const isRTL = locale === 'ar';
  const t = defaults;

  const values = [
    { icon: <Heart className="w-6 h-6 md:w-8 md:h-8" />, title: t.care, desc: t.careDesc },
    { icon: <Sparkles className="w-6 h-6 md:w-8 md:h-8" />, title: t.quality, desc: t.qualityDesc },
    { icon: <Users className="w-6 h-6 md:w-8 md:h-8" />, title: t.community, desc: t.communityDesc },
    { icon: <Globe className="w-6 h-6 md:w-8 md:h-8" />, title: t.easy, desc: t.easyDesc }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      
      {/* ============================================
          Hero Section
      ============================================ */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">{title}</h1>
          <div className="w-20 md:w-24 h-1 bg-white/50 mx-auto rounded-full mt-4"></div>
        </div>
      </div>

      {/* ============================================
          ✅ قسم القصة (صورة + نص)
      ============================================ */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className={`flex flex-col ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-start`}>
            
            {/* ============================================
                الصورة (تتغير تلقائياً)
            ============================================ */}
            {images.length > 0 && (
              <div className="w-full md:w-2/5 md:sticky md:top-24">
                <div 
                  className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-gray-100 group cursor-pointer"
                  onMouseEnter={() => setIsAutoplayPaused(true)}
                  onMouseLeave={() => setIsAutoplayPaused(false)}
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <div className="relative aspect-[9/16] md:aspect-[3/5]">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${title} - ${idx + 1}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={idx === 0}
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      </div>
                    ))}
                  </div>

                  {/* أيقونة التكبير عند Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl">
                      <ZoomIn size={28} className="text-primary" />
                    </div>
                  </div>

                  {/* أزرار التنقل */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-primary p-2 md:p-3 rounded-full shadow-xl transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                        aria-label="السابق"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-primary p-2 md:p-3 rounded-full shadow-xl transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                        aria-label="التالي"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* شريط التلميح في الأسفل */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs md:text-sm text-center flex items-center justify-center gap-1.5">
                      <ZoomIn size={14} />
                      {t.imageView}
                    </p>
                  </div>
                </div>

                {/* النقاط + زر التشغيل/الإيقاف */}
                {images.length > 1 && (
                  <div className="flex items-center justify-center gap-3 md:gap-4 mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsAutoplayPaused(!isAutoplayPaused); }}
                      className="w-8 h-8 md:w-9 md:h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110 text-primary"
                      aria-label={isAutoplayPaused ? 'تشغيل' : 'إيقاف'}
                    >
                      {isAutoplayPaused ? <Play size={13} /> : <Pause size={13} />}
                    </button>

                    <div className="flex items-center gap-1.5 md:gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); goToImage(idx); }}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentImageIndex 
                              ? 'bg-primary w-6 md:w-8' 
                              : 'bg-gray-300 w-2 hover:bg-gray-400'
                          }`}
                          aria-label={`الانتقال إلى الصورة ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="bg-white border border-gray-200 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium text-gray-600 shadow-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================
                ✅ النص — مقسم إلى 3 أجزاء:
                - intro (بارز)
                - story (عادي)
                - closingStory (بارز + لون)
            ============================================ */}
            <div className="w-full md:w-3/5 space-y-5 md:space-y-6">
              
              {/* ✅ الفقرة الافتتاحية (Bold + لون Primary) */}
              {intro && (
                <p className="text-base md:text-lg leading-relaxed font-bold text-primary">
                  {intro}
                </p>
              )}

              {/* ✅ فقرات القصة (عادية) */}
              {storyParagraphs.map((paragraph, idx) => (
                <p 
                  key={idx} 
                  className="text-sm md:text-base leading-relaxed text-gray-700"
                >
                  {paragraph}
                </p>
              ))}

              {/* ✅ الفقرة الختامية (Bold + لون Primary) */}
              {closingStory && (
                <p className="text-base md:text-lg leading-relaxed font-bold text-primary">
                  {closingStory}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          القيم
      ============================================ */}
      <div className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8 md:mb-12">
            {t.values}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-primary">{value.title}</h3>
                <p className="text-xs md:text-base text-gray-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          الختام
      ============================================ */}
      <div className="container mx-auto px-4 py-12 md:py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="bg-primary/5 rounded-2xl p-6 md:p-12 border border-primary/10">
            <p className="text-lg md:text-2xl font-bold text-primary mb-4">{t.closing}</p>
            <div className="w-16 h-1 bg-primary/30 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>

      {/* ============================================
          Lightbox لعرض الصورة بحجم كامل
      ============================================ */}
      {isLightboxOpen && images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white transition z-10 p-2 hover:bg-white/10 rounded-full"
            aria-label="إغلاق"
          >
            <X size={32} />
          </button>

          <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/10 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm z-10">
            {currentImageIndex + 1} / {images.length}
          </div>

          <div 
            className="relative w-full max-w-5xl max-h-[90vh] aspect-[9/16] md:aspect-[3/5]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentImageIndex]}
              alt={`${title} - ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              quality={100}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all hover:scale-110 backdrop-blur-sm z-10"
                aria-label="السابق"
              >
                <ChevronLeft size={24} className="md:w-[32px] md:h-[32px]" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all hover:scale-110 backdrop-blur-sm z-10"
                aria-label="التالي"
              >
                <ChevronRight size={24} className="md:w-[32px] md:h-[32px]" />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); goToImage(idx); }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentImageIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/40 w-2 hover:bg-white/70'
                  }`}
                  aria-label={`الانتقال إلى الصورة ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}