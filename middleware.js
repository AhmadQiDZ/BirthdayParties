import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always'
});

export default function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // إعادة توجيه /branches/* إلى /package/*
  if (pathname.match(/^\/(ar|en)\/branches\/\d+$/)) {
    const newPathname = pathname.replace('/branches/', '/package/');
    return NextResponse.redirect(new URL(newPathname, request.url));
  }
  
  const response = intlMiddleware(request);

  const maybeLocale = pathname.split('/').filter(Boolean)[0];
  const locale = maybeLocale === 'en' || maybeLocale === 'ar' ? maybeLocale : 'ar';
  response.headers.set('x-locale', locale);
  response.headers.set('x-pathname', pathname);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
