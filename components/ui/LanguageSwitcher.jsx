'use client';
import { useParams, usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params?.locale || 'ar';

  const switchLanguage = (newLocale) => {
    if (newLocale === currentLocale) return;

    // تغيير الاتجاه فوراً
    const newDir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', newDir);
    document.documentElement.setAttribute('lang', newLocale);
    document.documentElement.style.direction = newDir;
    document.body.className = newLocale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
    
    // الحصول على المسار الحالي
    let currentPath = pathname;
    
    // استبدال اللغة في المسار
    let newPath = currentPath;
    
    // إذا كان المسار يبدأ باللغة الحالية
    if (currentPath.startsWith(`/${currentLocale}`)) {
      newPath = currentPath.replace(`/${currentLocale}`, `/${newLocale}`);
    } else {
      // إذا كان المسار لا يحتوي على اللغة، أضفها
      newPath = `/${newLocale}${currentPath}`;
    }
    
    // تنظيف المسار من القيم غير الصالحة
    newPath = newPath
      .replace(/\/undefined/g, '')
      .replace(/\/null/g, '')
      .replace(/\/+/g, '/');
    
    // التأكد من أن المسار يبدأ بـ "/"
    if (!newPath.startsWith('/')) {
      newPath = '/' + newPath;
    }
    
    console.log('🔄 Switching language:', {
      from: currentLocale,
      to: newLocale,
      oldPath: pathname,
      newPath: newPath
    });
    
    router.push(newPath);
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