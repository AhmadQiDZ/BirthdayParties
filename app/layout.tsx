import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================
// تحسين SEO المتقدم - أفضل منصة حفلات
// ============================================
export const metadata: Metadata = {
  title: {
    template: '%s | theQapp',
    default: 'theQapp - أفضل منصة لحفلات أعياد الميلاد في السعودية والإمارات',
  },
  description: 'theQapp هي المنصة الأولى لحفلات أعياد الميلاد والفعاليات العائلية في السعودية والإمارات. أكثر من 1,000,000 حجز ناجح. اكتشف أفضل الباقات واحجز الآن!',
  keywords: 'حفلات أطفال, باقات حفلات, أماكن ترفيهية, حجوزات أطفال, فعاليات أطفال, حفلات عيد ميلاد, منصة حفلات, theQapp, QiDZ, best birthday party platform, kids parties, birthday party packages, entertainment venues, children bookings, kids events, birthday parties, family activities, birthday party planner, event planning, Saudi Arabia birthday parties, UAE birthday parties, Riyadh birthday parties, Jeddah birthday parties, Dubai birthday parties',
  applicationName: 'theQapp',
  authors: [{ name: 'theQapp', url: 'https://theqapp.com' }],
  creator: 'theQapp',
  publisher: 'theQapp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://theqapp.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
  openGraph: {
    title: 'theQapp - أفضل منصة لحفلات أعياد الميلاد في السعودية والإمارات',
    description: 'اكتشف أفضل باقات حفلات أعياد الميلاد في السعودية والإمارات. أكثر من 1,000,000 حجز ناجح. احجز الآن واستمتع بتجربة لا تنسى مع theQapp.',
    url: 'https://theqapp.com',
    siteName: 'theQapp',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'theQapp - أفضل منصة لحفلات أعياد الميلاد في السعودية والإمارات',
        type: 'image/jpeg',
      },
    ],
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'theQapp - أفضل منصة لحفلات أعياد الميلاد في السعودية والإمارات',
    description: 'اكتشف أفضل باقات حفلات أعياد الميلاد في السعودية والإمارات. أكثر من 1,000,000 حجز ناجح.',
    images: ['/images/og-image.jpg'],
    site: '@theqapp',
    creator: '@theqapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'entertainment',
  classification: 'Family Entertainment Platform',
};

// ============================================
// تحسين الـ Viewport
// ============================================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#023d6d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}