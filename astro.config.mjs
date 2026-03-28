import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { fileURLToPath } from 'url';

// https://astro.build/config
export default defineConfig({
    srcDir: './frontend',
    output: 'server',
    security: {
        checkOrigin: false
    },
    adapter: node({
        mode: 'standalone'
    }),
    vite: {
        resolve: {
            alias: {
                '@conexion': fileURLToPath(new URL('./frontend/conexion', import.meta.url)),
                '@components': fileURLToPath(new URL('./frontend/components', import.meta.url)),
                '@layouts': fileURLToPath(new URL('./frontend/layouts', import.meta.url)),
                '@utils': fileURLToPath(new URL('./frontend/utils', import.meta.url)),
                '@styles': fileURLToPath(new URL('./frontend/styles', import.meta.url))
            }
        }
    }
});
