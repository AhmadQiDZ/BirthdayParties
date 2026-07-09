'use client';
import { useParams, usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params?.locale || 'ar';

  const switchLanguage = (newLocale) => {
    // تغيير الاتجاه فوراً
    const newDir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', newDir);
    document.documentElement.setAttribute('lang', newLocale);
    document.documentElement.style.direction = newDir;
    document.body.className = newLocale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
    
    // إنشاء المسار الجديد
    let newPathname;
    if (currentLocale === 'ar' && newLocale === 'en') {
      newPathname = pathname.replace('/ar', '/en');
    } else if (currentLocale === 'en' && newLocale === 'ar') {
      newPathname = pathname.replace('/en', '/ar');
    } else {
      newPathname = `/${newLocale}${pathname.replace(/^\/[^\/]+/, '')}`;
    }
    
    if (!newPathname.startsWith('/')) newPathname = '/' + newPathname;
    if (newPathname === `/${newLocale}`) newPathname = `/${newLocale}/`;
    
    router.push(newPathname);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLanguage('ar')}
        className={`px-3 py-1.5 rounded-lg transition text-sm font-medium ${
          currentLocale === 'ar'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        عربي
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1.5 rounded-lg transition text-sm font-medium ${
          currentLocale === 'en'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        English
      </button>
    </div>
  );
}