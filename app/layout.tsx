import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import JsonLd from "../components/seo/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  organizationSchema,
  websiteSchema,
} from "../lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default:
      "theQapp - أفضل منصة لحفلات أعياد الميلاد في السعودية والإمارات",
  },
  description:
    "theQapp هي المنصة الأولى لحجز حفلات أعياد الميلاد والفعاليات العائلية في السعودية والإمارات. أكثر من 1,000,000 حجز ناجح. اكتشف أفضل الباقات واحجز الآن!",
  keywords: [
    "حفلات أعياد ميلاد",
    "حجز حفلة عيد ميلاد",
    "باقات حفلات أطفال",
    "أماكن ترفيهية",
    "حفلات أطفال الرياض",
    "حفلات جدة",
    "حفلات دبي",
    "birthday parties",
    "birthday party booking",
    "kids birthday parties",
    "Saudi Arabia",
    "UAE",
    "theQapp",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      ar: "/ar",
      en: "/en",
      "x-default": "/ar",
    },
  },
  openGraph: {
    title:
      "theQapp - أفضل منصة لحفلات أعياد الميلاد في السعودية والإمارات",
    description:
      "اكتشف أفضل باقات حفلات أعياد الميلاد في السعودية والإمارات. أكثر من 1,000,000 حجز ناجح. احجز الآن مع theQapp.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "theQapp - Birthday Party Booking Platform",
        type: "image/png",
      },
    ],
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "theQapp - أفضل منصة لحفلات أعياد الميلاد في السعودية والإمارات",
    description:
      "اكتشف أفضل باقات حفلات أعياد الميلاد في السعودية والإمارات. أكثر من 1,000,000 حجز ناجح.",
    images: [DEFAULT_OG_IMAGE],
    site: "@theqapp",
    creator: "@theqapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "entertainment",
  classification: "Family Entertainment & Birthday Party Booking Platform",
  other: {
    "geo.region": "SA-AE",
    "geo.placename": "Saudi Arabia, United Arab Emirates",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#023d6d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") === "en" ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-full flex flex-col ${locale === "ar" ? "font-sans-ar" : "font-sans-en"}`}
        suppressHydrationWarning
      >
        <JsonLd data={[organizationSchema(), websiteSchema(locale)]} />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
