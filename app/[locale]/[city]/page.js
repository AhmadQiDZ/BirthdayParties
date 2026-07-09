'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MapPin, Star, Users, Search, ArrowLeft, ChevronLeft } from 'lucide-react';
import PackageCard from '@/components/ui/PackageCard';
import WhatsAppPopup from '@/components/ui/WhatsAppPopup';
import { supabase } from '@/lib/supabase';

export default function CityPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const citySlug = params?.city || '';
  
  const [mounted, setMounted] = useState(false);
  const [cityData, setCityData] = useState(null);
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ===== Hero Images Slider =====
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [heroTitlesAr, setHeroTitlesAr] = useState([]);
  const [heroTitlesEn, setHeroTitlesEn] = useState([]);
  const [heroSubtitlesAr, setHeroSubtitlesAr] = useState([]);
  const [heroSubtitlesEn, setHeroSubtitlesEn] = useState([]);
  const [heroLinks, setHeroLinks] = useState([]);
  const [heroPackageIds, setHeroPackageIds] = useState([]);

  // ===== Package Images State =====
  const [packageImageIndices, setPackageImageIndices] = useState({});

  // دالة الحصول على رمز العملة
  const getCurrencySymbol = (currency) => {
    const currencies = {
      'SAR': { ar: 'ر.س', en: 'SAR' },
      'AED': { ar: 'د.إ', en: 'AED' },
      'BHD': { ar: 'د.ب', en: 'BHD' },
      'QAR': { ar: 'ر.ق', en: 'QAR' },
      'EUR': { ar: '€', en: 'EUR' },
      'GBP': { ar: '£', en: 'GBP' }
    };
    const lang = locale === 'ar' ? 'ar' : 'en';
    return currencies[currency]?.[lang] || (locale === 'ar' ? 'ر.س' : 'SAR');
  };

  // ===== تحسين SEO =====
  useEffect(() => {
    if (mounted && cityData) {
      const title = locale === 'ar' 
        ? cityData.meta_title_ar || `أفضل حفلات أعياد الميلاد في ${cityData.name_ar} | theQapp`
        : cityData.meta_title_en || `Best Birthday Parties in ${cityData.name_en} | theQapp`;
      document.title = title;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.content = locale === 'ar'
          ? cityData.meta_desc_ar || `اكتشف أفضل باقات حفلات أعياد الميلاد في ${cityData.name_ar}. أكثر من 1,000,000 حجز ناجح. احجز الآن!`
          : cityData.meta_desc_en || `Discover the best birthday party packages in ${cityData.name_en}. Over 1,000,000 successful bookings. Book now!`;
      }
    }
  }, [mounted, locale, cityData]);

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.style.direction = dir;
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
  }, [locale]);

  useEffect(() => {
    setMounted(true);
    if (citySlug) {
      console.log('🔍 City slug from URL:', citySlug);
      fetchCityData();
    } else {
      console.error('❌ No city slug provided');
      setLoading(false);
      setError('No city specified');
    }
  }, [citySlug]);

  useEffect(() => {
    if (mounted && cityData) {
      fetchPackages();
    }
  }, [cityData, mounted]);

  // ===== تغيير صورة الهيرو كل 4 ثواني =====
  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  // ===== تغيير صور الباقات كل 4 ثواني =====
  useEffect(() => {
    if (packages.length === 0) return;

    const initialIndices = {};
    packages.forEach(pkg => {
      if (pkg.images && pkg.images.length > 1) {
        initialIndices[pkg.id] = 0;
      }
    });
    setPackageImageIndices(initialIndices);

    const interval = setInterval(() => {
      setPackageImageIndices(prev => {
        const newIndices = { ...prev };
        packages.forEach(pkg => {
          if (pkg.images && pkg.images.length > 1) {
            const currentIndex = prev[pkg.id] || 0;
            newIndices[pkg.id] = (currentIndex + 1) % pkg.images.length;
          }
        });
        return newIndices;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [packages]);

  // ============================================
  // تصفية الباقات
  // ============================================
  useEffect(() => {
    if (mounted) {
      const filtered = packages.filter(pkg =>
        pkg.venue_name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.venue_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description_en?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPackages(filtered);
    }
  }, [searchTerm, packages, mounted]);

  // ============================================
  // جلب بيانات المدينة
  // ============================================
  async function fetchCityData() {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching city with slug:', citySlug);
      
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          countries (
            id,
            name_ar,
            name_en,
            code,
            flag_emoji
          )
        `)
        .eq('slug', citySlug)
        .eq('is_visible', true)
        .single();

      console.log('📦 City query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching city data:', error);
        setError(`City not found: ${error.message}`);
        setCityData(null);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('❌ No city found with slug:', citySlug);
        setError(`City not found: ${citySlug}`);
        setCityData(null);
        setLoading(false);
        return;
      }

      console.log('✅ City data loaded:', data);
      setCityData(data);
      
      setHeroImages(data.hero_images || []);
      setHeroTitlesAr(data.hero_titles_ar || []);
      setHeroTitlesEn(data.hero_titles_en || []);
      setHeroSubtitlesAr(data.hero_subtitles_ar || []);
      setHeroSubtitlesEn(data.hero_subtitles_en || []);
      setHeroLinks(data.hero_links || []);
      setHeroPackageIds(data.hero_package_ids || []);
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error in fetchCityData:', err);
      setError(err.message);
      setCityData(null);
      setLoading(false);
    }
  }

  // ============================================
  // جلب باقات المدينة (الأعمدة الأساسية فقط)
  // ============================================
  async function fetchPackages() {
    try {
      console.log('🔍 Fetching packages for city ID:', cityData.id);
      
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          cities (
            id,
            name_ar,
            name_en,
            slug,
            country_id,
            countries (
              id,
              name_ar,
              name_en,
              code,
              flag_emoji
            )
          ),
          package_tiers (
            id,
            name_ar,
            name_en,
            description_ar,
            description_en,
            price,
            price_before_discount,
            show_discount,
            max_children
          )
        `)
        .eq('city_id', cityData.id)
        .eq('status', 'live')
        .is('deleted_at', null)
        .order('featured', { ascending: false })
        .order('popular', { ascending: false })
        .order('created_at', { ascending: false });

      console.log('📦 Packages query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching packages:', error);
        setPackages([]);
        setFilteredPackages([]);
      } else {
        console.log(`✅ Packages loaded: ${data?.length || 0}`);
        setPackages(data || []);
        setFilteredPackages(data || []);
      }
    } catch (err) {
      console.error('❌ Error in fetchPackages:', err);
      setPackages([]);
      setFilteredPackages([]);
    }
  }

  // ============================================
  // الحصول على الصورة الحالية للباقة
  // ============================================
  const getCurrentPackageImage = (pkg) => {
    if (!pkg.images || pkg.images.length === 0) {
      return null;
    }
    const index = packageImageIndices[pkg.id] || 0;
    return pkg.images[index];
  };

  // ============================================
  // معرفة إذا كانت الباقة لديها أكثر من صورة
  // ============================================
  const hasMultiplePackageImages = (pkg) => {
    return pkg.images && pkg.images.length > 1;
  };

  // ============================================
  // دوال التنقل في الصور
  // ============================================
  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => 
      (prev + 1) % heroImages.length
    );
  };

  // ============================================
  // عرض الهيرو الرئيسي (مع سلايدر)
  // ============================================
  function renderMainHero() {
    if (!cityData) return null;

    const hasImages = heroImages.length > 0;
    const currentImage = hasImages ? heroImages[currentImageIndex] : null;
    
    const title = locale === 'ar' 
      ? (heroTitlesAr[currentImageIndex] || cityData.name_ar)
      : (heroTitlesEn[currentImageIndex] || cityData.name_en);
    
    const subtitle = locale === 'ar'
      ? heroSubtitlesAr[currentImageIndex]
      : heroSubtitlesEn[currentImageIndex];
    
    const link = heroLinks[currentImageIndex] || cityData.hero_link || null;
    const packageId = heroPackageIds[currentImageIndex] || null;

    const defaultTitle = locale === 'ar' 
      ? `أفضل حفلات أعياد الميلاد في ${cityData.name_ar}`
      : `Best Birthday Parties in ${cityData.name_en}`;

    return (
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl h-[300px] md:h-[380px] lg:h-[450px]">
        <div className="absolute inset-0">
          {currentImage ? (
            <img
              src={currentImage}
              alt={title || cityData.name_ar}
              className="w-full h-full object-cover transition-opacity duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <div className="text-white text-center px-4">
                <div className="text-5xl md:text-7xl mb-3 md:mb-4">🎉</div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">{cityData.name_ar}</h1>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-white px-4 md:px-6 max-w-3xl">
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 md:mb-4 drop-shadow-lg">
              {title || defaultTitle}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg lg:text-xl opacity-90 mb-4 md:mb-6 max-w-2xl mx-auto px-2">
                {subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  {locale === 'ar' ? 'المزيد من التفاصيل' : 'More Details'}
                  <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
                </a>
              ) : packageId ? (
                <Link
                  href={`/${locale}/package/${packageId}`}
                  className="inline-flex items-center gap-2 bg-white text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  {locale === 'ar' ? 'المزيد من التفاصيل' : 'More Details'}
                  <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium border border-white/30">
                  <MapPin size={14} className="md:w-[16px] md:h-[16px]" />
                  {locale === 'ar' ? 'اكتشف الباقات' : 'Discover Packages'}
                </div>
              )}
            </div>
          </div>
        </div>

        {hasImages && heroImages.length > 1 && (
          <>
            <button
              onClick={goToPrevImage}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 md:p-2 rounded-full transition-all hover:scale-110 backdrop-blur-sm z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} className="md:w-[24px] md:h-[24px]" />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 md:p-2 rounded-full transition-all hover:scale-110 backdrop-blur-sm z-10"
              aria-label="Next image"
            >
              <ChevronRight size={16} className="md:w-[24px] md:h-[24px]" />
            </button>
          </>
        )}

        {hasImages && heroImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white w-4 md:w-6' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // دالة مساعدة لإنشاء slug
  // ============================================
  const createSlug = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !cityData || !cityData.is_visible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl md:text-6xl mb-4">🔍</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
            {locale === 'ar' ? 'المدينة غير موجودة' : 'City not found'}
          </h2>
          <p className="text-gray-500 mb-2 text-sm md:text-base">
            {locale === 'ar' 
              ? `لم يتم العثور على مدينة بالاسم: "${citySlug}"`
              : `City not found: "${citySlug}"`}
          </p>
          <Link href={`/${locale}`} className="text-primary hover:underline text-sm md:text-base">
            {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  const cityName = locale === 'ar' ? cityData.name_ar : cityData.name_en;
  const totalPackages = packages.length;
  const countryName = cityData.countries?.name_ar || '';
  const countryFlag = cityData.countries?.flag_emoji || '📍';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ===== زر العودة ===== */}
      <div className="container mx-auto px-3 md:px-4 pt-3 md:pt-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 md:gap-2 text-gray-600 hover:text-primary transition bg-white/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-md hover:shadow-lg text-xs md:text-sm"
        >
          <ArrowLeft size={14} className="md:w-[18px] md:h-[18px]" />
          <span className="font-medium">
            {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </span>
        </Link>
      </div>

      {/* ===== الهيرو الرئيسي مع سلايدر ===== */}
      <div className="container mx-auto px-3 md:px-4 pt-3 md:pt-4">
        {renderMainHero()}
      </div>

      {/* ===== إحصائيات المدينة ===== */}
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary/10 p-2 md:p-3 rounded-full">
              <MapPin size={16} className="md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px] text-primary" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-bold text-primary flex items-center gap-2">
                {countryFlag} {cityName}
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                {locale === 'ar' 
                  ? `${totalPackages} باقة متاحة في ${countryName}`
                  : `${totalPackages} packages available in ${countryName}`}
              </p>
            </div>
          </div>
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm">
            <div className="text-center">
              <p className="font-bold text-primary text-base md:text-lg">{totalPackages}</p>
              <p className="text-gray-400 text-[10px] md:text-xs">{locale === 'ar' ? 'باقات' : 'Packages'}</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-accent text-base md:text-lg">4.9</p>
              <p className="text-gray-400 text-[10px] md:text-xs">{locale === 'ar' ? 'تقييم' : 'Rating'}</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-500 text-base md:text-lg">1M+</p>
              <p className="text-gray-400 text-[10px] md:text-xs">{locale === 'ar' ? 'حجوزات' : 'Bookings'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== شريط البحث ===== */}
      <div className="container mx-auto px-3 md:px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search size={16} className="md:w-[20px] md:h-[20px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={locale === 'ar' ? 'ابحث عن باقة في المدينة...' : 'Search for packages in this city...'}
              className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
            />
          </div>
        </div>
      </div>

      {/* ===== عدد النتائج ===== */}
      {filteredPackages.length > 0 && (
        <div className="container mx-auto px-3 md:px-4 py-1 md:py-2">
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-500">
              {locale === 'ar' 
                ? `عرض ${filteredPackages.length} باقة`
                : `Showing ${filteredPackages.length} packages`}
            </p>
          </div>
        </div>
      )}

      {/* ===== باقات المدينة ===== */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {filteredPackages.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white rounded-xl md:rounded-2xl shadow-lg px-4">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎈</div>
            <p className="text-gray-500 text-base md:text-lg">
              {searchTerm ? (
                locale === 'ar' 
                  ? 'لا توجد باقات تطابق بحثك'
                  : 'No packages match your search'
              ) : (
                locale === 'ar' 
                  ? 'لا توجد باقات متاحة حالياً في هذه المدينة'
                  : 'No packages available in this city at the moment'
              )}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 md:mt-4 text-primary hover:underline text-sm"
              >
                {locale === 'ar' ? 'مسح البحث' : 'Clear search'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredPackages.map((pkg) => {
              const currentImage = getCurrentPackageImage(pkg);
              const hasMultiple = hasMultiplePackageImages(pkg);
              const totalImages = pkg.images?.length || 0;
              const currentIndex = packageImageIndices[pkg.id] || 0;

              return (
                <PackageCard 
                  key={pkg.id} 
                  package={pkg} 
                  locale={locale}
                  currentImage={currentImage}
                  hasMultipleImages={hasMultiple}
                  totalImages={totalImages}
                  currentImageIndex={currentIndex}
                />
              );
            })}
          </div>
        )}
      </div>

      <WhatsAppPopup />
    </div>
  );
}