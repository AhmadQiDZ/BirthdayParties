'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, Calendar, Users, Phone, Mail, Send, ChevronLeft, 
  ChevronRight, CheckCircle, ArrowLeft, Star, Clock, Award, 
  Info, Shield, Gift, Sparkles, Crown, Tag, Percent, FileText,
  Heart, Share2, Building, X, ZoomIn, ZoomOut, Download,
  ExternalLink, MessageCircle, ThumbsUp, Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import WhatsAppPopup from '@/components/ui/WhatsAppPopup';

export default function PackageDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const locale = params?.locale || 'ar';
  
  // استخراج citySlug مع التعامل مع قيمة "undefined"
  let citySlug = params?.city || params?.slug || '';
  
  // إذا كانت القيمة "undefined" كـ string، حاول استخراجها من الرابط
  if (citySlug === 'undefined' || citySlug === 'null' || !citySlug) {
    try {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length >= 3) {
        const possibleCity = pathParts[2];
        if (possibleCity && possibleCity !== 'ar' && possibleCity !== 'en' && possibleCity !== 'undefined' && possibleCity !== 'null') {
          citySlug = possibleCity;
          console.log('🔍 Extracted city from URL:', citySlug);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not extract city from URL:', e);
    }
  }
  
  let packageSlug = params?.package || '';
  try {
    packageSlug = decodeURIComponent(packageSlug);
  } catch (e) {
    console.log('⚠️ Could not decode package slug, using original:', packageSlug);
  }
  
  // إذا كان packageSlug هو "undefined"، حاول استخراجه من الرابط
  if (packageSlug === 'undefined' || packageSlug === 'null' || !packageSlug) {
    try {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length >= 4) {
        const possiblePackage = pathParts[3];
        if (possiblePackage && possiblePackage !== 'undefined' && possiblePackage !== 'null') {
          packageSlug = possiblePackage;
          console.log('🔍 Extracted package from URL:', packageSlug);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not extract package from URL:', e);
    }
  }
  
  console.log('🔍 Final Params:', { locale, citySlug, packageSlug });
  
  const branchId = searchParams.get('branch');
  
  const [packageData, setPackageData] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [similarPackages, setSimilarPackages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const modalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    child_count: '',
    booking_date: '',
    note: ''
  });

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

  const createSlug = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const compareSlugs = (slug1, slug2) => {
    const normalizeArabic = (text) => {
      if (!text) return '';
      return text
        .replace(/[أآإ]/g, 'ا')
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئ]/g, 'ي');
    };
    return normalizeArabic(slug1) === normalizeArabic(slug2);
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
    if (citySlug && citySlug !== 'undefined' && citySlug !== 'null' && 
        packageSlug && packageSlug !== 'undefined' && packageSlug !== 'null') {
      fetchPackageData();
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      console.warn('⚠️ Invalid citySlug or packageSlug:', { citySlug, packageSlug });
      if (citySlug === 'undefined' || citySlug === 'null') {
        fetchPackageBySlugOnly();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citySlug, packageSlug, branchId, locale]);

  // ============================================
  // جلب الباقة فقط ثم الحصول على المدينة منها
  // ============================================
  async function fetchPackageBySlugOnly() {
    try {
      console.log('🔍 Trying to find package by slug only:', packageSlug);
      
      // جلب جميع الباقات النشطة
      const { data: packagesList, error } = await supabase
        .from('packages')
        .select(`
          *,
          cities (*),
          package_tiers (*)
        `)
        .eq('status', 'live')
        .is('deleted_at', null);

      if (error) {
        console.error('❌ Error fetching packages:', error);
        router.push(`/${locale}`);
        return;
      }

      // البحث عن الباقة بالـ slug حسب اللغة
      let foundPackage = null;
      
      if (packagesList && packagesList.length > 0) {
        // محاولة مطابقة الـ slug حسب اللغة
        const slugField = locale === 'ar' ? 'slug_ar' : 'slug_en';
        
        foundPackage = packagesList.find(pkg => {
          // 1. مطابقة slug حسب اللغة
          if (pkg[slugField] === packageSlug) return true;
          
          // 2. مطابقة slug العادي
          if (pkg.slug === packageSlug) return true;
          
          // 3. مطابقة الاسم المحول إلى slug (العربي أو الإنجليزي حسب اللغة)
          const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
          const pkgSlug = createSlug(pkgName);
          if (pkgSlug === packageSlug) return true;
          
          // 4. مطابقة slug_ar أو slug_en باستخدام contains
          if (pkg.slug_ar && packageSlug.includes(pkg.slug_ar)) return true;
          if (pkg.slug_en && packageSlug.includes(pkg.slug_en)) return true;
          
          // 5. مطابقة بعد تطبيع الحروف العربية
          if (compareSlugs(pkgSlug, packageSlug)) return true;
          
          // 6. مطابقة الاسم الكامل مع استبدال الشرطات بمسافات
          const normalizedPkgName = pkgName?.toLowerCase().trim().replace(/\s+/g, '-') || '';
          const normalizedPackageSlug = packageSlug.replace(/-/g, ' ');
          if (normalizedPkgName === normalizedPackageSlug) return true;
          if (normalizedPkgName === packageSlug) return true;
          
          // 7. مطابقة جزء من الاسم
          const searchTerms = packageSlug.replace(/-/g, ' ').toLowerCase().split(' ');
          const nameTerms = pkgName?.toLowerCase().split(' ') || [];
          const matchCount = searchTerms.filter(term => 
            nameTerms.some(nameTerm => nameTerm.includes(term) || term.includes(nameTerm))
          ).length;
          if (matchCount >= Math.min(searchTerms.length, 2)) return true;
          
          return false;
        });

        // إذا لم يتم العثور، محاولة البحث بالاسم
        if (!foundPackage) {
          const packageName = packageSlug.replace(/-/g, ' ');
          foundPackage = packagesList.find(pkg => {
            const name = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
            return name && name.toLowerCase().includes(packageName.toLowerCase());
          });
        }
        
        // إذا لم يتم العثور، محاولة البحث في الاسم العربي والإنجليزي معاً
        if (!foundPackage) {
          const packageName = packageSlug.replace(/-/g, ' ');
          foundPackage = packagesList.find(pkg => {
            const nameAr = pkg.venue_name_ar || '';
            const nameEn = pkg.venue_name_en || '';
            return nameAr.toLowerCase().includes(packageName.toLowerCase()) ||
                   nameEn.toLowerCase().includes(packageName.toLowerCase());
          });
        }
      }

      if (!foundPackage) {
        console.error('❌ Package not found:', packageSlug);
        router.push(`/${locale}`);
        return;
      }

      // الحصول على المدينة من الباقة
      const citySlugFromPackage = foundPackage.cities?.slug || 
                                  foundPackage.cities?.slug_ar || 
                                  foundPackage.cities?.slug_en ||
                                  foundPackage.cities?.name_en?.toLowerCase().replace(/\s+/g, '-');
      
      if (!citySlugFromPackage) {
        console.error('❌ City not found for package');
        router.push(`/${locale}`);
        return;
      }

      console.log('✅ Found package in city:', citySlugFromPackage);
      
      // الحصول على الـ slug الصحيح للباقة حسب اللغة
      const correctPackageSlug = locale === 'ar' 
        ? (foundPackage.slug_ar || createSlug(foundPackage.venue_name_ar))
        : (foundPackage.slug_en || createSlug(foundPackage.venue_name_en));
      
      // إعادة التوجيه إلى الرابط الصحيح مع المدينة
      const newPath = `/${locale}/${citySlugFromPackage}/${correctPackageSlug}`;
      console.log('🔄 Redirecting to:', newPath);
      router.replace(newPath);
      
    } catch (err) {
      console.error('❌ Error in fetchPackageBySlugOnly:', err);
      router.push(`/${locale}`);
    }
  }

  // ============================================
  // جلب بيانات الباقة
  // ============================================
  async function fetchPackageData() {
    setLoading(true);
    setPackageData(null);
    setCityData(null);
    setBranches([]);
    setSelectedBranch(null);
    setSelectedTier(null);
    setSimilarPackages([]);
    setReviews([]);
    setCurrentImageIndex(0);
    setImageLoading(true);
    setIsImageModalOpen(false);
    setIsZoomed(false);
    setSubmitted(false);
    setBookingError('');

    try {
      if (!citySlug || citySlug === 'undefined' || citySlug === 'null') {
        console.error('❌ City slug is invalid:', citySlug);
        setLoading(false);
        return;
      }

      // ========== جلب المدينة ==========
      let city = null;
      
      console.log('🔍 Searching for city with slug:', citySlug);
      
      // محاولة البحث باستخدام العمود slug أولاً
      const { data: cityBySlug, error: errorBySlug } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', citySlug)
        .single();
      
      if (!errorBySlug && cityBySlug) {
        city = cityBySlug;
        console.log('✅ City found by slug:', city.name_ar);
      } else {
        // إذا لم يتم العثور، حاول البحث باستخدام slug_ar أو slug_en حسب اللغة
        const slugColumn = locale === 'ar' ? 'slug_ar' : 'slug_en';
        console.log('🔍 Trying with column:', slugColumn);
        const { data: cityByLangSlug, error: errorByLangSlug } = await supabase
          .from('cities')
          .select('*')
          .eq(slugColumn, citySlug)
          .single();
        
        if (!errorByLangSlug && cityByLangSlug) {
          city = cityByLangSlug;
          console.log('✅ City found by language slug:', city.name_ar);
        } else {
          // محاولة البحث باستخدام الاسم
          const nameColumn = locale === 'ar' ? 'name_ar' : 'name_en';
          const searchName = citySlug.replace(/-/g, ' ');
          console.log('🔍 Trying with name:', searchName);
          const { data: cityByName, error: errorByName } = await supabase
            .from('cities')
            .select('*')
            .eq(nameColumn, searchName)
            .single();
          
          if (!errorByName && cityByName) {
            city = cityByName;
            console.log('✅ City found by name:', city.name_ar);
          } else {
            // محاولة البحث باستخدام LIKE
            console.log('🔍 Trying LIKE search...');
            const { data: cityByLike, error: errorByLike } = await supabase
              .from('cities')
              .select('*')
              .or(`slug.ilike.%${citySlug}%,slug_ar.ilike.%${citySlug}%,slug_en.ilike.%${citySlug}%,name_ar.ilike.%${citySlug}%,name_en.ilike.%${citySlug}%`)
              .limit(1);
            
            if (!errorByLike && cityByLike && cityByLike.length > 0) {
              city = cityByLike[0];
              console.log('✅ City found by LIKE:', city.name_ar);
            } else {
              console.error('❌ City not found for slug:', citySlug);
              await fetchPackageBySlugOnly();
              setLoading(false);
              return;
            }
          }
        }
      }

      if (!city) {
        console.error('❌ City not found');
        await fetchPackageBySlugOnly();
        setLoading(false);
        return;
      }

      setCityData(city);

      // ========== جلب الباقات ==========
      const { data: packagesList, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          cities (*),
          package_tiers (*)
        `)
        .eq('city_id', city.id)
        .eq('status', 'live')
        .is('deleted_at', null);

      if (packagesError) {
        console.error('❌ Error fetching packages:', packagesError);
        setLoading(false);
        return;
      }

      // ========== البحث عن الباقة المطلوبة ==========
      let foundPackage = null;
      
      if (packagesList && packagesList.length > 0) {
        // تحديد الحقل المناسب للبحث حسب اللغة
        const slugField = locale === 'ar' ? 'slug_ar' : 'slug_en';
        
        console.log('🔍 Searching for package with slug:', packageSlug);
        console.log('🔍 Using slug field:', slugField);
        
        // 1. محاولة مطابقة الـ slug حسب اللغة (الأفضل)
        foundPackage = packagesList.find(pkg => pkg[slugField] === packageSlug);
        
        if (foundPackage) {
          console.log('✅ Package found by language-specific slug:', slugField, '=', packageSlug);
        } else {
          // 2. محاولة مطابقة الـ slug العادي
          foundPackage = packagesList.find(pkg => pkg.slug === packageSlug);
          if (foundPackage) {
            console.log('✅ Package found by generic slug');
          } else {
            // 3. محاولة مطابقة الاسم المحول إلى slug
            foundPackage = packagesList.find(pkg => {
              const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
              const pkgSlug = createSlug(pkgName);
              return pkgSlug === packageSlug;
            });
            if (foundPackage) {
              console.log('✅ Package found by generated slug from name');
            } else {
              // 4. محاولة مطابقة slug_ar أو slug_en باستخدام contains
              foundPackage = packagesList.find(pkg => {
                if (pkg.slug_ar && packageSlug.includes(pkg.slug_ar)) return true;
                if (pkg.slug_en && packageSlug.includes(pkg.slug_en)) return true;
                return false;
              });
              if (foundPackage) {
                console.log('✅ Package found by slug contains match');
              } else {
                // 5. محاولة مطابقة بعد تطبيع الحروف العربية
                foundPackage = packagesList.find(pkg => {
                  const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
                  const pkgSlug = createSlug(pkgName);
                  return compareSlugs(pkgSlug, packageSlug);
                });
                if (foundPackage) {
                  console.log('✅ Package found by normalized slug');
                } else {
                  // 6. محاولة مطابقة الاسم الكامل
                  const packageName = packageSlug.replace(/-/g, ' ');
                  foundPackage = packagesList.find(pkg => {
                    const name = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
                    return name && name.toLowerCase().includes(packageName.toLowerCase());
                  });
                  if (foundPackage) {
                    console.log('✅ Package found by name match');
                  } else {
                    // 7. محاولة البحث في الاسم العربي والإنجليزي معاً
                    const packageName = packageSlug.replace(/-/g, ' ');
                    foundPackage = packagesList.find(pkg => {
                      const nameAr = pkg.venue_name_ar || '';
                      const nameEn = pkg.venue_name_en || '';
                      return nameAr.toLowerCase().includes(packageName.toLowerCase()) ||
                             nameEn.toLowerCase().includes(packageName.toLowerCase());
                    });
                    if (foundPackage) {
                      console.log('✅ Package found by name match (AR/EN)');
                    } else {
                      // 8. محاولة البحث باستخدام LIKE على slug_ar و slug_en
                      console.log('🔍 Trying LIKE search on slugs...');
                      const { data: likeResult, error: likeError } = await supabase
                        .from('packages')
                        .select(`
                          *,
                          cities (*),
                          package_tiers (*)
                        `)
                        .eq('city_id', city.id)
                        .eq('status', 'live')
                        .is('deleted_at', null)
                        .or(`slug_ar.ilike.%${packageSlug}%,slug_en.ilike.%${packageSlug}%,slug.ilike.%${packageSlug}%`)
                        .limit(1);
                      
                      if (!likeError && likeResult && likeResult.length > 0) {
                        foundPackage = likeResult[0];
                        console.log('✅ Package found by LIKE search on slugs');
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (!foundPackage) {
        console.error('❌ Package not found in city:', packageSlug);
        // محاولة البحث عن الباقة في جميع المدن
        await fetchPackageBySlugOnly();
        setLoading(false);
        return;
      }

      // التحقق من أن المدينة في الباقة تطابق citySlug
      const packageCitySlug = foundPackage.cities?.slug || 
                             foundPackage.cities?.slug_ar || 
                             foundPackage.cities?.slug_en ||
                             foundPackage.cities?.name_en?.toLowerCase().replace(/\s+/g, '-');
      
      // إذا كانت المدينة مختلفة، قم بإعادة التوجيه
      if (packageCitySlug && packageCitySlug !== citySlug) {
        // التحقق مما إذا كانت المدينة متطابقة بعد التطبيع
        const isMatching = compareSlugs(packageCitySlug, citySlug);
        if (!isMatching) {
          console.log('🔄 Package belongs to different city, redirecting...');
          // الحصول على الـ slug الصحيح للباقة حسب اللغة
          const correctSlug = locale === 'ar' 
            ? (foundPackage.slug_ar || createSlug(foundPackage.venue_name_ar))
            : (foundPackage.slug_en || createSlug(foundPackage.venue_name_en));
          const newPath = `/${locale}/${packageCitySlug}/${correctSlug}`;
          router.replace(newPath);
          setLoading(false);
          return;
        }
      }

      console.log('✅ Package found:', foundPackage.venue_name_ar || foundPackage.venue_name_en);
      setPackageData(foundPackage);
      await loadPackageDetails(foundPackage);
      
    } catch (err) {
      console.error('❌ Error fetching package data:', err);
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // تحميل تفاصيل الباقة
  // ============================================
  async function loadPackageDetails(pkg) {
    if (!pkg) return;
    
    if (pkg.package_tiers?.length > 0) {
      setSelectedTier(pkg.package_tiers[0]);
    }
    
    const { data: branchesData } = await supabase
      .from('branches')
      .select('*')
      .eq('package_id', pkg.id)
      .order('name_ar');
    
    setBranches(branchesData || []);
    
    if (branchId && branchesData) {
      const found = branchesData.find(b => b.id === parseInt(branchId));
      setSelectedBranch(found || null);
    } else if (branchesData && branchesData.length === 1) {
      setSelectedBranch(branchesData[0]);
    }
    
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('package_id', pkg.id)
      .order('created_at', { ascending: false })
      .limit(6);
    
    setReviews(reviewsData || []);
    
    if (pkg.city_id) {
      const { data: similar } = await supabase
        .from('packages')
        .select(`
          *,
          cities (*),
          package_tiers (*)
        `)
        .eq('city_id', pkg.city_id)
        .eq('status', 'live')
        .is('deleted_at', null)
        .neq('id', pkg.id)
        .limit(4);

      if (similar) {
        setSimilarPackages(similar);
      }
    }
    
    updateSEOMetadata(pkg, cityData);
  }

  // ============================================
  // تحسين SEO
  // ============================================
  function updateSEOMetadata(data, city) {
    const cityName = locale === 'ar' ? city?.name_ar : city?.name_en;
    const venueName = locale === 'ar' ? data.venue_name_ar : data.venue_name_en;
    const description = locale === 'ar' ? data.description_ar : data.description_en;
    
    document.title = `${venueName} | ${cityName || 'أفضل الأماكن'} | theQapp`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = description?.replace(/<[^>]*>/g, '').slice(0, 160) || '';
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.content = locale === 'ar'
        ? (data.seo_keywords_ar || `${venueName}, ${cityName}, حجوزات أطفال, أماكن ترفيهية`)
        : (data.seo_keywords_en || `${venueName}, ${cityName}, children bookings, entertainment venues`);
    }
  }

  // ============================================
  // إرسال الحجز
  // ============================================
  async function handleSubmit(e) {
    e.preventDefault();
    setBookingError('');
    setSubmitting(true);
    
    if (!selectedTier) {
      setBookingError(locale === 'ar' ? 'الرجاء اختيار باقة أولاً' : 'Please select a package first');
      setSubmitting(false);
      return;
    }
    
    if (!formData.customer_name || formData.customer_name.trim() === '') {
      setBookingError(locale === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name');
      setSubmitting(false);
      return;
    }
    
    if (!formData.phone || formData.phone.trim() === '') {
      setBookingError(locale === 'ar' ? 'الرجاء إدخال رقم الجوال' : 'Please enter your phone number');
      setSubmitting(false);
      return;
    }
    
    if (!formData.child_count || parseInt(formData.child_count) < 1) {
      setBookingError(locale === 'ar' ? 'الرجاء إدخال عدد الأطفال' : 'Please enter number of children');
      setSubmitting(false);
      return;
    }
    
    if (!formData.booking_date) {
      setBookingError(locale === 'ar' ? 'الرجاء اختيار تاريخ الحجز' : 'Please select a booking date');
      setSubmitting(false);
      return;
    }
    
    const bookingData = {
      package_id: packageData.id,
      package_tier_id: selectedTier?.id || null,
      branch_id: selectedBranch?.id || null,
      customer_name: formData.customer_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email?.trim() || null,
      child_count: parseInt(formData.child_count),
      booking_date: formData.booking_date,
      customer_note: formData.note?.trim() || null,
      admin_note: null,
      status: 'pending'
    };
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select();

      if (error) {
        console.error('❌ Booking error:', error);
        setBookingError(locale === 'ar' ? 'حدث خطأ في الحجز. الرجاء المحاولة مرة أخرى.' : 'Booking error. Please try again.');
        setSubmitting(false);
        return;
      }
      
      if (packageData) {
        await supabase
          .from('packages')
          .update({ booking_count: (packageData.booking_count || 0) + 1 })
          .eq('id', packageData.id);
      }
      
      setSubmitted(true);
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        child_count: '',
        booking_date: '',
        note: ''
      });
      
    } catch (err) {
      console.error('❌ Submit error:', err);
      setBookingError(locale === 'ar' ? 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.' : 'Unexpected error. Please try again.');
    }
    
    setSubmitting(false);
  }

  // ============================================
  // دوال معرض الصور
  // ============================================
  const nextImage = () => {
    if (packageData?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % packageData.images.length);
      setImageLoading(true);
    }
  };

  const prevImage = () => {
    if (packageData?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + packageData.images.length) % packageData.images.length);
      setImageLoading(true);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
    setImageLoading(true);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextImage();
    }
    if (touchStart - touchEnd < -50) {
      prevImage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsImageModalOpen(false);
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  const goBack = () => {
    router.back();
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('embed')) return url;
    if (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
      return url;
    }
    if (url.includes('maps.google.com')) {
      const latMatch = url.match(/@([0-9.-]+),([0-9.-]+)/);
      if (latMatch) {
        const lat = latMatch[1];
        const lng = latMatch[2];
        return `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d0!2d${lng}!3d${lat}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z0LzQu9Cw0LQ!5e0!3m2!1sen!2ssa!4v${Date.now()}`;
      }
    }
    return url;
  };

  const getMapUrl = () => {
    if (selectedBranch?.map_embed_url) return selectedBranch.map_embed_url;
    if (selectedBranch?.location_map_url) return selectedBranch.location_map_url;
    if (packageData?.map_embed_url) return packageData.map_embed_url;
    if (packageData?.location_map_url) return packageData.location_map_url;
    return null;
  };

  const mapUrl = getMapUrl();
  const embedUrl = convertToEmbedUrl(mapUrl);
  const currencySymbol = getCurrencySymbol(packageData?.currency || 'SAR');

  // ============================================
  // النصوص
  // ============================================
  const texts = {
    ar: {
      pageTitle: 'تفاصيل الباقة',
      aboutVenue: 'عن المكان',
      location: 'الموقع على الخريطة',
      terms: 'الشروط والأحكام',
      bookNow: 'احجز الآن',
      selectPackage: 'اختر الباقة المناسبة',
      startingFrom: 'تبدأ الأسعار من',
      save: 'وفر',
      discount: 'خصم',
      childrenLabel: 'طفل',
      maxChildren: 'الحد الأقصى للأطفال',
      bookingForm: 'نموذج الحجز',
      name: 'الاسم الكامل',
      phone: 'رقم الجوال',
      email: 'البريد الإلكتروني (اختياري)',
      children: 'عدد الأطفال',
      date: 'تاريخ الحجز',
      note: 'ملاحظات إضافية (اختياري)',
      submit: 'إرسال طلب الحجز',
      submitting: 'جاري الإرسال...',
      success: 'تم استلام طلب الحجز بنجاح! 🎉',
      successMessage: 'سيتواصل معكم فريقنا خلال دقائق (من 8 صباحاً إلى 12 ليلاً)',
      newBooking: 'حجز جديد',
      showOnMap: 'عرض الموقع على خرائط جوجل',
      address: 'العنوان',
      workingHours: 'ساعات العمل',
      phoneNumber: 'رقم الهاتف',
      similarPackages: 'باقات مشابهة قد تعجبك',
      viewDetails: 'عرض التفاصيل',
      reviews: 'آراء وتقييمات العملاء',
      verified: 'تم التحقق',
      bookingCount: 'حجز سابق',
      branch: 'الفرع',
      selectBranch: 'اختر الفرع',
      multipleBranches: 'فروع متعددة',
      allBranches: 'جميع الفروع',
      branchCount: 'فرع متاح',
      branchCountPlural: 'فروع متاحة',
      viewOnMap: 'عرض على الخريطة',
      noBranchSelected: 'بدون فرع محدد',
      featured: 'مميز',
      popular: 'الأكثر طلباً',
      back: 'العودة',
      backToCity: 'العودة للمدينة',
      share: 'مشاركة',
      favorite: 'إضافة للمفضلة',
      images: 'معرض الصور',
      noImages: 'لا توجد صور متاحة',
      closeGallery: 'إغلاق المعرض',
      downloadImage: 'تحميل الصورة',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      error: 'حدث خطأ',
      requiredField: 'هذا الحقل مطلوب'
    },
    en: {
      pageTitle: 'Package Details',
      aboutVenue: 'About the Venue',
      location: 'Location on Map',
      terms: 'Terms & Conditions',
      bookNow: 'Book Now',
      selectPackage: 'Select Your Package',
      startingFrom: 'Starting from',
      save: 'Save',
      discount: 'Discount',
      childrenLabel: 'children',
      maxChildren: 'Max Children',
      bookingForm: 'Booking Form',
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email (Optional)',
      children: 'Number of Children',
      date: 'Booking Date',
      note: 'Additional Notes (Optional)',
      submit: 'Submit Booking Request',
      submitting: 'Submitting...',
      success: 'Booking Request Received! 🎉',
      successMessage: 'Our team will contact you within minutes (8 AM - 12 AM)',
      newBooking: 'New Booking',
      showOnMap: 'View on Google Maps',
      address: 'Address',
      workingHours: 'Working Hours',
      phoneNumber: 'Phone Number',
      similarPackages: 'Similar Packages You Might Like',
      viewDetails: 'View Details',
      reviews: 'Customer Reviews',
      verified: 'Verified',
      bookingCount: 'Previous Bookings',
      branch: 'Branch',
      selectBranch: 'Select Branch',
      multipleBranches: 'Multiple Branches',
      allBranches: 'All Branches',
      branchCount: 'branch available',
      branchCountPlural: 'branches available',
      viewOnMap: 'View on Map',
      noBranchSelected: 'No branch selected',
      featured: 'Featured',
      popular: 'Most Popular',
      back: 'Back',
      backToCity: 'Back to City',
      share: 'Share',
      favorite: 'Add to Favorites',
      images: 'Image Gallery',
      noImages: 'No images available',
      closeGallery: 'Close Gallery',
      downloadImage: 'Download Image',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      error: 'Error',
      requiredField: 'This field is required'
    }
  };

  const t = texts[locale] || texts.ar;

  // ============================================
  // حالات التحميل والأخطاء
  // ============================================
  if (!citySlug || citySlug === 'undefined' || citySlug === 'null') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl md:text-7xl mb-4 md:mb-6">🏙️</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
            {locale === 'ar' ? 'جاري البحث عن الباقة...' : 'Searching for package...'}
          </h2>
          <p className="text-gray-500 mb-6 text-sm md:text-base">
            {locale === 'ar' 
              ? 'جاري العثور على المدينة الصحيحة للباقة' 
              : 'Finding the correct city for this package'}
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 border-primary border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          </div>
          <p className="text-gray-600 animate-pulse font-medium text-sm md:text-base">
            {locale === 'ar' ? 'جاري تحميل الباقة...' : 'Loading package...'}
          </p>
        </div>
      </div>
    );
  }

  if (!packageData || !cityData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl md:text-7xl mb-4 md:mb-6">🔍</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
            {locale === 'ar' ? 'عذراً! لم نجد هذه الباقة' : 'Sorry! Package not found'}
          </h2>
          <p className="text-gray-500 mb-6 text-sm md:text-base">
            {locale === 'ar' 
              ? 'قد تكون الباقة غير متاحة حالياً أو تم حذفها' 
              : 'The package may be unavailable or has been removed'}
          </p>
          <Link href={`/${locale}`} className="inline-block bg-primary text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl hover:bg-primary/90 transition text-sm md:text-base">
            {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // المتغيرات المحسوبة
  // ============================================
  const venueName = locale === 'ar' ? packageData.venue_name_ar : packageData.venue_name_en;
  const description = locale === 'ar' ? packageData.description_ar : packageData.description_en;
  const terms = locale === 'ar' ? packageData.terms_ar : packageData.terms_en;
  const cityName = locale === 'ar' ? cityData.name_ar : cityData.name_en;
  const hasImages = packageData.images && packageData.images.length > 0;
  const images = packageData.images || [];
  const safeImageIndex = hasImages ? Math.min(currentImageIndex, images.length - 1) : 0;
  const minPrice = packageData.package_tiers?.length > 0 
    ? Math.min(...packageData.package_tiers.map(t => t.price))
    : 0;
  const rating = packageData.rating || 0;
  const reviewsCount = packageData.reviews_count || 0;
  const bookingCount = packageData.booking_count || 0;
  const firstTier = packageData.package_tiers?.[0];
  const hasDiscount = firstTier?.price_before_discount > 0 && firstTier?.price_before_discount > firstTier?.price;
  const discountPercent = hasDiscount 
    ? Math.round(((firstTier.price_before_discount - firstTier.price) / firstTier.price_before_discount) * 100)
    : 0;

  const getPackageLink = (pkg) => {
    const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
    // استخدام slug حسب اللغة إذا كان موجوداً
    const pkgSlug = locale === 'ar' 
      ? (pkg.slug_ar || createSlug(pkgName))
      : (pkg.slug_en || createSlug(pkgName));
    return `/${locale}/${citySlug}/${pkgSlug}`;
  };

  // ============================================
  // التصميم (UI) - باقي الكود كما هو
  // ============================================
  return (
    <article className="min-h-screen bg-gradient-to-br from-gray-50 to-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* ... باقي التصميم كما هو ... */}
      {/* ملاحظة: تم حذف باقي التصميم للاختصار، ولكن يجب أن يبقى كما هو من النسخة السابقة */}
      
      <div className="container mx-auto px-3 md:px-4 pt-3 md:pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
          <button
            onClick={goBack}
            className="group flex items-center gap-1.5 md:gap-2 text-gray-600 hover:text-primary transition-all duration-300 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-md hover:shadow-xl hover:scale-105 text-xs md:text-sm"
            aria-label={t.back}
          >
            <ArrowLeft size={14} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t.back}</span>
          </button>
          
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1.5 md:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label={t.favorite}
            >
              <Heart size={16} className={`md:w-[20px] md:h-[20px] ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: venueName,
                    text: description?.replace(/<[^>]*>/g, '') || '',
                    url: window.location.href
                  });
                }
              }}
              className="p-1.5 md:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label={t.share}
            >
              <Share2 size={16} className="md:w-[20px] md:h-[20px] text-gray-600" />
            </button>
            <Link
              href={`/${locale}/${citySlug}`}
              className="flex items-center gap-1.5 md:gap-2 text-gray-600 hover:text-primary transition-all duration-300 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-md hover:shadow-xl hover:scale-105 text-xs md:text-sm"
            >
              <span className="font-medium">{t.backToCity}</span>
            </Link>
          </div>
        </div>
      </div>

      <header className="container mx-auto px-3 md:px-4 py-3 md:py-6">
        <div className="relative rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 shadow-2xl group">
          {hasImages ? (
            <>
              <div className="relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/8]">
                <Image
                  src={images[safeImageIndex]}
                  alt={`${venueName} - صورة رقم ${safeImageIndex + 1}`}
                  fill
                  className="object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
                  onClick={() => setIsImageModalOpen(true)}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 lg:p-8 text-white">
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                    {packageData.featured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg animate-pulse">
                        ⭐ {t.featured}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg flex items-center gap-0.5 md:gap-1">
                        <Percent size={10} className="md:w-[12px] md:h-[12px]" /> {discountPercent}% {t.discount}
                      </span>
                    )}
                    {packageData.popular && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg">
                        🔥 {t.popular}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-lg md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 md:mb-2 text-shadow-lg">
                    {venueName}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm opacity-90">
                    <Link href={`/${locale}/${citySlug}`} className="flex items-center gap-0.5 md:gap-1 hover:underline">
                      <MapPin size={12} className="md:w-[16px] md:h-[16px]" /> {cityName}
                    </Link>
                    {rating > 0 && (
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <Star size={12} className="md:w-[16px] md:h-[16px] fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{rating}</span>
                        <span className="text-gray-300">({reviewsCount})</span>
                      </span>
                    )}
                    {bookingCount > 0 && (
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <Users size={12} className="md:w-[16px] md:h-[16px]" />
                        {bookingCount}+ {t.bookingCount}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-black/60 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 md:gap-2">
                  <Eye size={10} className="md:w-[12px] md:h-[12px]" />
                  {safeImageIndex + 1} / {images.length}
                </div>
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                      aria-label="الصورة السابقة"
                    >
                      <ChevronLeft size={16} className="md:w-[24px] md:h-[24px]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                      aria-label="الصورة التالية"
                    >
                      <ChevronRight size={16} className="md:w-[24px] md:h-[24px]" />
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="absolute bottom-16 md:bottom-20 right-2 md:right-4 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition-all hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  aria-label="تكبير الصورة"
                >
                  <ZoomIn size={14} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-1.5 md:gap-2 p-2 md:p-3 bg-white/95 backdrop-blur-sm overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToImage(idx)}
                      className={`flex-shrink-0 w-12 h-9 md:w-16 md:h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                        idx === safeImageIndex 
                          ? 'ring-2 ring-primary shadow-lg scale-105' 
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                      aria-label={`الانتقال إلى الصورة ${idx + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`صورة مصغرة ${idx + 1}`}
                        width={80}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-gray-500 text-center p-4 md:p-8">
                <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs md:text-sm font-medium">{t.noImages}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {minPrice > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-2.5 md:p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-500">{t.startingFrom}</p>
                  {hasDiscount ? (
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-gray-400 line-through text-[10px] md:text-sm">
                        {firstTier.price_before_discount} {currencySymbol}
                      </span>
                      <span className="text-base md:text-2xl font-bold text-accent">
                        {minPrice} {currencySymbol}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base md:text-2xl font-bold text-accent">
                      {minPrice} {currencySymbol}
                    </span>
                  )}
                </div>
                <div className="text-2xl md:text-4xl opacity-20">💰</div>
              </div>
            </div>
          )}
          
          {rating > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-2.5 md:p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-500">{t.reviews}</p>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-base md:text-2xl font-bold text-yellow-500">{rating}</span>
                    <span className="text-[10px] md:text-sm text-gray-400">/ 5.0</span>
                    <span className="text-[8px] md:text-xs text-gray-400">({reviewsCount})</span>
                  </div>
                </div>
                <div className="text-2xl md:text-4xl opacity-20">⭐</div>
              </div>
            </div>
          )}
          
          {bookingCount > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-2.5 md:p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-500">{t.bookingCount}</p>
                  <span className="text-base md:text-2xl font-bold text-primary">{bookingCount}+</span>
                </div>
                <div className="text-2xl md:text-4xl opacity-20">🎯</div>
              </div>
            </div>
          )}
          
          {branches.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-2.5 md:p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-500">{t.branch}</p>
                  <span className="text-base md:text-lg font-bold text-primary">
                    {branches.length} {branches.length === 1 ? t.branchCount : t.branchCountPlural}
                  </span>
                </div>
                <div className="text-2xl md:text-4xl opacity-20">📍</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            
            <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
                <Info size={20} className="md:w-[24px] md:h-[24px] text-accent" />
                {t.aboutVenue}
              </h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                <p className="whitespace-pre-line text-sm md:text-base">
                  {description || 'لا يوجد وصف متاح لهذا المكان'}
                </p>
              </div>
            </section>

            {branches.length > 1 && (
              <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-primary flex items-center gap-2">
                    <Building size={20} className="md:w-[24px] md:h-[24px] text-accent" />
                    {t.selectBranch}
                  </h2>
                  <span className="text-[10px] md:text-xs bg-primary/10 text-primary px-2 md:px-3 py-0.5 md:py-1 rounded-full font-medium">
                    {branches.length} {t.branchCountPlural}
                  </span>
                </div>
                
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 snap-x snap-mandatory">
                  <button
                    onClick={() => setSelectedBranch(null)}
                    className={`flex-shrink-0 snap-start min-w-[150px] md:min-w-[200px] max-w-[180px] md:max-w-[240px] rounded-xl border-2 p-2.5 md:p-3.5 transition-all duration-300 text-start group ${
                      selectedBranch === null
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:border-primary/40 hover:shadow-md hover:scale-[1.01] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedBranch === null
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                        <MapPin size={14} className="md:w-[18px] md:h-[18px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-xs md:text-sm truncate transition-colors ${
                          selectedBranch === null ? 'text-primary' : 'text-gray-700'
                        }`}>
                          {t.allBranches}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                          {locale === 'ar' ? 'عرض الباقات لجميع الفروع' : 'Show packages for all branches'}
                        </p>
                      </div>
                    </div>
                    {selectedBranch === null && (
                      <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                        <CheckCircle size={12} className="md:w-[14px] md:h-[14px] text-primary" />
                        <span className="text-[10px] md:text-xs text-primary font-medium">{locale === 'ar' ? 'محدد' : 'Selected'}</span>
                      </div>
                    )}
                  </button>

                  {branches.map((branch) => {
                    const isSelected = selectedBranch?.id === branch.id;
                    const branchName = locale === 'ar' ? branch.name_ar : branch.name_en;
                    const branchAddress = locale === 'ar' ? branch.address_ar : branch.address_en;
                    const hasMap = branch.map_embed_url || branch.location_map_url;
                    
                    return (
                      <button
                        key={branch.id}
                        onClick={() => setSelectedBranch(isSelected ? null : branch)}
                        className={`flex-shrink-0 snap-start min-w-[150px] md:min-w-[200px] max-w-[180px] md:max-w-[240px] rounded-xl border-2 p-2.5 md:p-3.5 transition-all duration-300 text-start group relative ${
                          isSelected
                            ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md scale-[1.02]'
                            : 'border-gray-200 hover:border-primary/40 hover:shadow-md hover:scale-[1.01] bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 bg-primary text-white rounded-full p-0.5 shadow-lg z-10">
                            <CheckCircle size={10} className="md:w-[14px] md:h-[14px]" />
                          </div>
                        )}
                        
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                          }`}>
                            <Building size={14} className="md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-xs md:text-sm truncate transition-colors ${
                              isSelected ? 'text-primary' : 'text-gray-700'
                            }`}>
                              {branchName}
                            </p>
                            {branchAddress && (
                              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 line-clamp-2 leading-relaxed">
                                {branchAddress}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-1.5 md:mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1 md:gap-2">
                            {branch.phone && (
                              <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-0.5 md:gap-1">
                                <Phone size={8} className="md:w-[10px] md:h-[10px]" />
                                <span dir="ltr">{branch.phone}</span>
                              </span>
                            )}
                          </div>
                          {hasMap && (
                            <span className={`text-[10px] md:text-xs flex items-center gap-0.5 transition-colors ${
                              isSelected ? 'text-primary' : 'text-gray-400'
                            }`}>
                              <MapPin size={8} className="md:w-[10px] md:h-[10px]" />
                              {t.viewOnMap}
                            </span>
                          )}
                        </div>

                        {branch.working_hours && (
                          <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-gray-100">
                            <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-0.5 md:gap-1">
                              <Clock size={8} className="md:w-[10px] md:h-[10px]" />
                              {branch.working_hours}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedBranch && (
                  <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building size={18} className="md:w-[22px] md:h-[22px] text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-primary text-sm md:text-base">
                          {locale === 'ar' ? selectedBranch.name_ar : selectedBranch.name_en}
                        </h4>
                        {selectedBranch.address_ar && (
                          <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1 flex items-start gap-1 md:gap-1.5">
                            <MapPin size={12} className="md:w-[14px] md:h-[14px] text-gray-400 mt-0.5 flex-shrink-0" />
                            {locale === 'ar' ? selectedBranch.address_ar : selectedBranch.address_en}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1.5 md:mt-2">
                          {selectedBranch.phone && (
                            <a
                              href={`tel:${selectedBranch.phone}`}
                              className="text-xs md:text-sm text-primary hover:text-accent transition flex items-center gap-1 md:gap-1.5"
                            >
                              <Phone size={12} className="md:w-[14px] md:h-[14px]" />
                              <span dir="ltr">{selectedBranch.phone}</span>
                            </a>
                          )}
                          {selectedBranch.working_hours && (
                            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1 md:gap-1.5">
                              <Clock size={12} className="md:w-[14px] md:h-[14px]" />
                              {selectedBranch.working_hours}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {packageData.package_tiers?.length > 0 && (
              <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
                  <Gift size={20} className="md:w-[24px] md:h-[24px] text-accent" />
                  {t.selectPackage}
                  {selectedBranch && (
                    <span className="text-xs md:text-sm font-normal text-gray-400 mr-1 md:mr-2">
                      — {locale === 'ar' ? selectedBranch.name_ar : selectedBranch.name_en}
                    </span>
                  )}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {packageData.package_tiers.map((tier) => {
                    const hasTierDiscount = tier.price_before_discount > 0 && tier.price_before_discount > tier.price;
                    const discountPercentTier = hasTierDiscount 
                      ? Math.round(((tier.price_before_discount - tier.price) / tier.price_before_discount) * 100)
                      : 0;
                    
                    return (
                      <div
                        key={tier.id}
                        className={`group relative border-2 rounded-xl p-3 md:p-5 cursor-pointer transition-all duration-300 ${
                          selectedTier?.id === tier.id
                            ? 'border-accent bg-gradient-to-br from-accent/10 to-white shadow-lg scale-[1.02]'
                            : 'border-gray-200 hover:border-primary hover:shadow-lg hover:scale-[1.02]'
                        }`}
                        onClick={() => setSelectedTier(tier)}
                      >
                        {selectedTier?.id === tier.id && (
                          <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-accent text-white rounded-full p-0.5 md:p-1 shadow-lg">
                            <CheckCircle size={12} className="md:w-[16px] md:h-[16px]" />
                          </div>
                        )}
                        
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                              <h3 className="font-bold text-base md:text-lg text-primary">
                                {locale === 'ar' ? tier.name_ar : tier.name_en}
                              </h3>
                              {hasTierDiscount && (
                                <span className="bg-green-500 text-white px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-0.5 md:gap-1 animate-pulse">
                                  <Percent size={8} className="md:w-[10px] md:h-[10px]" /> {discountPercentTier}% OFF
                                </span>
                              )}
                            </div>
                            
                            <div className="text-xs md:text-sm text-gray-600 leading-relaxed bg-gray-50 p-2 md:p-3 rounded-lg min-h-[40px] md:min-h-[60px]">
                              {locale === 'ar' ? tier.description_ar : tier.description_en}
                            </div>
                            
                            <div className="flex items-center gap-2 md:gap-4 mt-1.5 md:mt-2 text-[10px] md:text-xs text-gray-400">
                              <span className="flex items-center gap-0.5 md:gap-1">
                                <Users size={10} className="md:w-[14px] md:h-[14px]" />
                                {tier.max_children} {t.maxChildren}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
                            {hasTierDiscount ? (
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] md:text-sm text-gray-400 line-through">
                                    {tier.price_before_discount} {currencySymbol}
                                  </p>
                                  <p className="text-lg md:text-2xl font-bold text-accent">
                                    {tier.price} {currencySymbol}
                                  </p>
                                </div>
                                <span className="text-[10px] md:text-xs text-green-600 bg-green-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                                  {t.save} {(tier.price_before_discount - tier.price).toFixed(2)} {currencySymbol}
                                </span>
                              </div>
                            ) : (
                              <p className="text-lg md:text-2xl font-bold text-accent">
                                {tier.price} {currencySymbol}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {terms && (
              <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
                  <Shield size={20} className="md:w-[24px] md:h-[24px] text-accent" />
                  {t.terms}
                </h2>
                <div className="text-gray-600 whitespace-pre-line text-xs md:text-sm leading-relaxed bg-gray-50 p-3 md:p-4 rounded-lg">
                  {terms}
                </div>
              </section>
            )}

            {embedUrl && (
              <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
                  <MapPin size={20} className="md:w-[24px] md:h-[24px] text-accent" />
                  {t.location}
                  {selectedBranch && (
                    <span className="text-xs md:text-sm font-normal text-gray-400 mr-1 md:mr-2">
                      — {locale === 'ar' ? selectedBranch.name_ar : selectedBranch.name_en}
                    </span>
                  )}
                </h2>
                
                <div className="rounded-xl overflow-hidden mb-3 md:mb-4 bg-gray-100 shadow-inner">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full md:h-[300px]"
                    title="خريطة الموقع"
                  />
                </div>
                
                <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
                  {selectedBranch ? (
                    <>
                      <p className="font-medium text-gray-800 text-sm md:text-base">
                        {locale === 'ar' ? selectedBranch.name_ar : selectedBranch.name_en}
                      </p>
                      <p className="flex items-start gap-1.5 md:gap-2">
                        <MapPin size={14} className="md:w-[16px] md:h-[16px] text-primary mt-0.5 flex-shrink-0" />
                        <span>{locale === 'ar' ? selectedBranch.address_ar : selectedBranch.address_en}</span>
                      </p>
                      {selectedBranch.phone && (
                        <p className="flex items-center gap-1.5 md:gap-2">
                          <Phone size={14} className="md:w-[16px] md:h-[16px] text-primary" />
                          <span dir="ltr">{selectedBranch.phone}</span>
                        </p>
                      )}
                      {selectedBranch.working_hours && (
                        <p className="flex items-center gap-1.5 md:gap-2">
                          <Clock size={14} className="md:w-[16px] md:h-[16px] text-primary" />
                          <span>{selectedBranch.working_hours}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-800 text-sm md:text-base">{t.address}</p>
                      <p>{locale === 'ar' ? packageData.address_ar : packageData.address_en}</p>
                    </>
                  )}
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-accent transition font-medium inline-flex items-center gap-1 group text-xs md:text-sm"
                  >
                    {t.showOnMap}
                    <ExternalLink size={12} className="md:w-[14px] md:h-[14px] group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </section>
            )}

            {reviews.length > 0 && (
              <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
                  <Star size={20} className="md:w-[24px] md:h-[24px] fill-yellow-400 text-yellow-400" />
                  {t.reviews} ({reviewsCount})
                </h2>
                <div className="space-y-3 md:space-y-4">
                  {reviews.slice(0, 4).map((review, index) => (
                    <div key={review.id} className={`border-b pb-3 md:pb-4 last:border-0 ${index > 0 ? 'pt-3 md:pt-4' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-xs md:text-sm font-bold">
                            {review.customer_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm md:text-base font-medium">{review.customer_name}</span>
                          {review.is_verified && (
                            <span className="text-[10px] md:text-xs text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-0.5 md:gap-1">
                              <CheckCircle size={10} className="md:w-[12px] md:h-[12px]" /> {t.verified}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={`md:w-[14px] md:h-[14px] ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-1.5 md:mt-2 leading-relaxed">
                        {locale === 'ar' ? review.comment_ar : review.comment_en}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1">
                        {new Date(review.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
                {reviews.length > 4 && (
                  <button className="mt-3 md:mt-4 text-primary hover:text-accent transition text-xs md:text-sm font-medium inline-flex items-center gap-1 group">
                    {locale === 'ar' ? 'عرض جميع الآراء' : 'View all reviews'}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                )}
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div id="booking-form" className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 sticky top-20 md:top-24 border border-gray-100">
              <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-primary to-accent rounded-lg text-white">
                  <Calendar size={16} className="md:w-[20px] md:h-[20px]" />
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-primary">{t.bookingForm}</h2>
              </div>

              {selectedTier && (
                <div className="mb-3 md:mb-5 p-3 md:p-4 bg-gradient-to-br from-accent/10 to-primary/5 rounded-xl border border-accent/20">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">{locale === 'ar' ? 'الباقة المختارة' : 'Selected Package'}</p>
                  <p className="font-bold text-primary text-xs md:text-sm">
                    {locale === 'ar' ? selectedTier.name_ar : selectedTier.name_en}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 md:mt-2">
                    <span className="text-base md:text-xl font-bold text-accent">
                      {selectedTier.price} {currencySymbol}
                    </span>
                    {selectedTier.max_children && (
                      <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-0.5 md:gap-1">
                        <Users size={10} className="md:w-[12px] md:h-[12px]" />
                        {selectedTier.max_children} {t.childrenLabel}
                      </span>
                    )}
                  </div>
                  {selectedBranch && (
                    <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-accent/20 flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-gray-500">
                      <Building size={10} className="md:w-[12px] md:h-[12px] text-primary" />
                      {locale === 'ar' ? selectedBranch.name_ar : selectedBranch.name_en}
                    </div>
                  )}
                </div>
              )}
              
              {submitted ? (
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 md:p-6 text-center">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎉</div>
                  <h3 className="text-green-700 font-bold text-base md:text-xl mb-1.5 md:mb-2">{t.success}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{t.successMessage}</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 md:mt-4 bg-primary text-white px-4 md:px-6 py-1.5 md:py-2 rounded-xl hover:bg-primary/90 transition text-xs md:text-sm"
                  >
                    {t.newBooking}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  {bookingError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-2 md:p-3 rounded-lg text-xs md:text-sm flex items-start gap-1.5 md:gap-2">
                      <span className="text-red-500 text-base md:text-lg">⚠️</span>
                      <span>{bookingError}</span>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-gray-700 mb-1 md:mb-2 text-xs md:text-sm font-medium">
                      {t.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm md:text-base"
                      placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1 md:mb-2 text-xs md:text-sm font-medium">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm md:text-base"
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1 md:mb-2 text-xs md:text-sm font-medium">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm md:text-base"
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1 md:mb-2 text-xs md:text-sm font-medium">
                        {t.children} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={selectedTier?.max_children || 50}
                        value={formData.child_count}
                        onChange={(e) => setFormData({...formData, child_count: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 md:mb-2 text-xs md:text-sm font-medium">
                        {t.date} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.booking_date}
                        onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm md:text-base"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1 md:mb-2 text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                      <FileText size={14} className="md:w-[16px] md:h-[16px]" /> {t.note}
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      placeholder={locale === 'ar' ? 'أضف أي ملاحظات إضافية...' : 'Add any additional notes...'}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none text-sm md:text-base"
                      rows="2"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-accent to-accent/80 text-white py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-lg disabled:opacity-50 disabled:cursor-not-allowed group transition-all duration-300"
                  >
                    <Send size={16} className="md:w-[20px] md:h-[20px] group-hover:translate-x-1 transition-transform" />
                    {submitting ? t.submitting : t.submit}
                  </button>

                  <p className="text-[10px] md:text-xs text-gray-400 text-center flex items-center justify-center gap-0.5 md:gap-1">
                    <Clock size={10} className="md:w-[12px] md:h-[12px]" />
                    {locale === 'ar' 
                      ? 'سيتم التواصل معك خلال دقائق (من 8 صباحاً إلى 12 ليلاً)'
                      : 'We will contact you within minutes (8 AM - 12 AM)'}
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>

      {similarPackages.length > 0 && (
        <section className="container mx-auto px-3 md:px-4 py-6 md:py-10 border-t border-gray-200">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-bold text-primary inline-flex items-center gap-1.5 md:gap-2">
              <Sparkles size={20} className="md:w-[28px] md:h-[28px] text-accent" />
              {t.similarPackages}
              <Sparkles size={20} className="md:w-[28px] md:h-[28px] text-accent" />
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {similarPackages.slice(0, 4).map((pkg) => {
              const pkgMinPrice = pkg.package_tiers?.length > 0 
                ? Math.min(...pkg.package_tiers.map(t => t.price))
                : 0;
              const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
              const pkgImage = pkg.images && pkg.images.length > 0 ? pkg.images[0] : null;
              const pkgSlug = createSlug(pkgName);
              const linkUrl = `/${locale}/${citySlug}/${pkgSlug}`;
              const pkgCurrency = getCurrencySymbol(pkg.currency || 'SAR');
              
              return (
                <Link
                  key={pkg.id}
                  href={linkUrl}
                  prefetch={false}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative h-32 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {pkgImage ? (
                      <Image
                        src={pkgImage}
                        alt={pkgName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-[10px] md:text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {pkgMinPrice > 0 && (
                      <div className="absolute bottom-1.5 md:bottom-2 right-1.5 md:right-2 bg-accent/90 text-white px-1.5 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-sm font-bold shadow-lg backdrop-blur-sm">
                        {pkgMinPrice} {pkgCurrency}
                      </div>
                    )}
                  </div>
                  <div className="p-2 md:p-4">
                    <h3 className="text-xs md:text-sm font-bold text-primary group-hover:text-accent transition line-clamp-1">
                      {pkgName}
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-2 h-6 md:h-8">
                      {locale === 'ar' ? pkg.description_ar : pkg.description_en}
                    </p>
                    <div className="mt-1.5 md:mt-2 flex items-center justify-between">
                      <span className="text-[10px] md:text-xs text-primary font-medium group-hover:text-accent transition">
                        {t.viewDetails} →
                      </span>
                      {pkg.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] md:text-xs text-gray-500">
                          <Star size={10} className="md:w-[12px] md:h-[12px] fill-yellow-400 text-yellow-400" />
                          {pkg.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {isImageModalOpen && hasImages && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 md:p-4 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label={t.images}
        >
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-2 md:top-4 right-2 md:right-4 text-white/70 hover:text-white transition z-10 p-1.5 md:p-2 hover:bg-white/10 rounded-full"
            aria-label={t.closeGallery}
          >
            <X size={24} className="md:w-[32px] md:h-[32px]" />
          </button>
          
          <div className="absolute top-2 md:top-4 left-2 md:left-4 flex items-center gap-1.5 md:gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
              className="bg-white/10 hover:bg-white/20 text-white p-1.5 md:p-2 rounded-full transition-all backdrop-blur-sm"
              aria-label={isZoomed ? t.zoomOut : t.zoomIn}
            >
              {isZoomed ? <ZoomOut size={16} className="md:w-[20px] md:h-[20px]" /> : <ZoomIn size={16} className="md:w-[20px] md:h-[20px]" />}
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = images[safeImageIndex];
                link.download = `${venueName}-image-${safeImageIndex + 1}.jpg`;
                link.click();
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-1.5 md:p-2 rounded-full transition-all backdrop-blur-sm"
              aria-label={t.downloadImage}
            >
              <Download size={16} className="md:w-[20px] md:h-[20px]" />
            </button>
            <span className="text-white/70 text-[10px] md:text-sm bg-black/50 px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
              {safeImageIndex + 1} / {images.length}
            </span>
          </div>
          
          <div 
            className="relative w-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            ref={modalRef}
          >
            <div className={`relative aspect-[16/9] transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-4 border-white border-t-transparent"></div>
                </div>
              )}
              <Image
                src={images[safeImageIndex]}
                alt={`${venueName} - صورة ${safeImageIndex + 1}`}
                fill
                className={`object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={100}
              />
            </div>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-4 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="الصورة السابقة"
                >
                  <ChevronLeft size={20} className="md:w-[28px] md:h-[28px]" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-4 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="الصورة التالية"
                >
                  <ChevronRight size={20} className="md:w-[28px] md:h-[28px]" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm flex items-center gap-2 md:gap-4">
              <span>{venueName}</span>
              <span className="w-px h-3 md:h-4 bg-white/30"></span>
              <span>{safeImageIndex + 1} / {images.length}</span>
            </div>
          </div>
        </div>
      )}

      <WhatsAppPopup />
    </article>
  );
}