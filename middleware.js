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
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};