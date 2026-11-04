// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://vlas.design',
  // Pages are prerendered (static). Only the /keystatic admin and its API run on demand.
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore',
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [
    react(),
    keystatic(),
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
    }),
  ],
  image: { responsiveStyles: true },
  devToolbar: { enabled: false },
  vite: {
    // Keystatic's API route imports `astro:env/server`, which the dev dependency optimizer cannot pre-bundle.
    optimizeDeps: { exclude: ['@keystatic/astro'] },
    ssr: { optimizeDeps: { exclude: ['@keystatic/astro'] } },
  },
});
