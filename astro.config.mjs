import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { fileURLToPath } from 'url';

// https://astro.build/config
export default defineConfig({
    srcDir: './src',
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
                '@conexion': fileURLToPath(new URL('./src/conexion', import.meta.url)),
                '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
                '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
                '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
                '@styles': fileURLToPath(new URL('./src/styles', import.meta.url))
            }
        }
    }
});
