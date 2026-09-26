'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, Phone, Mail, Smartphone, Shield, Award, Star } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok, FaGooglePlay, FaApple } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  
  // جلب المدن من قاعدة البيانات
  useEffect(() => {
    async function fetchCities() {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name_ar, name_en, slug')
          .eq('is_visible', true)
          .order('name_ar');

        if (!error && data) {
          setCities(data);
          console.log('🏙️ Cities loaded for footer:', data);
        } else {
          console.error('Error fetching cities:', error);
          // مدن افتراضية في حالة الخطأ
          setCities([
            { id: 1, name_ar: 'الرياض', name_en: 'Riyadh', slug: 'riyadh' },
            { id: 2, name_ar: 'جدة', name_en: 'Jeddah', slug: 'jeddah' },
            { id: 3, name_ar: 'دبي', name_en: 'Dubai', slug: 'dubai' },
            { id: 4, name_ar: 'أبوظبي', name_en: 'Abu Dhabi', slug: 'abu-dhabi' }
          ]);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingCities(false);
      }
    }
    
    fetchCities();
  }, []);

  const isRTL = locale === 'ar';

  // الوصف الجديد
  const description = isRTL 
    ? 'theQapp – المنصة الرائدة للأنشطة والتجارب العائلية في دول الخليج العربي، مع أكثر من 1,000,000 حجز ناجح. اكتشف أفضل الفعاليات والأنشطة وحفلات أعياد الميلاد والمعالم السياحية والوجهات العائلية - كل ذلك في تطبيق واحد. خطط لكل لحظة عائلية بسهولة واصنع ذكريات لا تُنسى معاً.'
    : 'theQapp – The leading platform for family activities and experiences across the GCC, with over 1,000,000 successful bookings. Discover the best events, activities, birthday parties, attractions, and family-friendly destinations—all in one app. Plan every family moment with ease and create unforgettable memories together.';

  // روابط التواصل الاجتماعي - خلفية بيضاء
  const socialLinks = [
    { icon: FaInstagram, href: 'https://www.instagram.com/theqapp_ksa/', color: '#E4405F', label: 'Instagram' },
    { icon: FaTiktok, href: 'https://www.tiktok.com/@theqapp_ksa', color: '#000000', label: 'TikTok' },
    { icon: FaFacebook, href: 'https://web.facebook.com/Qidzuae', color: '#1877F2', label: 'Facebook' }
  ];

  // طرق الدفع - خلفية بيضاء
  const paymentMethods = [
    { name: 'MasterCard', icon: 'https://theqapp.com/images/payment-icons/mastercard.svg' },
    { name: 'Visa', icon: 'https://theqapp.com/images/payment-icons/visa.svg' },
    { name: 'Mada', icon: 'https://theqapp.com/images/payment-icons/mada.svg' },
    { name: 'Tamara', icon: 'https://media.tenor.com/nY-cz14jRBUAAAAe/tamara-icon.png' }
  ];

  // روابط التطبيقات - خلفية بيضاء
  const appLinks = [
    { name: 'Google Play', icon: FaGooglePlay, href: 'http://bit.ly/QiDZGooglePlay', color: '#3DDC84' },
    { name: 'App Store', icon: FaApple, href: 'http://bit.ly/QiDZAppStore', color: '#000000' }
  ];

  const quickLinks = [
    { href: `/${locale}`, key: 'home', label: isRTL ? 'الرئيسية' : 'Home' },
    { href: `/${locale}/about`, key: 'about', label: isRTL ? 'من نحن' : 'About Us' },
    { href: `/${locale}/add-package`, key: 'addPackage', label: isRTL ? 'أضف باقاتك' : 'List Your Venue' },
    { href: `/${locale}/faq`, key: 'faq', label: isRTL ? 'الأسئلة الشائعة' : 'FAQ' }
  ];

  return (
    <footer className="text-white" style={{ backgroundColor: '#023d6d' }}>
      {/* القسم العلوي - روابط التواصل */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-white/80">
                {isRTL ? 'تابعنا على' : 'Follow Us'}
              </span>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg bg-white"
                    aria-label={social.label}
                  >
                    <social.icon size={18} style={{ color: social.color }} />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Shield size={16} className="text-white/60" />
              <span className="text-white/70 font-medium">
                {isRTL ? 'تطبيق آمن ومعتمد' : 'Secure & Trusted App'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* القسم الرئيسي */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* القسم الأول - معلومات المنصة */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-bold text-2xl text-white">theQapp</span>
              <Award size={20} className="text-yellow-400" />
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4 font-light">
              {description}
            </p>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400" />
              <span className="text-white/80 text-sm font-medium">
                {isRTL ? 'تقييم 4.9/5' : 'Rating 4.9/5'}
              </span>
            </div>
          </div>

          {/* القسم الثاني - روابط سريعة */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition text-sm hover:translate-x-1 inline-block font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* القسم الثالث - المدن (من قاعدة البيانات) */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">
              {isRTL ? 'جميع المدن' : 'All Cities'}
            </h3>
            {loadingCities ? (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/80"></div>
                <span className="font-light">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-1">
                {cities.map((city) => (
                  <li key={city.id}>
                    <Link
                      href={`/${locale}/${city.slug}`}
                      className="text-white/70 hover:text-white transition text-sm hover:translate-x-1 inline-block font-medium"
                    >
                      {locale === 'ar' ? city.name_ar : city.name_en}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* القسم الرابع - تواصل معنا */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <Phone size={18} className="flex-shrink-0 text-white/50" />
                <div className="font-medium">
                  <div>KSA: +966 55 255 2880</div>
                  <div>UAE: +971 52 772 9226</div>
                </div>
              </li>
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <Mail size={18} className="flex-shrink-0 text-white/50" />
                <a href="mailto:Bookings@theqapp.com" className="hover:text-white transition font-medium">
                  Bookings@theqapp.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* القسم السفلي - طرق الدفع والتطبيقات */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* طرق الدفع - خلفية بيضاء */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-sm text-white/60 font-medium">
                {isRTL ? 'نقبل بـ' : 'We Accept'}
              </span>
              <div className="flex gap-3 items-center flex-wrap">
                {paymentMethods.map((method, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg px-3 py-2 hover:scale-105 transition shadow-sm flex items-center justify-center min-w-[60px]"
                  >
                    <img 
                      src={method.icon} 
                      alt={method.name} 
                      className="h-6 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-gray-700 text-sm font-medium">${method.name}</span>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* تحميل التطبيق - خلفية بيضاء */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-sm text-white/60 font-medium flex items-center gap-1">
                <Smartphone size={14} />
                {isRTL ? 'حمل تطبيق theQapp' : 'Download theQapp App'}
              </span>
              <div className="flex gap-3 flex-wrap">
                {appLinks.map((app, index) => (
                  <a
                    key={index}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 transition px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
                  >
                    <app.icon size={18} style={{ color: app.color }} />
                    <span className="text-sm text-gray-700 font-medium">{app.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الفوتر السفلي */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-xs font-medium">
              © 2026 theQapp. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
            </p>
            <p className="text-white/30 text-[10px] flex items-center gap-1 font-medium">
              {isRTL ? 'صنع بـ' : 'Made with'} 
              <Heart size={10} className="text-red-400 fill-red-400" /> 
              {isRTL ? 'بواسطة theQapp' : 'by theQapp'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}