'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [slides, setSlides] = useState([]);
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'ar';

  useEffect(() => {
    fetchHeroData();
  }, [locale]);

  async function fetchHeroData() {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name_ar');

    if (!error && data) {
      const allSlides = [];
      data.forEach(city => {
        if (city.hero_images && city.hero_images.length > 0) {
          city.hero_images.forEach((img, index) => {
            let link = null;
            
            // 1. إذا كان هناك package_id محدد
            const packageId = city.hero_package_ids && city.hero_package_ids[index];
            if (packageId) {
              link = `/${locale}/package/${packageId}`;
            }
            // 2. إذا كان هناك رابط مخصص
            else if (city.hero_links && city.hero_links[index]) {
              link = city.hero_links[index];
            }
            // 3. افتراضي: الصفحة الرئيسية
            else {
              link = `/${locale}`;
            }
            
            allSlides.push({
              image: img,
              title: locale === 'ar' ? city.name_ar : city.name_en,
              subtitle: locale === 'ar' 
                ? `أفضل حفلات أعياد الميلاد في ${city.name_ar}` 
                : `Best birthday parties in ${city.name_en}`,
              link: link,
              cityName: locale === 'ar' ? city.name_ar : city.name_en,
              packageId: packageId
            });
          });
        }
      });
      
      if (allSlides.length === 0) {
        allSlides.push({
          image: 'https://placehold.co/1200x600/023d6d/ffffff?text=TheQapp',
          title: locale === 'ar' ? 'احجز حفلة عيد ميلاد طفلك' : 'Book Your Child\'s Birthday Party',
          subtitle: locale === 'ar' ? 'أفضل الأماكن في السعودية والإمارات' : 'Best venues in Saudi Arabia & UAE',
          link: `/${locale}`,
          cityName: 'TheQapp'
        });
      }
      
      setSlides(allSlides);
      console.log('🎠 Hero slides:', allSlides);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [slides.length, mounted]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleSlideClick = () => {
    if (slides[currentSlide]?.link) {
      console.log('🔗 Navigating to:', slides[currentSlide].link);
      router.push(slides[currentSlide].link);
    }
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    if (slides[currentSlide]?.link) {
      console.log('🔗 Book Now navigating to:', slides[currentSlide].link);
      router.push(slides[currentSlide].link);
    }
  };

  if (!mounted || slides.length === 0) {
    return (
      <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-r from-primary to-blue-800">
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleSlideClick}
      >
        <img
          src={slide.image}
          alt={slide.cityName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/1200x600/023d6d/ffffff?text=TheQapp';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
        <div className="text-white px-4 max-w-3xl z-10 pointer-events-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in drop-shadow-lg">
            {slide.title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 animate-slide-up opacity-95 drop-shadow-md">
            {slide.subtitle}
          </p>
          <button 
            onClick={handleBookNow}
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
          </button>
        </div>
      </div>
      
      <button
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
      >
        <ChevronRight size={32} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}