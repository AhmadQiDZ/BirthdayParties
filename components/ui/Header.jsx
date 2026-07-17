'use client';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

// استيراد ملفات الترجمة مباشرة
import arMessages from '../../messages/ar.json';
import enMessages from '../../messages/en.json';

const allMessages = {
  ar: arMessages,
  en: enMessages
};

export default function Header() {
  const params = useParams();
  const pathname = usePathname();
  const locale = params?.locale || 'ar';
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // الحصول على الترجمة حسب اللغة
  const messages = allMessages[locale] || allMessages.ar;
  const t = messages.Nav || {};

  useEffect(() => {
    setMounted(true);
  }, []);

  // استخراج مسار الصفحة الحالية بدون اللغة
  const getCurrentPathWithoutLocale = () => {
    if (!pathname) return '';
    const parts = pathname.split('/').filter(Boolean);
    // إذا كان الجزء الأول هو اللغة (ar/en)، نزيله
    if (parts.length > 0 && (parts[0] === 'ar' || parts[0] === 'en')) {
      return '/' + parts.slice(1).join('/');
    }
    return pathname;
  };

  const currentPath = getCurrentPathWithoutLocale();

  const navItems = [
    { href: `/${locale}`, key: 'home' },
    { href: `/${locale}/about`, key: 'about' },
    { href: `/${locale}/add-package`, key: 'addPackage' },
    { href: `/${locale}/contact`, key: 'contact' },
    { href: `/${locale}/faq`, key: 'faq' }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 md:py-2.5">
        {/* dir=ltr keeps logo on the left in both Arabic and English */}
        <div className="flex items-center justify-between" dir="ltr">
          {/* اللوجو - دائماً على اليسار */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 flex-shrink-0"
            dir="ltr"
          >
            <div className="relative w-16 h-16 md:w-[4.5rem] md:h-[4.5rem]">
              <Image
                src="https://theqapp.com/_next/image?url=%2Fimages%2Fq_app_logo_1.png&w=1920&q=75"
                alt="theQapp - Birthday Party Booking Platform"
                width={72}
                height={72}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span
              className="font-sans-en font-bold text-xl md:text-2xl text-primary tracking-tight"
              lang="en"
              dir="ltr"
            >
              theQapp
            </span>
          </Link>

          {/* القائمة - للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center gap-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-gray-600 hover:text-primary transition font-medium text-base ${
                  pathname === item.href ? 'text-primary font-bold' : ''
                }`}
              >
                {t[item.key] || item.key}
              </Link>
            ))}
          </nav>

          {/* الأزرار */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {/* زر القائمة للهواتف */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* القائمة المنسدلة للهواتف */}
        {isMenuOpen && (
          <div className="md:hidden mt-2.5 pt-2.5 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-gray-600 hover:text-primary transition font-medium text-base py-2 px-3 rounded-lg hover:bg-gray-50 ${
                    pathname === item.href ? 'text-primary font-bold bg-gray-50' : ''
                  }`}
                >
                  {t[item.key] || item.key}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}