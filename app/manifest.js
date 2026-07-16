import { SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';

export default function manifest() {
  return {
    name: `${SITE_NAME} - Birthday Party Booking`,
    short_name: SITE_NAME,
    description:
      'Book the best kids birthday party packages in Saudi Arabia and the UAE.',
    start_url: '/ar',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#023d6d',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: DEFAULT_OG_IMAGE,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: DEFAULT_OG_IMAGE,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
