'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
// ❌ حذف: import Header from '@/components/ui/Header';
// ❌ حذف: import Footer from '@/components/ui/Footer';
import { Phone, Mail, MapPin, Download, Smartphone, MessageCircle } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function ContactPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
    document.documentElement.style.direction = dir;
  }, [locale]);

  const content = {
    ar: {
      title: 'تواصل معنا',
      subtitle: 'نحن هنا لمساعدتك',
      saudi: '🇸🇦 السعودية',
      uae: '🇦🇪 الإمارات',
      whatsapp: 'واتساب',
      phone: 'هاتف',
      email: 'البريد الإلكتروني',
      followUs: 'تابعنا',
      downloadApp: 'حمّل التطبيق',
      downloadDesc: 'لمشاهدة جميع الأنشطة والمناطق الترفيهية',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      instagram: 'انستقرام',
      twitter: 'تويتر'
    },
    en: {
      title: 'Contact Us',
      subtitle: 'We are here to help',
      saudi: '🇸🇦 Saudi Arabia',
      uae: '🇦🇪 UAE',
      whatsapp: 'WhatsApp',
      phone: 'Phone',
      email: 'Email',
      followUs: 'Follow Us',
      downloadApp: 'Download App',
      downloadDesc: 'View all activities and entertainment areas',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      instagram: 'Instagram',
      twitter: 'Twitter'
    }
  };

  const t = content[locale] || content.ar;

  // أرقام الهواتف مع الاتجاه الصحيح
  const phoneNumbers = {
    saudi: {
      whatsapp: '+966 55 255 2880',
      phone: '+966 11 510 2974'
    },
    uae: {
      whatsapp: '+971 52 772 9226',
      phone: '+971 52 772 9226'
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl opacity-90">{t.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">{t.title}</h2>
              
              <div className="space-y-4">
                {/* Saudi Arabia */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-bold text-primary mb-3">{t.saudi}</h3>
                  <div className="space-y-2">
                    <a 
                      href={`https://api.whatsapp.com/send?phone=${phoneNumbers.saudi.whatsapp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-gray-600 hover:text-[#25D366] transition group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366] transition">
                        <FaWhatsapp size={20} className="text-[#25D366] group-hover:text-white transition" />
                      </div>
                      <span className="font-medium" dir="ltr">{t.whatsapp}: {phoneNumbers.saudi.whatsapp}</span>
                    </a>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone size={20} className="text-primary" />
                      </div>
                      <span className="font-medium" dir="ltr">{t.phone}: {phoneNumbers.saudi.phone}</span>
                    </div>
                  </div>
                </div>

                {/* UAE */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-bold text-primary mb-3">{t.uae}</h3>
                  <div className="space-y-2">
                    <a 
                      href={`https://api.whatsapp.com/send?phone=${phoneNumbers.uae.whatsapp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-gray-600 hover:text-[#25D366] transition group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366] transition">
                        <FaWhatsapp size={20} className="text-[#25D366] group-hover:text-white transition" />
                      </div>
                      <span className="font-medium" dir="ltr">{t.whatsapp}: {phoneNumbers.uae.whatsapp}</span>
                    </a>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone size={20} className="text-primary" />
                      </div>
                      <span className="font-medium" dir="ltr">{t.phone}: {phoneNumbers.uae.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <h3 className="text-lg font-bold text-primary mb-3">{t.email}</h3>
                  <a href="mailto:Bookings@theqapp.com" className="flex items-center gap-3 text-gray-600 hover:text-primary transition group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition">
                      <Mail size={20} className="text-primary group-hover:text-white transition" />
                    </div>
                    <span className="font-medium" dir="ltr">Bookings@theqapp.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">{t.followUs}</h2>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://www.instagram.com/theqapp_ksa/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#F56040] text-white rounded-lg hover:shadow-lg transition"
                >
                  <FaInstagram size={18} />
                  {t.instagram}
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:shadow-lg transition"
                >
                  <FaTwitter size={18} />
                  {t.twitter}
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-6">{locale === 'ar' ? 'موقعنا' : 'Our Location'}</h2>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <MapPin size={48} className="text-gray-400" />
              <p className="text-gray-500 mr-2">{locale === 'ar' ? 'خريطة قريباً' : 'Map coming soon'}</p>
            </div>
          </div>
        </div>

        {/* Download Apps - خلفية بيضاء */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
            <Smartphone size={24} />
            {t.downloadApp}
          </h2>
          <p className="text-gray-600 mb-6">{t.downloadDesc}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://apps.apple.com/gb/app/theqapp-family-travel-guide/id1265147563" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 bg-gray-900 hover:bg-black px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg text-white"
            >
              <Download size={20} />
              <span>{t.appStore}</span>
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.qidz&referrer=utm_source%3Dqidz_website%26utm_medium%3Ddownload_button%26utm_campaign%3Dqidz" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 bg-gray-900 hover:bg-black px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg text-white"
            >
              <Download size={20} />
              <span>{t.googlePlay}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
    // ❌ حذف: <Footer />
  );
}