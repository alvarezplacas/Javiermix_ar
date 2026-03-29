import type { APIRoute } from 'astro';
import { INTERNAL_DIRECTUS_URL, PUBLIC_DIRECTUS_URL, DIRECTUS_STATIC_TOKEN } from '@conexion/directus';

export const prerender = false; // SSR only

export const GET: APIRoute = async ({ params, request }) => {
    const assetId = params.id;
    
    if (!assetId) {
        return new Response('Asset ID missing', { status: 400 });
    }

    // Usar la URL interna del Docker si es posible para puente rápido, o fallar al público
    let targetUrl = `${INTERNAL_DIRECTUS_URL}/assets/${assetId}`;
    
    // Add token if exists and not already provided
    if (DIRECTUS_STATIC_TOKEN) {
        targetUrl += `?access_token=${DIRECTUS_STATIC_TOKEN}`;
    }

    try {
        const headers = new Headers();
        
        // Forward Range headers for video streaming
        const rangeHeader = request.headers.get('Range');
        if (rangeHeader) {
            headers.set('Range', rangeHeader);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s wait

        let response = await fetch(targetUrl, {
            headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Fallback a Public si falla interno 
        if (!response.ok && response.status !== 206) {
            console.warn(`[Asset Proxy] Internal failed with ${response.status}. Trying Public Directus.`);
            let publicTarget = `${PUBLIC_DIRECTUS_URL}/assets/${assetId}`;
            if (DIRECTUS_STATIC_TOKEN) publicTarget += `?access_token=${DIRECTUS_STATIC_TOKEN}`;
            
            response = await fetch(publicTarget, { headers });
            
            if (!response.ok && response.status !== 206) {
                return new Response('Asset not found or forbidden', { status: response.status });
            }
        }

        // Clone headers to pass browser caching and ranges
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        
        if (response.headers.has('Content-Length')) {
            responseHeaders.set('Content-Length', response.headers.get('Content-Length')!);
        }
        if (response.headers.has('Content-Range')) {
            responseHeaders.set('Content-Range', response.headers.get('Content-Range')!);
        }
        if (response.headers.has('Accept-Ranges')) {
            responseHeaders.set('Accept-Ranges', response.headers.get('Accept-Ranges')!);
        }

        // Cache agressivamente porque Directus Assets con ID rara vez mutan (inmutabilidad por id=UUID)
        responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders
        });
        
    } catch (e: any) {
        console.error(`[Asset Proxy] Proxy Error: ${e.message}`);
        return new Response('Proxy Error', { status: 500 });
    }
};
