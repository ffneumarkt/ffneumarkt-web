// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import { getVehicleSitemapUrls } from './src/config/vehicleSitemapUrls.ts';

const site = 'https://ffneumarkt.at';

export default defineConfig({
  site,
  output: 'server',
  adapter: cloudflare({
    imageService: process.env.NODE_ENV === 'production' ? 'compile' : 'passthrough',
    platformProxy: {
      enabled: true,
    },
  }),

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    sitemap({
      customPages: getVehicleSitemapUrls(site),

      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
    ...(process.env.NODE_ENV !== 'production' ? [keystatic()] : []),
  ],
});
