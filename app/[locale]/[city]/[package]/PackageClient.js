'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, Calendar, Users, Phone, Mail, Send, ChevronLeft, 
  ChevronRight, CheckCircle, ArrowLeft, Star, Clock, Award, 
  Info, Shield, Gift, Sparkles, Crown, Tag, Percent, FileText,
  Heart, Share2, Building, X, ZoomIn, ZoomOut, Download,
  ExternalLink, MessageCircle, ThumbsUp, Eye, ChevronDown, HelpCircle,
  Play, Video, Pause, Volume2, VolumeX
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  formatWorkingHours,
  getReviewComment,
  getVisibleTiers,
  parseBranchRecord,
} from '@/lib/utils';
import WhatsAppPopup from '@/components/ui/WhatsAppPopup';
import PackageCard from '@/components/ui/PackageCard';

export default function PackageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const locale = params?.locale || 'ar';
  
  let citySlug = params?.city || params?.slug || '';
  
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
  
  // ✅ معرض الوسائط (صور + فيديو)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const modalRef = useRef(null);
  
  // ✅ حالة الفيديو
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
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

  useEffect(() => {
    if (!packageData?.package_tiers) return;

    const visibleTiers = getVisibleTiers(
      packageData.package_tiers,
      selectedBranch,
      branches.length
    );

    if (!visibleTiers.length) {
      setSelectedTier(null);
      return;
    }

    if (!selectedTier || !visibleTiers.some((tier) => tier.id === selectedTier.id)) {
      setSelectedTier(visibleTiers[0]);
    }
  }, [selectedBranch, packageData?.package_tiers, branches.length, selectedTier?.id]);

  // ✅ إيقاف الفيديو عند تغيير الوسائط
  useEffect(() => {
    if (videoRef.current && currentMediaIndex !== undefined) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoPlaying(false);
    }
  }, [currentMediaIndex]);

  // ✅ Escape لإغلاق النافذة
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isImageModalOpen) setIsImageModalOpen(false);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isImageModalOpen]);

  async function fetchPackageBySlugOnly() {
    try {
      console.log('🔍 Trying to find package by slug only:', packageSlug);
      
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

      let foundPackage = null;
      
      if (packagesList && packagesList.length > 0) {
        const slugField = locale === 'ar' ? 'slug_ar' : 'slug_en';
        
        foundPackage = packagesList.find(pkg => {
          if (pkg[slugField] === packageSlug) return true;
          if (pkg.slug === packageSlug) return true;
          const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
          const pkgSlug = createSlug(pkgName);
          if (pkgSlug === packageSlug) return true;
          if (pkg.slug_ar && packageSlug.includes(pkg.slug_ar)) return true;
          if (pkg.slug_en && packageSlug.includes(pkg.slug_en)) return true;
          if (compareSlugs(pkgSlug, packageSlug)) return true;
          const normalizedPkgName = pkgName?.toLowerCase().trim().replace(/\s+/g, '-') || '';
          const normalizedPackageSlug = packageSlug.replace(/-/g, ' ');
          if (normalizedPkgName === normalizedPackageSlug) return true;
          if (normalizedPkgName === packageSlug) return true;
          const searchTerms = packageSlug.replace(/-/g, ' ').toLowerCase().split(' ');
          const nameTerms = pkgName?.toLowerCase().split(' ') || [];
          const matchCount = searchTerms.filter(term => 
            nameTerms.some(nameTerm => nameTerm.includes(term) || term.includes(nameTerm))
          ).length;
          if (matchCount >= Math.min(searchTerms.length, 2)) return true;
          return false;
        });

        if (!foundPackage) {
          const packageName = packageSlug.replace(/-/g, ' ');
          foundPackage = packagesList.find(pkg => {
            const name = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
            return name && name.toLowerCase().includes(packageName.toLowerCase());
          });
        }
        
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
      
      const correctPackageSlug = locale === 'ar' 
        ? (foundPackage.slug_ar || createSlug(foundPackage.venue_name_ar))
        : (foundPackage.slug_en || createSlug(foundPackage.venue_name_en));
      
      const newPath = `/${locale}/${citySlugFromPackage}/${correctPackageSlug}`;
      console.log('🔄 Redirecting to:', newPath);
      router.replace(newPath);
      
    } catch (err) {
      console.error('❌ Error in fetchPackageBySlugOnly:', err);
      router.push(`/${locale}`);
    }
  }

  async function fetchPackageData() {
    setLoading(true);
    setPackageData(null);
    setCityData(null);
    setBranches([]);
    setSelectedBranch(null);
    setSelectedTier(null);
    setSimilarPackages([]);
    setReviews([]);
    setCurrentMediaIndex(0);
    setImageLoading(true);
    setIsImageModalOpen(false);
    setIsZoomed(false);
    setVideoPlaying(false);
    setVideoLoaded(false);
    setSubmitted(false);
    setBookingError('');
    setOpenFaqIndex(null);
    setShowAllReviews(false);

    try {
      if (!citySlug || citySlug === 'undefined' || citySlug === 'null') {
        console.error('❌ City slug is invalid:', citySlug);
        setLoading(false);
        return;
      }

      let city = null;
      
      console.log('🔍 Searching for city with slug:', citySlug);
      
      const { data: cityBySlug, error: errorBySlug } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', citySlug)
        .single();
      
      if (!errorBySlug && cityBySlug) {
        city = cityBySlug;
        console.log('✅ City found by slug:', city.name_ar);
      } else {
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

      let foundPackage = null;
      
      if (packagesList && packagesList.length > 0) {
        const slugField = locale === 'ar' ? 'slug_ar' : 'slug_en';
        
        console.log('🔍 Searching for package with slug:', packageSlug);
        console.log('🔍 Using slug field:', slugField);
        
        foundPackage = packagesList.find(pkg => pkg[slugField] === packageSlug);
        
        if (foundPackage) {
          console.log('✅ Package found by language-specific slug:', slugField, '=', packageSlug);
        } else {
          foundPackage = packagesList.find(pkg => pkg.slug === packageSlug);
          if (foundPackage) {
            console.log('✅ Package found by generic slug');
          } else {
            foundPackage = packagesList.find(pkg => {
              const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
              const pkgSlug = createSlug(pkgName);
              return pkgSlug === packageSlug;
            });
            if (foundPackage) {
              console.log('✅ Package found by generated slug from name');
            } else {
              foundPackage = packagesList.find(pkg => {
                if (pkg.slug_ar && packageSlug.includes(pkg.slug_ar)) return true;
                if (pkg.slug_en && packageSlug.includes(pkg.slug_en)) return true;
                return false;
              });
              if (foundPackage) {
                console.log('✅ Package found by slug contains match');
              } else {
                foundPackage = packagesList.find(pkg => {
                  const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
                  const pkgSlug = createSlug(pkgName);
                  return compareSlugs(pkgSlug, packageSlug);
                });
                if (foundPackage) {
                  console.log('✅ Package found by normalized slug');
                } else {
                  const packageName = packageSlug.replace(/-/g, ' ');
                  foundPackage = packagesList.find(pkg => {
                    const name = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
                    return name && name.toLowerCase().includes(packageName.toLowerCase());
                  });
                  if (foundPackage) {
                    console.log('✅ Package found by name match');
                  } else {
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
        await fetchPackageBySlugOnly();
        setLoading(false);
        return;
      }

      const packageCitySlug = foundPackage.cities?.slug || 
                             foundPackage.cities?.slug_ar || 
                             foundPackage.cities?.slug_en ||
                             foundPackage.cities?.name_en?.toLowerCase().replace(/\s+/g, '-');
      
      if (packageCitySlug && packageCitySlug !== citySlug) {
        const isMatching = compareSlugs(packageCitySlug, citySlug);
        if (!isMatching) {
          console.log('🔄 Package belongs to different city, redirecting...');
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
      console.log('🎥 video_url from DB:', foundPackage.video_url);
      
      // ✅ ضمان جلب video_url حتى لو لم يُرجع * العمود
      let videoUrl = foundPackage?.video_url || null;
      
      if (!videoUrl && foundPackage?.id) {
        const { data: videoData } = await supabase
          .from('packages')
          .select('video_url')
          .eq('id', foundPackage.id)
          .single();
        
        if (videoData?.video_url) {
          videoUrl = videoData.video_url;
          console.log('🎥 video_url (fallback fetch):', videoUrl);
        }
      }
      
      const enrichedPackage = { ...foundPackage, video_url: videoUrl };
      console.log('📦 Enriched package:', enrichedPackage.venue_name_ar, '| video:', videoUrl);
      
      setPackageData(enrichedPackage);
      await loadPackageDetails(enrichedPackage);
      
    } catch (err) {
      console.error('❌ Error fetching package data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPackageDetails(pkg) {
    if (!pkg) return;

    const { data: branchesData } = await supabase
      .from('branches')
      .select('*')
      .eq('package_id', pkg.id)
      .order('name_ar');

    const parsedBranches = (branchesData || []).map(parseBranchRecord);
    setBranches(parsedBranches);

    let initialBranch = null;
    if (branchId && parsedBranches.length) {
      initialBranch = parsedBranches.find((b) => b.id === parseInt(branchId)) || null;
    } else if (parsedBranches.length === 1) {
      initialBranch = parsedBranches[0];
    }
    setSelectedBranch(initialBranch);

    const visibleTiers = getVisibleTiers(
      pkg.package_tiers || [],
      initialBranch,
      parsedBranches.length
    );
    setSelectedTier(visibleTiers[0] || null);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('package_id', pkg.id)
      .order('created_at', { ascending: false });

    setReviews(reviewsData || []);
    
    if (pkg.city_id) {
      const { data: similar, error: similarError } = await supabase
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

      if (similarError) {
        console.error('❌ Error fetching similar packages:', similarError);
      } else {
        const sortedSimilar = (similar || []).sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setSimilarPackages(sortedSimilar);
        console.log('✅ Similar packages loaded:', sortedSimilar.length);
      }
    }
  }

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
  // ✅ دوال معرض الوسائط (صور + فيديو)
  // ============================================
  const totalMedia = useMemo(() => {
    const imagesCount = packageData?.images?.length || 0;
    const hasVid = !!packageData?.video_url;
    return imagesCount + (hasVid ? 1 : 0);
  }, [packageData?.images, packageData?.video_url]);

  const mediaItems = useMemo(() => {
    const imgs = packageData?.images || [];
    const items = imgs.map((img, idx) => ({ type: 'image', src: img, index: idx }));
    if (packageData?.video_url) {
      items.push({ type: 'video', src: packageData.video_url });
    }
    return items;
  }, [packageData?.images, packageData?.video_url]);

  const currentMedia = mediaItems[currentMediaIndex];
  const isCurrentVideo = currentMedia?.type === 'video';

  const nextMedia = useCallback(() => {
    if (totalMedia > 0) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setVideoPlaying(false);
      setCurrentMediaIndex((prev) => (prev + 1) % totalMedia);
      setImageLoading(true);
    }
  }, [totalMedia]);

  const prevMedia = useCallback(() => {
    if (totalMedia > 0) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setVideoPlaying(false);
      setCurrentMediaIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
      setImageLoading(true);
    }
  }, [totalMedia]);

  const goToMedia = (index) => {
    if (index === currentMediaIndex) return;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setVideoPlaying(false);
    setCurrentMediaIndex(index);
    setImageLoading(true);
  };

  // للتوافق مع الكود الأصلي
  const nextImage = nextMedia;
  const prevImage = prevMedia;
  const goToImage = goToMedia;

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
      nextMedia();
    }
    if (touchStart - touchEnd < -50) {
      prevMedia();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsImageModalOpen(false);
    if (e.key === 'ArrowRight') nextMedia();
    if (e.key === 'ArrowLeft') prevMedia();
  };

  // ✅ دوال التحكم بالفيديو
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);
    } else {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoMuted;
    setVideoMuted(!videoMuted);
  };

  // ✅ كشف نوع الفيديو
  const getVideoType = (url) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'direct';
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
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

  const faqData = locale === 'ar' 
    ? (packageData?.faq_ar || []) 
    : (packageData?.faq_en || []);
  const hasFaq = faqData.length > 0;

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const texts = {
    ar: {
      pageTitle: 'تفاصيل الباقة',
      aboutVenue: 'عن المكان',
      location: 'الموقع على الخريطة',
      terms: 'الشروط والأحكام',
      faqTitle: 'الأسئلة الشائعة',
      faqSubtitle: 'إجابات على أكثر الأسئلة التي يطرحها عملاؤنا',
      noFaq: 'لا توجد أسئلة شائعة متاحة حالياً',
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
      images: 'معرض الوسائط',
      noImages: 'لا توجد صور متاحة',
      closeGallery: 'إغلاق المعرض',
      downloadImage: 'تحميل الصورة',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      // ✅ نصوص الفيديو
      video: 'فيديو',
      videoBadge: 'فيديو',
      playVideo: 'تشغيل الفيديو',
      pauseVideo: 'إيقاف الفيديو',
      muteVideo: 'كتم الصوت',
      unmuteVideo: 'تشغيل الصوت',
      videoNotSupported: 'متصفحك لا يدعم تشغيل الفيديو',
      videoTitle: 'فيديو تعريفي',
      error: 'حدث خطأ',
      requiredField: 'هذا الحقل مطلوب'
    },
    en: {
      pageTitle: 'Package Details',
      aboutVenue: 'About the Venue',
      location: 'Location on Map',
      terms: 'Terms & Conditions',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Answers to the most common questions from our customers',
      noFaq: 'No FAQs available at the moment',
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
      images: 'Media Gallery',
      noImages: 'No images available',
      closeGallery: 'Close Gallery',
      downloadImage: 'Download Image',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      // ✅ New video texts
      video: 'Video',
      videoBadge: 'Video',
      playVideo: 'Play Video',
      pauseVideo: 'Pause Video',
      muteVideo: 'Mute',
      unmuteVideo: 'Unmute',
      videoNotSupported: 'Your browser does not support video playback',
      videoTitle: 'Introductory Video',
      error: 'Error',
      requiredField: 'This field is required'
    }
  };

  const t = texts[locale] || texts.ar;

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

  const venueName = locale === 'ar' ? packageData.venue_name_ar : packageData.venue_name_en;
  const description = locale === 'ar' ? packageData.description_ar : packageData.description_en;
  const terms = locale === 'ar' ? packageData.terms_ar : packageData.terms_en;
  const cityName = locale === 'ar' ? cityData.name_ar : cityData.name_en;
  const images = packageData.images || [];
  const hasImages = images.length > 0;
  const hasMedia = totalMedia > 0;
  const safeImageIndex = hasImages ? Math.min(currentMediaIndex, images.length - 1) : 0;
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

  const renderSimilarPackages = () => {
    if (similarPackages.length === 0) return null;

    return (
      <section className="container mx-auto px-3 md:px-4 py-6 md:py-10 border-t border-gray-200">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-primary inline-flex items-center gap-1.5 md:gap-2">
            <Sparkles size={20} className="md:w-[28px] md:h-[28px] text-accent" />
            {t.similarPackages}
            <Sparkles size={20} className="md:w-[28px] md:h-[28px] text-accent" />
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
            {locale === 'ar' 
              ? 'اكتشف باقات أخرى في نفس المدينة قد تناسب احتياجاتك' 
              : 'Discover other packages in the same city that might suit your needs'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {similarPackages.slice(0, 4).map((pkg) => {
            const pkgMinPrice = pkg.package_tiers?.length > 0 
              ? Math.min(...pkg.package_tiers.map(t => t.price))
              : 0;
            
            const firstSimilarTier = pkg.package_tiers?.[0];
            const pkgHasDiscount = firstSimilarTier?.price_before_discount > 0 && 
                                  firstSimilarTier?.price_before_discount > firstSimilarTier?.price;
            const pkgDiscountPercent = pkgHasDiscount 
              ? Math.round(((firstSimilarTier.price_before_discount - firstSimilarTier.price) / firstSimilarTier.price_before_discount) * 100)
              : 0;
            
            const pkgName = locale === 'ar' ? pkg.venue_name_ar : pkg.venue_name_en;
            const pkgImage = pkg.images && pkg.images.length > 0 ? pkg.images[0] : null;
            
            const pkgSlug = locale === 'ar' 
              ? (pkg.slug_ar || createSlug(pkgName))
              : (pkg.slug_en || createSlug(pkgName));
            
            const linkUrl = `/${locale}/${citySlug}/${pkgSlug}`;
            const pkgCurrency = getCurrencySymbol(pkg.currency || 'SAR');
            const pkgRating = pkg.rating || 0;
            const pkgReviews = pkg.reviews_count || 0;
            const pkgHasMultipleBranches = pkg.has_multiple_branches || false;
            
            const savedAmount = pkgHasDiscount && firstSimilarTier 
              ? firstSimilarTier.price_before_discount - firstSimilarTier.price 
              : 0;
            
            return (
              <Link
                key={pkg.id}
                href={linkUrl}
                prefetch={false}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
              >
                <div className="relative h-32 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                  {pkgImage ? (
                    <Image
                      src={pkgImage}
                      alt={pkgName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-10 h-10 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[8px] md:text-xs mt-1">{locale === 'ar' ? 'لا توجد صورة' : 'No Image'}</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {pkgHasDiscount && pkgDiscountPercent > 0 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold shadow-lg flex items-center gap-0.5 md:gap-1">
                      <Percent size={8} className="md:w-[10px] md:h-[10px]" />
                      {pkgDiscountPercent}% {t.discount}
                    </div>
                  )}
                  
                  {pkgHasMultipleBranches && (
                    <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm text-white px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold shadow-lg flex items-center gap-0.5 md:gap-1">
                      <Building size={8} className="md:w-[10px] md:h-[10px]" />
                      {locale === 'ar' ? 'فروع متعددة' : 'Multiple Branches'}
                    </div>
                  )}

                  {/* ✅ شارة الفيديو في الباقات المشابهة */}
                  {pkg.video_url && (
                    <div className="absolute top-2 left-2 bg-purple-500/90 backdrop-blur-sm text-white px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold shadow-lg flex items-center gap-0.5 md:gap-1">
                      <Play size={8} className="md:w-[10px] md:h-[10px] fill-white" />
                      {t.videoBadge}
                    </div>
                  )}
                  
                  {pkgMinPrice > 0 && (
                    <div className="absolute bottom-1.5 md:bottom-2 right-1.5 md:right-2 bg-accent/90 backdrop-blur-sm text-white px-1.5 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-sm font-bold shadow-lg">
                      {pkgHasDiscount && firstSimilarTier ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[7px] md:text-[9px] text-white/60 line-through">
                            {firstSimilarTier.price_before_discount} {pkgCurrency}
                          </span>
                          <span>
                            {pkgMinPrice} {pkgCurrency}
                          </span>
                          {savedAmount > 0 && (
                             <span className="text-[6px] md:text-[8px] text-white">
                              {t.save} {savedAmount.toFixed(2)} {pkgCurrency}
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          {pkgMinPrice} {pkgCurrency}
                        </>
                      )}
                    </div>
                  )}
                  
                  {pkgRating > 0 && (
                    <div className="absolute bottom-1.5 md:bottom-2 left-1.5 md:left-2 bg-black/60 backdrop-blur-sm text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] flex items-center gap-0.5 md:gap-1 shadow-lg">
                      <Star size={8} className="md:w-[10px] md:h-[10px] fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{pkgRating}</span>
                      <span className="text-white/60">({pkgReviews})</span>
                    </div>
                  )}
                </div>
                
                <div className="p-2 md:p-4 flex-grow flex flex-col">
                  <h3 className="text-xs md:text-sm font-bold text-primary group-hover:text-accent transition line-clamp-1">
                    {pkgName}
                  </h3>
                  
                  <div className="flex items-center gap-0.5 md:gap-1 text-gray-400 mt-0.5 md:mt-1">
                    <MapPin size={10} className="md:w-[12px] md:h-[12px]" />
                    <span className="text-[9px] md:text-xs">{cityName}</span>
                  </div>
                  
                  <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-2 flex-grow">
                    {locale === 'ar' ? pkg.description_ar : pkg.description_en}
                  </p>
                  
                  <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-gray-100">
                    <span className="text-[9px] md:text-xs text-primary font-medium group-hover:text-accent transition flex items-center gap-0.5 md:gap-1">
                      {t.viewDetails}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {similarPackages.length > 4 && (
          <div className="text-center mt-4 md:mt-6">
            <Link 
              href={`/${locale}/${citySlug}`}
              className="inline-flex items-center gap-1.5 md:gap-2 bg-primary text-white px-4 md:px-6 py-1.5 md:py-2.5 rounded-full hover:bg-primary/90 transition-all text-xs md:text-sm shadow-lg hover:shadow-xl"
            >
              {locale === 'ar' ? 'عرض جميع الباقات' : 'View All Packages'}
              <ChevronRight size={14} className="md:w-[18px] md:h-[18px]" />
            </Link>
          </div>
        )}
      </section>
    );
  };

  return (
    <article className="min-h-screen bg-gradient-to-br from-gray-50 to-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
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
          {hasMedia ? (
            <>
              <div className="relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/8]">
                {/* ===== عرض الصورة ===== */}
                {!isCurrentVideo && currentMedia?.type === 'image' && (
                  <>
                    <Image
                      src={currentMedia.src}
                      alt={`${venueName} - صورة رقم ${currentMediaIndex + 1}`}
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
                        {/* ✅ شارة الفيديو */}
                        {packageData.video_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const videoIdx = mediaItems.findIndex(m => m.type === 'video');
                              if (videoIdx >= 0) goToMedia(videoIdx);
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg flex items-center gap-0.5 md:gap-1 hover:scale-105 transition-transform"
                          >
                            <Play size={10} className="md:w-[12px] md:h-[12px] fill-white" /> {t.video}
                          </button>
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
                      {currentMediaIndex + 1} / {totalMedia}
                    </div>
                    
                    {totalMedia > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                          aria-label="السابق"
                        >
                          <ChevronLeft size={16} className="md:w-[24px] md:h-[24px]" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                          aria-label="التالي"
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
                  </>
                )}

                {/* ===== عرض الفيديو المباشر (MP4) ===== */}
                {isCurrentVideo && getVideoType(packageData.video_url) === 'direct' && (
                  <div className="relative w-full h-full bg-black">
                    <video
                      ref={videoRef}
                      src={packageData.video_url}
                      className="w-full h-full object-contain"
                      playsInline
                      muted={videoMuted}
                      onLoadedData={() => setVideoLoaded(true)}
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      onClick={toggleVideoPlay}
                      poster={images[0]}
                    />
                    
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-purple-500/90 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Video size={10} className="md:w-[12px] md:h-[12px]" />
                      {t.video}
                    </div>
                    
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-black/60 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 md:gap-2">
                      <Eye size={10} className="md:w-[12px] md:h-[12px]" />
                      {currentMediaIndex + 1} / {totalMedia}
                    </div>
                    
                    {!videoPlaying && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVideoPlay(); }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group/play"
                        aria-label={t.playVideo}
                      >
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-2xl transition-transform group-hover/play:scale-110">
                          <Play size={28} className="md:w-[36px] md:h-[36px] fill-primary text-primary ml-1" />
                        </div>
                      </button>
                    )}
                    
                    {videoPlaying && (
                      <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleVideoPlay(); }}
                          className="bg-black/70 hover:bg-black/90 text-white p-1.5 md:p-2 rounded-full transition-all backdrop-blur-sm"
                          aria-label={t.pauseVideo}
                        >
                          <Pause size={16} className="md:w-[18px] md:h-[18px]" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleVideoMute(); }}
                          className="bg-black/70 hover:bg-black/90 text-white p-1.5 md:p-2 rounded-full transition-all backdrop-blur-sm"
                          aria-label={videoMuted ? t.unmuteVideo : t.muteVideo}
                        >
                          {videoMuted ? <VolumeX size={16} className="md:w-[18px] md:h-[18px]" /> : <Volume2 size={16} className="md:w-[18px] md:h-[18px]" />}
                        </button>
                      </div>
                    )}
                    
                    {totalMedia > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                          aria-label="السابق"
                        >
                          <ChevronLeft size={16} className="md:w-[24px] md:h-[24px]" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                          aria-label="التالي"
                        >
                          <ChevronRight size={16} className="md:w-[24px] md:h-[24px]" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* ===== عرض فيديو يوتيوب ===== */}
                {isCurrentVideo && getVideoType(packageData.video_url) === 'youtube' && getYouTubeId(packageData.video_url) && (
                  <div className="relative w-full h-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(packageData.video_url)}?autoplay=0&rel=0`}
                      title={t.videoTitle}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-red-600/90 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Video size={10} className="md:w-[12px] md:h-[12px]" />
                      YouTube
                    </div>
                    
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-black/60 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 md:gap-2">
                      <Eye size={10} className="md:w-[12px] md:h-[12px]" />
                      {currentMediaIndex + 1} / {totalMedia}
                    </div>
                  </div>
                )}

                {/* ===== عرض فيديو فيميو ===== */}
                {isCurrentVideo && getVideoType(packageData.video_url) === 'vimeo' && getVimeoId(packageData.video_url) && (
                  <div className="relative w-full h-full bg-black">
                    <iframe
                      src={`https://player.vimeo.com/video/${getVimeoId(packageData.video_url)}?autoplay=0`}
                      title={t.videoTitle}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                    
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-blue-600/90 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Video size={10} className="md:w-[12px] md:h-[12px]" />
                      Vimeo
                    </div>
                    
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-black/60 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 md:gap-2">
                      <Eye size={10} className="md:w-[12px] md:h-[12px]" />
                      {currentMediaIndex + 1} / {totalMedia}
                    </div>
                  </div>
                )}
              </div>
              
              {/* ===== شريط المصغرات (صور + فيديو) ===== */}
              {totalMedia > 1 && (
                <div className="flex gap-1.5 md:gap-2 p-2 md:p-3 bg-white/95 backdrop-blur-sm overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                  {mediaItems.map((item, idx) => {
                    const isActive = idx === currentMediaIndex;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => goToMedia(idx)}
                        className={`flex-shrink-0 relative w-12 h-9 md:w-16 md:h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                          isActive 
                            ? 'ring-2 ring-primary shadow-lg scale-105' 
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                        aria-label={item.type === 'video' ? 'الفيديو' : `الصورة ${idx + 1}`}
                      >
                        {item.type === 'image' ? (
                          <Image
                            src={item.src}
                            alt={`مصغرة ${idx + 1}`}
                            width={80}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full relative bg-black">
                            {images[0] ? (
                              <img
                                src={images[0]}
                                alt="فيديو"
                                className="w-full h-full object-cover opacity-70"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                                <Play size={10} className="md:w-[14px] md:h-[14px] fill-purple-600 text-purple-600 ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute top-0.5 right-0.5 bg-purple-500 text-white text-[7px] md:text-[9px] px-1 py-0.5 rounded font-bold">
                              {t.videoBadge}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
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
                              {formatWorkingHours(branch.working_hours, locale, true)}
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
                            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1 md:gap-1.5 whitespace-pre-line">
                              <Clock size={12} className="md:w-[14px] md:h-[14px]" />
                              {formatWorkingHours(selectedBranch.working_hours, locale)}
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
                    const isSelected = selectedTier?.id === tier.id;
                    
                    return (
                      <div
                        key={tier.id}
                        className={`group relative border-2 rounded-xl p-3 md:p-5 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-white shadow-lg scale-[1.02]'
                            : 'border-gray-200 hover:border-green-400 hover:shadow-lg hover:scale-[1.02]'
                        }`}
                        onClick={() => setSelectedTier(tier)}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-green-500 text-white rounded-full p-0.5 md:p-1 shadow-lg z-10">
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
                            
                            <div className="text-xs md:text-sm text-gray-600 leading-relaxed bg-gray-50 p-2 md:p-3 rounded-lg min-h-[40px] md:min-h-[60px] whitespace-pre-wrap">
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
                                  <p className="text-lg md:text-2xl font-bold text-green-600">
                                    {tier.price} {currencySymbol}
                                  </p>
                                </div>
                                <span className="text-[10px] md:text-xs text-green-600 bg-green-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                                  {t.save} {(tier.price_before_discount - tier.price).toFixed(2)} {currencySymbol}
                                </span>
                              </div>
                            ) : (
                              <p className="text-lg md:text-2xl font-bold text-green-600">
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

            {hasFaq && (
              <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <HelpCircle size={20} className="md:w-[24px] md:h-[24px] text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-primary">
                      {t.faqTitle}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      {t.faqSubtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 my-4">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent rounded-full"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent rounded-full"></div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  {faqData.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    const question = faq.question || '';
                    const answer = faq.answer || '';

                    if (!question && !answer) return null;

                    return (
                      <div
                        key={index}
                        className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                          isOpen 
                            ? 'border-indigo-300 bg-indigo-50/50 shadow-lg shadow-indigo-100' 
                            : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(index)}
                          className="w-full flex items-center justify-between gap-3 p-3 md:p-4 text-right transition-colors duration-200"
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${
                              isOpen 
                                ? 'bg-indigo-500 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {index + 1}
                            </span>
                            <span className={`font-semibold text-sm md:text-base transition-colors duration-200 line-clamp-2 ${
                              isOpen ? 'text-indigo-700' : 'text-gray-700'
                            }`}>
                              {question}
                            </span>
                          </div>
                          
                          <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isOpen 
                              ? 'bg-indigo-500 text-white rotate-180' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <ChevronDown size={16} className="md:w-[18px] md:h-[18px]" />
                          </span>
                        </button>

                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-3 md:px-4 pb-3 md:pb-4">
                            <div className={`${locale === 'ar' ? 'mr-9 md:mr-11' : 'ml-9 md:ml-11'} border-r-2 border-indigo-300 pr-3 md:pr-4`}>
                              <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                {answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 mt-4">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent rounded-full"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                  <div className="w-1 h-1 rounded-full bg-indigo-200"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent rounded-full"></div>
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
                          <span className="whitespace-pre-line">
                            {formatWorkingHours(selectedBranch.working_hours, locale)}
                          </span>
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
                <div className="mb-3 md:mb-5 p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                  <p className="text-[10px] md:text-xs text-green-700 mb-0.5 md:mb-1 flex items-center gap-1">
                    <CheckCircle size={12} className="md:w-[14px] md:h-[14px] text-green-600" />
                    {locale === 'ar' ? 'الباقة المختارة' : 'Selected Package'}
                  </p>
                  <p className="font-bold text-primary text-xs md:text-sm">
                    {locale === 'ar' ? selectedTier.name_ar : selectedTier.name_en}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 md:mt-2">
                    <span className="text-base md:text-xl font-bold text-green-600">
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
                    <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-green-200 flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-gray-500">
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

      {renderSimilarPackages()}

      {/* ===== نافذة عرض الصور المنبثقة ===== */}
      {isImageModalOpen && !isCurrentVideo && currentMedia?.type === 'image' && (
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
                link.href = currentMedia.src;
                link.download = `${venueName}-image-${currentMediaIndex + 1}.jpg`;
                link.click();
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-1.5 md:p-2 rounded-full transition-all backdrop-blur-sm"
              aria-label={t.downloadImage}
            >
              <Download size={16} className="md:w-[20px] md:h-[20px]" />
            </button>
            <span className="text-white/70 text-[10px] md:text-sm bg-black/50 px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
              {currentMediaIndex + 1} / {totalMedia}
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
                src={currentMedia.src}
                alt={`${venueName} - صورة`}
                fill
                className={`object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={100}
              />
            </div>
            
            {totalMedia > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-4 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="السابق"
                >
                  <ChevronLeft size={20} className="md:w-[28px] md:h-[28px]" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-4 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="التالي"
                >
                  <ChevronRight size={20} className="md:w-[28px] md:h-[28px]" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm flex items-center gap-2 md:gap-4">
              <span>{venueName}</span>
              <span className="w-px h-3 md:h-4 bg-white/30"></span>
              <span>{currentMediaIndex + 1} / {totalMedia}</span>
            </div>
          </div>
        </div>
      )}

      <WhatsAppPopup />
    </article>
  );
}