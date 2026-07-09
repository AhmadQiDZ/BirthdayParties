'use client';
import { useParams } from 'next/navigation';
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
  const locale = params?.locale || 'ar';
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // الحصول على الترجمة حسب اللغة
  const messages = allMessages[locale] || allMessages.ar;
  const t = messages.Nav || {};

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: `/${locale}`, key: 'home' },
    { href: `/${locale}/about`, key: 'about' },
    { href: `/${locale}/add-package`, key: 'addPackage' },
    { href: `/${locale}/contact`, key: 'contact' },
    { href: `/${locale}/faq`, key: 'faq' }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-3.5">
        <div className="flex items-center justify-between">
          {/* اللوجو - تكبير الحجم */}
          <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-14 h-14 md:w-16 md:h-16">
              <Image
                src="https://theqapp.com/_next/image?url=%2Fimages%2Fq_app_logo_1.png&w=1920&q=75"
                alt="theQapp Logo"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl md:text-2xl text-primary">theQapp</span>
          </Link>

          {/* القائمة - للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-gray-600 hover:text-primary transition font-medium text-sm"
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
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-600 hover:text-primary transition font-medium text-sm py-2 px-3 rounded-lg hover:bg-gray-50"
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