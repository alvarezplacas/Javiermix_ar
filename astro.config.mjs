import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { fileURLToPath } from 'url';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://javiermix.ar',
  srcDir: './src',
  output: 'server',

  security: {
      checkOrigin: false
  },

  adapter: node({
      mode: 'standalone'
  }),

  integrations: [preact()]
});