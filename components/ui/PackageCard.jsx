'use client';
import Link from 'next/link';
import { MapPin, Star, Users, Percent, ChevronRight } from 'lucide-react';

export default function PackageCard({ 
  package: pkg, 
  locale = 'ar',
  currentImage = null,
  hasMultipleImages = false,
  totalImages = 0,
  currentImageIndex = 0
}) {
  if (!pkg) {
    return null;
  }
  
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
  
  // حساب أقل سعر مع الخصم
  let minPrice = 0;
  let minPriceBeforeDiscount = 0;
  let hasDiscount = false;
  let discountPercent = 0;
  let maxChildren = 0;
  
  if (pkg.package_tiers && pkg.package_tiers.length > 0) {
    const prices = pkg.package_tiers.map(t => parseFloat(t.price) || 0);
    minPrice = Math.min(...prices);
    
    // حساب الحد الأقصى لعدد الأطفال
    const childrenCounts = pkg.package_tiers.map(t => parseInt(t.max_children) || 0);
    maxChildren = Math.max(...childrenCounts);
    
    const pricesBefore = pkg.package_tiers
      .filter(t => t.price_before_discount > 0)
      .map(t => parseFloat(t.price_before_discount) || 0);
    
    if (pricesBefore.length > 0) {
      minPriceBeforeDiscount = Math.min(...pricesBefore);
      hasDiscount = minPriceBeforeDiscount > 0 && minPriceBeforeDiscount > minPrice;
      
      if (hasDiscount) {
        discountPercent = Math.round(((minPriceBeforeDiscount - minPrice) / minPriceBeforeDiscount) * 100);
      }
    }
  }

  const venueName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  const description = locale === 'ar' ? pkg.description_ar : pkg.description_en;
  const cityName = locale === 'ar' ? pkg.cities?.name_ar : pkg.cities?.name_en;
  const currencySymbol = getCurrencySymbol(pkg.currency || 'SAR');
  
  // النصوص حسب اللغة
  const texts = {
    ar: {
      startingFrom: 'أسعار تبدأ من',
      viewDetails: 'عرض التفاصيل الكاملة',
      selectBranch: 'اختر الفرع',
      multipleBranches: 'فروع متعددة',
      noImage: 'لا توجد صورة',
      reviews: 'تقييم',
      bookings: 'حجز',
      discount: 'خصم',
      save: 'وفر',
      children: 'طفل',
      childrenPlural: 'أطفال'
    },
    en: {
      startingFrom: 'Starting from',
      viewDetails: 'View Full Details',
      selectBranch: 'Select Branch',
      multipleBranches: 'Multiple Branches',
      noImage: 'No Image',
      reviews: 'Reviews',
      bookings: 'Bookings',
      discount: 'OFF',
      save: 'Save',
      children: 'Child',
      childrenPlural: 'Children'
    }
  };
  
  const t = texts[locale] || texts.ar;

  // استخدام الصورة الحالية إذا تم تمريرها، وإلا استخدم الصورة الأولى
  const hasImages = pkg.images && pkg.images.length > 0;
  const imageUrl = currentImage || (hasImages ? pkg.images[0] : null);
  
  // ============================================
  // إنشاء الرابط الجديد المحسن للسيو
  // ============================================
  const createSlug = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // الحصول على slug المدينة والبطاقة - استخدام slug بدلاً من slug_ar/slug_en
  const citySlug = pkg.cities?.slug; // <-- التغيير هنا
  const packageName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
  const packageSlug = createSlug(packageName);
  
  // الرابط الجديد: /{locale}/{city}/{package}
  // إذا كان هناك فروع متعددة، استخدم رابط الفروع
  const linkUrl = pkg.has_multiple_branches 
    ? `/${locale}/branches/${pkg.id}` 
    : `/${locale}/${citySlug}/${packageSlug}`;

  const displayBookings = pkg.booking_count || 0;
  const displayRating = pkg.rating || 0;
  const displayReviews = pkg.reviews_count || 0;
  const savedAmount = hasDiscount ? minPriceBeforeDiscount - minPrice : 0;

  return (
    <Link href={linkUrl}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
        {/* ===== صورة الباقة ===== */}
        <div className="relative h-48 md:h-52 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt={venueName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex flex-col items-center justify-center text-gray-400 w-full h-full">
                        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-xs mt-2">${t.noImage}</span>
                      </div>
                    `;
                  }
                }}
              />
              
              {/* ===== عداد الصور ===== */}
              {hasMultipleImages && totalImages > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                  {currentImageIndex + 1} / {totalImages}
                </div>
              )}
              
              {/* ===== نقاط مؤشر الصور ===== */}
              {hasMultipleImages && totalImages > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {Array.from({ length: Math.min(totalImages, 5) }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex 
                          ? 'bg-white w-3' 
                          : 'bg-white/40'
                      }`}
                    />
                  ))}
                  {totalImages > 5 && (
                    <div className="w-1 h-1 rounded-full bg-white/40" />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-2">{t.noImage}</span>
            </div>
          )}
          
          {/* طبقة شفافة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* ===== نسبة الخصم ===== */}
          {hasDiscount && discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
              <Percent size={12} />
              {discountPercent}% {t.discount}
            </div>
          )}
          
          {/* ===== الفروع المتعددة ===== */}
          {pkg.has_multiple_branches && (
            <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
              <MapPin size={12} /> 
              {t.multipleBranches}
            </div>
          )}
          
          {/* ===== عدد الأطفال ===== */}
          {maxChildren > 0 && (
            <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
              <Users size={12} />
              {maxChildren} {maxChildren > 1 ? t.childrenPlural : t.children}
            </div>
          )}
          
          {/* ===== معلومات السعر والتقييمات ===== */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            {/* الجهة اليسرى: التقييم وعدد الحجوزات */}
            <div className="flex flex-col items-start gap-1">
              {displayBookings > 0 && (
                <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] flex items-center gap-1 shadow-lg">
                  <Users size={12} className="text-accent" />
                  <span className="font-medium">{displayBookings}+</span>
                  <span className="text-white/60">{t.bookings}</span>
                </div>
              )}
              
              {displayRating > 0 && (
                <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] flex items-center gap-1 shadow-lg">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{displayRating}</span>
                  <span className="text-white/60">({displayReviews})</span>
                </div>
              )}
            </div>
            
            {/* ===== الجهة اليمنى: السعر ===== */}
            {minPrice > 0 && (
              <div className="bg-accent/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl shadow-lg min-w-[100px] text-center">
                {hasDiscount && minPriceBeforeDiscount > 0 ? (
                  <div>
                    {/* السعر قبل الخصم */}
                    <div className="text-[9px] text-white/60 line-through">
                      {minPriceBeforeDiscount} {currencySymbol}
                    </div>
                    {/* السعر بعد الخصم */}
                    <div className="text-xs font-bold">
                      {t.startingFrom} {minPrice} {currencySymbol}
                    </div>
                    {/* ===== "وفر" - خلفية خضراء + نص أبيض ===== */}
                    <div className="mt-0.5 bg-green-500 rounded-full px-2 py-0.5 inline-block">
                      <span className="text-[9px] font-bold text-white">
                        {t.save} {savedAmount.toFixed(2)} {currencySymbol}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-bold">
                    {t.startingFrom} {minPrice} {currencySymbol}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* ===== محتوى البطاقة ===== */}
        <div className="p-3 flex-grow flex flex-col">
          {/* اسم المكان */}
          <h3 className="text-sm font-bold text-primary line-clamp-1 mb-0.5 group-hover:text-accent transition">
            {venueName}
          </h3>
          
          {/* المدينة */}
          <div className="flex items-center gap-1 text-gray-500 mb-1">
            <MapPin size={12} className="text-gray-400" />
            <span className="text-xs">{cityName || 'غير محدد'}</span>
          </div>
          
          {/* الوصف */}
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 flex-grow mb-2">
            {description || 'لا يوجد وصف متاح'}
          </p>
          
          {/* ===== زر "عرض التفاصيل الكاملة" ===== */}
          <button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-accent hover:to-accent/90 text-white py-2 rounded-xl text-xs font-medium transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 group">
            {pkg.has_multiple_branches ? t.selectBranch : t.viewDetails}
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </Link>
  );
}