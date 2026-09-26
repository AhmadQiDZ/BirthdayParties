import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  pageCopy,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | Book Birthday Parties in Saudi Arabia & UAE`,
  },
  description: pageCopy.home.en.description,
  keywords: pageCopy.home.en.keywords,
  alternates: {
    canonical: SITE_URL,
    languages: {
      ar: `${SITE_URL}/ar`,
      en: `${SITE_URL}/en`,
      'x-default': `${SITE_URL}/ar`,
    },
  },
  openGraph: {
    title: `${SITE_NAME} | Book Birthday Parties in Saudi Arabia & UAE`,
    description: pageCopy.home.en.description,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    locale: 'en_US',
    alternateLocale: ['ar_SA'],
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  const [
    countriesResult,
    citiesResult,
    packagesResult,
  ] = await Promise.all([
    supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name_ar'),

    supabase
      .from('cities')
      .select('*, countries(*)')
      .eq('is_visible', true)
      .order('name_ar'),

    supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'live')
      .is('deleted_at', null),
  ]);

  const { data: countries } = countriesResult;
  const { data: cities } = citiesResult;
  const { count: totalPackages } = packagesResult;

  const totalCities = countriesResult.error ? 0 : (cities?.length ?? 0);
  const totalCountries = countriesResult.error ? 0 : (countries?.length ?? 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-white to-blue-50 p-8">
      <div className="text-center max-w-3xl">
        <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-4xl font-bold text-primary">Q</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
          theQapp
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 mb-3 font-medium">
          Best Birthday Parties Platform in the Gulf
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md">
            <p className="text-2xl font-bold text-primary">
              {totalCities}+
            </p>
            <p className="text-xs text-gray-500">
              Cities
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md">
            <p className="text-2xl font-bold text-accent">
              1M+
            </p>
            <p className="text-xs text-gray-500">
              Bookings
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md">
            <p className="text-2xl font-bold text-green-500">
              {totalCountries}+
            </p>
            <p className="text-xs text-gray-500">
              Countries
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md">
            <p className="text-2xl font-bold text-purple-600">
              {totalPackages ?? 0}
            </p>
            <p className="text-xs text-gray-500">
              Packages
            </p>
          </div>
        </div>

        <p className="text-lg text-gray-500 mb-8">
          Over 1,000,000 successful bookings
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/en"
            className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition"
          >
            English
          </Link>

          <Link
            href="/ar"
            className="bg-white text-gray-700 px-8 py-3 rounded-xl border hover:bg-gray-50 transition"
          >
            العربية
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {cities?.slice(0, 6).map((city) => (
            <span
              key={city.id}
              className="text-xs bg-white/70 px-3 py-1 rounded-full shadow-sm text-gray-600"
            >
              {city.countries?.flag_emoji} {city.name_ar}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}