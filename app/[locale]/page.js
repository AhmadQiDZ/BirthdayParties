'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, MapPin, Search, Tag, Users, Star, Building, Gift, Percent } from 'lucide-react';
import WhatsAppPopup from '@/components/ui/WhatsAppPopup';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [mounted, setMounted] = useState(false);
  
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  
  // ===== الهيرو الرئيسي (من main_heroes) =====
  const [mainHeroes, setMainHeroes] = useState([]);
  const [currentMainHeroIndex, setCurrentMainHeroIndex] = useState(0);
  
  // ===== الهيرو الثانوي (من secondary_heroes) =====
  const [secondaryHeroes, setSecondaryHeroes] = useState([]);
  const [currentSecondaryHeroIndex, setCurrentSecondaryHeroIndex] = useState(0);

  // ===== مؤشرات الصور لكل مدينة =====
  const [cityImageIndices, setCityImageIndices] = useState({});

  // ============================================
  // تحسين SEO
  // ============================================
  useEffect(() => {
    if (mounted) {
      document.title = locale === 'ar' 
        ? 'أفضل حفلات أعياد الميلاد في الخليج | theQapp'
        : 'Best Birthday Parties in the Gulf | theQapp';
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.content = locale === 'ar'
          ? 'اكتشف أفضل باقات حفلات أعياد الميلاد في الرياض، جدة، دبي وأبوظبي. أكثر من 1,000,000 حجز ناجح. احجز الآن!'
          : 'Discover the best birthday party packages in Riyadh, Jeddah, Dubai and Abu Dhabi. Over 1,000,000 successful bookings. Book now!';
      }
      
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.content = locale === 'ar'
          ? 'حفلات أعياد ميلاد, باقات حفلات, أماكن حفلات, حجوزات أطفال, theQapp, الرياض, جدة, دبي'
          : 'birthday parties, party packages, party venues, children bookings, theQapp, Riyadh, Jeddah, Dubai';
      }
    }
  }, [mounted, locale]);

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.style.direction = dir;
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
  }, [locale]);

  useEffect(() => {
    setMounted(true);
    fetchAllData();
  }, []);

  // ============================================
  // تغيير الهيرو الرئيسي كل 5 ثواني
  // ============================================
  useEffect(() => {
    if (mainHeroes.length > 1) {
      const interval = setInterval(() => {
        setCurrentMainHeroIndex((prev) => (prev + 1) % mainHeroes.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mainHeroes]);

  // ============================================
  // تغيير الهيرو الثانوي كل 4 ثواني
  // ============================================
  useEffect(() => {
    if (secondaryHeroes.length > 1) {
      const interval = setInterval(() => {
        setCurrentSecondaryHeroIndex((prev) => (prev + 1) % secondaryHeroes.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [secondaryHeroes]);

  // ============================================
  // تغيير صور المدن كل 4 ثواني
  // ============================================
  useEffect(() => {
    if (filteredCities.length === 0) return;

    const initialIndices = {};
    filteredCities.forEach(city => {
      if (city.hero_images && city.hero_images.length > 1) {
        initialIndices[city.id] = 0;
      }
    });
    setCityImageIndices(initialIndices);

    const interval = setInterval(() => {
      setCityImageIndices(prev => {
        const newIndices = { ...prev };
        filteredCities.forEach(city => {
          if (city.hero_images && city.hero_images.length > 1) {
            newIndices[city.id] = (prev[city.id] + 1) % city.hero_images.length;
          }
        });
        return newIndices;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [filteredCities]);

  // ============================================
  // جلب جميع البيانات
  // ============================================
  async function fetchAllData() {
    setLoading(true);
    await Promise.all([
      fetchCities(),
      fetchMainHeroes(),
      fetchSecondaryHeroes(),
      fetchPackages()
    ]);
    setLoading(false);
  }

  // ============================================
  // جلب المدن من جدول cities (مع الدول)
  // ============================================
  async function fetchCities() {
    try {
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
        .eq('is_visible', true)
        .order('name_ar');

      if (error) {
        console.error('❌ Error fetching cities:', error);
      } else {
        setCities(data || []);
        setFilteredCities(data || []);
        console.log('✅ Cities loaded from cities table:', data);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  // ============================================
  // جلب الباقات
  // ============================================
  async function fetchPackages() {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          cities (
            id,
            name_ar,
            name_en,
            slug
          ),
          branches (
            id,
            name_ar,
            name_en,
            tiers:package_tiers(*)
          )
        `)
        .eq('status', 'live')
        .is('deleted_at', null);

      if (error) {
        console.error('❌ Error fetching packages:', error);
      } else {
        setPackages(data || []);
        console.log('✅ Packages loaded:', data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  // ============================================
  // جلب الهيرو الرئيسي من main_heroes
  // ============================================
  async function fetchMainHeroes() {
    try {
      const { data, error } = await supabase
        .from('main_heroes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching main heroes:', error);
      } else {
        setMainHeroes(data || []);
        console.log(`✅ Main heroes loaded: ${data?.length || 0}`);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  // ============================================
  // جلب الهيرو الثانوي من secondary_heroes
  // ============================================
  async function fetchSecondaryHeroes() {
    try {
      const { data, error } = await supabase
        .from('secondary_heroes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching secondary heroes:', error);
      } else {
        setSecondaryHeroes(data || []);
        console.log(`✅ Secondary heroes loaded: ${data?.length || 0}`);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  // ============================================
  // تصفية المدن حسب البحث
  // ============================================
  useEffect(() => {
    if (mounted) {
      const filtered = cities.filter(city =>
        city.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchTerm, cities, mounted]);

  // ============================================
  // دوال التنقل في الهيرو الثانوي
  // ============================================
  const goToPrevSecondaryHero = () => {
    setCurrentSecondaryHeroIndex((prev) => 
      prev === 0 ? secondaryHeroes.length - 1 : prev - 1
    );
  };

  const goToNextSecondaryHero = () => {
    setCurrentSecondaryHeroIndex((prev) => 
      (prev + 1) % secondaryHeroes.length
    );
  };

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

  // ============================================
  // الحصول على الصورة الحالية للمدينة
  // ============================================
  const getCurrentCityImage = (city) => {
    if (!city.hero_images || city.hero_images.length === 0) {
      return null;
    }
    const index = cityImageIndices[city.id] || 0;
    return city.hero_images[index];
  };

  // ============================================
  // معرفة إذا كانت المدينة لديها أكثر من صورة
  // ============================================
  const hasMultipleImages = (city) => {
    return city.hero_images && city.hero_images.length > 1;
  };

  // ============================================
  // دالة الحصول على رمز العملة حسب كود العملة
  // ============================================
  const getCurrencySymbol = (currency) => {
    const currencies = {
      'SAR': { ar: 'ر.س', en: 'SAR' },
      'AED': { ar: 'د.إ', en: 'AED' },
      'BHD': { ar: 'د.ب', en: 'BHD' },
      'QAR': { ar: 'ر.ق', en: 'QAR' },
      'EUR': { ar: '€', en: 'EUR' },
      'GBP': { ar: '£', en: 'GBP' },
      'USD': { ar: '$', en: 'USD' }
    };
    const lang = locale === 'ar' ? 'ar' : 'en';
    return currencies[currency]?.[lang] || (locale === 'ar' ? 'ر.س' : 'SAR');
  };

  // ============================================
  // حساب إحصائيات المدينة من الباقات
  // ============================================
  const getCityStats = (cityId) => {
    const cityPackages = packages.filter(pkg => pkg.city_id === cityId);
    const totalPackages = cityPackages.length;
    
    let minPrice = Infinity;
    let maxDiscount = 0;
    let totalBranches = 0;
    let totalTiers = 0;
    let cityCurrency = 'SAR';
    
    cityPackages.forEach(pkg => {
      // جلب عملة الباقة
      if (pkg.currency) {
        cityCurrency = pkg.currency;
      }
      
      if (pkg.branches) {
        pkg.branches.forEach(branch => {
          if (branch.tiers) {
            branch.tiers.forEach(tier => {
              totalTiers++;
              if (tier.price && tier.price < minPrice) {
                minPrice = tier.price;
              }
              if (tier.price_before_discount && tier.price_before_discount > tier.price) {
                const discount = ((tier.price_before_discount - tier.price) / tier.price_before_discount) * 100;
                if (discount > maxDiscount) {
                  maxDiscount = discount;
                }
              }
            });
          }
          totalBranches++;
        });
      }
    });
    
    if (minPrice === Infinity) minPrice = 0;
    const currencySymbol = getCurrencySymbol(cityCurrency);
    
    return {
      totalPackages,
      totalTiers,
      minPrice,
      maxDiscount: Math.round(maxDiscount),
      totalBranches,
      currency: cityCurrency,
      currencySymbol
    };
  };

  // ============================================
  // عرض الهيرو الرئيسي
  // ============================================
  function renderMainHero() {
    if (mainHeroes.length === 0) {
      return (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-primary/80 to-accent/80 flex items-center justify-center">
          <div className="text-white text-center px-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {locale === 'ar' ? 'أفضل حفلات أعياد الميلاد' : 'Best Birthday Parties'}
            </h1>
            <p className="text-xl opacity-90">
              {locale === 'ar' ? 'اكتشف أفضل الباقات واحجز الآن' : 'Discover the best packages and book now'}
            </p>
          </div>
        </div>
      );
    }

    const hero = mainHeroes[currentMainHeroIndex];
    const title = locale === 'ar' ? hero.title_ar : hero.title_en;
    
    let linkUrl = `/${locale}`;
    if (hero.link && hero.link.trim() !== '') {
      linkUrl = hero.link;
    } else if (hero.package_id) {
      const pkg = packages.find(p => p.id === hero.package_id);
      if (pkg && pkg.cities) {
        const citySlug = pkg.cities.slug;
        const pkgSlug = createSlug(locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en);
        linkUrl = `/${locale}/${citySlug}/${pkgSlug}`;
      }
    }

    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-700">
        <div className="absolute inset-0">
          <img
            src={hero.image_url}
            alt={title || 'Hero'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-white px-6 max-w-3xl">
            {title && (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                {title}
              </h1>
            )}
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <Link
                href={linkUrl}
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
              >
                {locale === 'ar' ? 'المزيد من التفاصيل' : 'More Details'}
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {mainHeroes.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {mainHeroes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMainHeroIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentMainHeroIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/80'
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
  // عرض الهيرو الثانوي
  // ============================================
  function renderSecondaryHero() {
    if (secondaryHeroes.length === 0) return null;
    
    const hero = secondaryHeroes[currentSecondaryHeroIndex];
    const title = locale === 'ar' ? hero.title_ar : hero.title_en;
    
    let linkUrl = `/${locale}`;
    if (hero.link && hero.link.trim() !== '') {
      linkUrl = hero.link;
    } else if (hero.package_id) {
      const pkg = packages.find(p => p.id === hero.package_id);
      if (pkg && pkg.cities) {
        const citySlug = pkg.cities.slug;
        const pkgSlug = createSlug(locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en);
        linkUrl = `/${locale}/${citySlug}/${pkgSlug}`;
      }
    }

    return (
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-5xl mx-auto relative">
          <div className="relative w-full h-[180px] md:h-[220px] lg:h-[260px] rounded-2xl overflow-hidden shadow-xl group">
            <div className="absolute inset-0">
              <img
                src={hero.image_url}
                alt={title || 'Hero'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              
              <div className="absolute inset-0 flex items-center">
                <div className="text-white px-6 md:px-10 max-w-2xl">
                  {title && (
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg">
                      {title}
                    </h2>
                  )}
                  
                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      href={linkUrl}
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition border border-white/30"
                    >
                      {locale === 'ar' ? 'المزيد من التفاصيل' : 'More Details'}
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {secondaryHeroes.length > 1 && (
            <>
              <button
                onClick={goToPrevSecondaryHero}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                aria-label="Previous"
              >
                <ChevronLeft size={24} className="drop-shadow-md" />
              </button>
              <button
                onClick={goToNextSecondaryHero}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-4 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                aria-label="Next"
              >
                <ChevronRight size={24} className="drop-shadow-md" />
              </button>
            </>
          )}

          {secondaryHeroes.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {secondaryHeroes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSecondaryHeroIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSecondaryHeroIndex 
                      ? 'bg-primary w-5' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* ===== الهيرو الرئيسي (من main_heroes) ===== */}
      <div className="container mx-auto px-4 pt-4 md:pt-6">
        {renderMainHero()}
      </div>

      {/* ===== الهيرو الثانوي (من secondary_heroes) ===== */}
      {renderSecondaryHero()}

      {/* ===== قسم المدن ===== */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* عنوان القسم */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
              {locale === 'ar' ? 'اكتشف المدن' : 'Discover Cities'}
            </h2>
            <p className="text-gray-500 mt-2 text-base md:text-lg">
              {locale === 'ar' 
                ? 'اختر مدينتك واكتشف أفضل باقات حفلات أعياد الميلاد'
                : 'Choose your city and discover the best birthday party packages'}
            </p>
          </div>

          {/* شريط البحث */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search size={22} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث عن مدينة...' : 'Search for a city...'}
                className="w-full pl-10 pr-4 py-3.5 text-lg border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* شبكة المدن - تصميم عرضي (أفقي) */}
          {filteredCities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏙️</div>
              <p className="text-gray-500 text-lg">
                {locale === 'ar' ? 'لا توجد مدن متاحة حالياً' : 'No cities available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city) => {
                const currentImage = getCurrentCityImage(city);
                const hasMultiple = hasMultipleImages(city);
                const totalImages = city.hero_images?.length || 0;
                const currentIndex = cityImageIndices[city.id] || 0;
                const stats = getCityStats(city.id);

                return (
                  <Link
                    key={city.id}
                    href={`/${locale}/${city.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                  >
                    {/* صورة المدينة - نسبة عرض مناسبة */}
                    <div className="relative h-56 md:h-60 overflow-hidden bg-gray-100">
                      {currentImage ? (
                        <>
                          <img
                            src={currentImage}
                            alt={city.name_ar}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* عداد الصور */}
                          {hasMultiple && (
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <span className="font-medium">{currentIndex + 1}</span>
                              <span className="opacity-50">/</span>
                              <span>{totalImages}</span>
                            </div>
                          )}
                          {/* نقاط المؤشر للصور */}
                          {hasMultiple && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {city.hero_images.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentIndex 
                                      ? 'bg-white w-5' 
                                      : 'bg-white/40 w-1.5'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <MapPin size={48} className="text-primary/30" />
                        </div>
                      )}
                      
                      {/* Overlay للعنوان */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* اسم المدينة والعلم */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl md:text-3xl font-bold">{city.name_ar}</span>
                          <span className="text-xl">{city.countries?.flag_emoji}</span>
                        </div>
                        <p className="text-sm opacity-80">{city.name_en}</p>
                      </div>
                    </div>

                    {/* معلومات المدينة - تصميم عرضي مدمج */}
                    <div className="p-4 space-y-3">
                      {/* عدد الباقات والفروع - صف واحد */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Gift size={18} className="text-primary" />
                          <span className="font-bold text-gray-800">
                            {stats.totalPackages} {locale === 'ar' ? 'باقة' : 'Packages'}
                          </span>
                        </div>
                        {stats.totalBranches > 0 && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Building size={16} />
                            <span className="text-sm font-medium">{stats.totalBranches}</span>
                          </div>
                        )}
                      </div>

                      {/* الخصم والسعر في صف واحد */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                        {/* الخصم */}
                        {stats.maxDiscount > 0 ? (
                          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                            <Percent size={15} className="text-green-600" />
                            <span className="font-bold text-sm">{stats.maxDiscount}%</span>
                            <span className="text-xs text-green-600">
                              {locale === 'ar' ? 'خصم' : 'OFF'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Percent size={15} />
                            <span className="text-xs">{locale === 'ar' ? 'لا يوجد خصم' : 'No discount'}</span>
                          </div>
                        )}
                        
                        {/* السعر */}
                        {stats.minPrice > 0 && (
                          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                            <span className="text-xs text-gray-500">{locale === 'ar' ? 'من' : 'From'}</span>
                            <span className="font-bold text-primary text-sm">
                              {stats.minPrice}
                            </span>
                            <span className="text-xs text-gray-500">{stats.currencySymbol}</span>
                          </div>
                        )}
                      </div>

                      {/* زر الاستكشاف */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-primary group-hover:text-accent transition-colors text-sm font-medium">
                          <span>
                            {locale === 'ar' ? 'استكشف الباقات' : 'Explore Packages'}
                          </span>
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WhatsAppPopup />
    </>
  );
}