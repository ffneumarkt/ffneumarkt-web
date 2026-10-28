// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import { getVehicleSitemapUrls } from './src/config/vehicleSitemapUrls.ts';
import { pwa } from './src/pwa/integration.ts';

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
      filter: (page) => !page.includes('/atemschutz/befoerderungspapier') && !page.includes('/offline'),

      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
    pwa(),
    ...(process.env.NODE_ENV !== 'production' ? [keystatic()] : []),
  ],
});
