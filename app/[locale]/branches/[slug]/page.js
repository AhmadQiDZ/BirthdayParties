'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, ArrowLeft, Users, Star, Building, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatWorkingHours } from '@/lib/utils';
// ❌ حذف: import Header from '@/components/ui/Header';
// ❌ حذف: import Footer from '@/components/ui/Footer';
import WhatsAppPopup from '@/components/ui/WhatsAppPopup';

export default function BranchesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'ar';
  const slug = params?.slug;
  const [packageData, setPackageData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.style.direction = dir;
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
  }, [locale]);

  useEffect(() => {
    if (slug) {
      fetchPackage();
    }
  }, [slug]);

  async function fetchPackage() {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          cities (*),
          package_tiers (*)
        `)
        .eq('id', parseInt(slug))
        .single();

      if (error || !data) {
        console.error('Error fetching package:', error);
        setLoading(false);
        return;
      }

      setPackageData(data);

      const { data: branchesData } = await supabase
        .from('branches')
        .select('*')
        .eq('package_id', data.id)
        .order('name_ar');

      setBranches(branchesData || []);
      
      if (branchesData && branchesData.length > 0) {
        setSelectedBranch(branchesData[0]);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    
    setLoading(false);
  }

  const selectBranch = (branch) => {
    setLoadingBranch(true);
    setSelectedBranch(branch);
    setTimeout(() => {
      setLoadingBranch(false);
    }, 300);
  };

  const texts = {
    ar: {
      back: 'العودة للخلف',
      selectBranch: 'اختر الفرع',
      address: 'العنوان',
      phone: 'الهاتف',
      workingHours: 'ساعات العمل',
      bookNow: 'احجز الآن',
      startingFrom: 'أسعار تبدأ من',
      noBranches: 'لا توجد فروع متاحة',
      noMap: 'لا يوجد رابط للخريطة',
      packages: 'الباقات المتاحة',
      viewDetails: 'عرض التفاصيل',
      branchesTitle: 'الفروع المتاحة',
      location: 'الموقع على الخريطة',
      branchDetails: 'تفاصيل الفرع'
    },
    en: {
      back: 'Go Back',
      selectBranch: 'Select Branch',
      address: 'Address',
      phone: 'Phone',
      workingHours: 'Working Hours',
      bookNow: 'Book Now',
      startingFrom: 'Starting from',
      noBranches: 'No branches available',
      noMap: 'No map link available',
      packages: 'Available Packages',
      viewDetails: 'View Details',
      branchesTitle: 'Available Branches',
      location: 'Location on Map',
      branchDetails: 'Branch Details'
    }
  };

  const t = texts[locale] || texts.ar;

  const getEmbedUrl = (branch) => {
    if (!branch) return null;
    if (branch.map_embed_url) return branch.map_embed_url;
    if (branch.location_map_url) return branch.location_map_url;
    return null;
  };

  const embedUrl = getEmbedUrl(selectedBranch);
  const currencySymbol = getCurrencySymbol(packageData?.currency || 'SAR');

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600 animate-pulse">
            {locale === 'ar' ? 'جاري تحميل الفروع...' : 'Loading branches...'}
          </p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Package not found</p>
      </div>
    );
  }

  const venueName = locale === 'ar' ? packageData.venue_name_ar : packageData.venue_name_en;
  const cityName = locale === 'ar' ? packageData.cities?.name_ar : packageData.cities?.name_en;
  const description = locale === 'ar' ? packageData.description_ar : packageData.description_en;
  const minPrice = packageData.package_tiers?.length > 0 
    ? Math.min(...packageData.package_tiers.map(t => t.price))
    : 0;

  return (
    // ❌ حذف: <Header />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4 md:pt-6">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-600 hover:text-primary transition-all duration-300 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md hover:shadow-xl hover:scale-105"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">{t.back}</span>
        </button>
      </div>

      {/* Package Header */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">{venueName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" /> 
                  {cityName}
                </span>
                {minPrice > 0 && (
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    {t.startingFrom} {minPrice} {currencySymbol}
                  </span>
                )}
                {packageData.rating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    {packageData.rating} ({packageData.reviews_count || 0})
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-2 text-gray-600 text-sm leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            <Link
              href={`/${locale}/package/${packageData.id}`}
              className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition text-sm whitespace-nowrap shadow-md hover:shadow-lg"
            >
              {locale === 'ar' ? 'العودة للباقة' : 'Back to Package'}
            </Link>
          </div>
        </div>
      </div>

      {/* Branches Section */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة الفروع */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Building size={20} className="text-accent" />
                {t.selectBranch}
              </h2>
              
              {branches.length === 0 ? (
                <p className="text-gray-500 text-sm">{t.noBranches}</p>
              ) : (
                <div className="space-y-2">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => selectBranch(branch)}
                      className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                        selectedBranch?.id === branch.id
                          ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <span className={`font-medium text-sm ${
                        selectedBranch?.id === branch.id ? 'text-primary' : 'text-gray-700'
                      }`}>
                        {locale === 'ar' ? branch.name_ar : branch.name_en}
                      </span>
                      {selectedBranch?.id === branch.id && (
                        <span className="text-primary">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* معلومات سريعة عن الباقة */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="space-y-2 text-sm">
                  {packageData.rating > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span>{packageData.rating} ({packageData.reviews_count || 0} {locale === 'ar' ? 'تقييم' : 'reviews'})</span>
                    </div>
                  )}
                  {packageData.booking_count > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={16} className="text-gray-400" />
                      <span>{packageData.booking_count}+ {locale === 'ar' ? 'حجز' : 'bookings'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل الفرع والخريطة */}
          <div className="lg:col-span-2">
            {selectedBranch && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                {loadingBranch ? (
                  <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <MapPin size={22} className="text-accent" />
                      {locale === 'ar' ? selectedBranch.name_ar : selectedBranch.name_en}
                    </h2>

                    {/* الخريطة */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-accent">📍</span> {t.location}
                      </h3>
                      {embedUrl ? (
                        <div className="rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                          <iframe
                            src={embedUrl}
                            width="100%"
                            height="320"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full"
                            title="Location Map"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-[320px] flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">
                          <div className="text-center">
                            <MapPin size={56} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">{t.noMap}</p>
                            <p className="text-xs mt-1 text-gray-300">
                              {locale === 'ar' ? 'أضف رابط الخريطة في لوحة التحكم' : 'Add map link in admin panel'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* تفاصيل الفرع */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span className="text-accent">📋</span> {t.branchDetails}
                        </h3>
                        
                        {selectedBranch.address_ar && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs text-gray-400 block">{t.address}</span>
                              <span className="text-sm text-gray-700">
                                {locale === 'ar' ? selectedBranch.address_ar : selectedBranch.address_en}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {selectedBranch.phone && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Phone size={18} className="text-primary flex-shrink-0" />
                            <div>
                              <span className="text-xs text-gray-400 block">{t.phone}</span>
                              <span className="text-sm text-gray-700" dir="ltr">{selectedBranch.phone}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {selectedBranch.working_hours && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Clock size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs text-gray-400 block">{t.workingHours}</span>
                              <span className="text-sm text-gray-700 whitespace-pre-line">
                                {formatWorkingHours(selectedBranch.working_hours, locale)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {packageData.package_tiers?.length > 0 && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Calendar size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs text-gray-400 block">{t.startingFrom}</span>
                              <span className="text-sm font-bold text-accent">
                                {minPrice} {currencySymbol}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* زر الحجز */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <Link
                        href={`/${locale}/package/${packageData.id}?branch=${selectedBranch.id}`}
                        className="w-full bg-gradient-to-r from-accent to-accent/80 text-white flex items-center justify-center gap-2 py-3.5 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {t.bookNow}
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    // ❌ حذف: <Footer />
    // ❌ حذف: <WhatsAppPopup /> (إذا كان موجوداً في layout أو يجب وضعه هنا)
  );
}