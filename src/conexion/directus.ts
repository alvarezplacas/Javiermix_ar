/**
 * 🏛️ Capa de Conexión Premium (SDK v11+)
 * javiermix.ar - Golden Master 2.0
 */

import { 
    createDirectus, 
    rest, 
    staticToken, 
    readItems, 
    readItem, 
    createItem, 
    updateItem,
    readFolders
} from '@directus/sdk';
import { REDIS } from './redis';
import type { Schema, Order } from '../types/directus';

// 🌐 Configuración de URLs (Blindaje HTTPS)
const PUBLIC_URL = import.meta.env?.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
const INTERNAL_URL = 'http://javiermix_directus:8055'; 
const STATIC_TOKEN = import.meta.env?.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * 🛰️ Cliente Directus (Singleton con Fallback Inteligente)
 */
class DirectusManager {
    private static client: any = null;
    private static isLocalFallback = false;

    public static async getClient() {
        if (!this.client) {
            const isServer = typeof window === 'undefined';
            const baseUrl = (isServer && !this.isLocalFallback) ? INTERNAL_URL : PUBLIC_URL;

            this.client = createDirectus<Schema>(baseUrl)
                .with(rest())
                .with(staticToken(STATIC_TOKEN));

            // [SSR] Verificación de red interna (Docker)
            if (isServer && !this.isLocalFallback) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1000);
                    const res = await fetch(`${INTERNAL_URL}/health`, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    
                    if (!res.ok) throw new Error('Unhealthy');
                } catch (e) {
                    console.warn('⚠️ Directus: Red Interna inaccesible. Conmutando a Public HTTPS (Local/VPS Fallback)...');
                    this.isLocalFallback = true;
                    this.client = null; // Reset para reinicializar con PUBLIC_URL
                    return this.getClient();
                }
            }
        }
        return this.client;
    }

    /**
     * 🛡️ Shim Layer: Capa de compatibilidad para evitar roturas de código antiguo
     */
    public static async fetchShim(path: string, options: RequestInit = {}) {
        const baseUrl = this.isLocalFallback || typeof window !== 'undefined' ? PUBLIC_URL : INTERNAL_URL;
        const url = `${baseUrl}${path}`;
        
        const headers: any = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STATIC_TOKEN}`,
            ...options.headers
        };

        try {
            return await fetch(url, { ...options, headers });
        } catch (e: any) {
            console.error(`[Fetch-Shim Error] ${url}:`, e.message);
            // Si falla la interna, forzar fallback y reintentar una vez
            if (baseUrl === INTERNAL_URL) {
                this.isLocalFallback = true;
                this.client = null;
                return this.fetchShim(path, options);
            }
            throw e;
        }
    }
}

// Exportación del Shim para compatibilidad inmediata
export const fetchFromDirectus = (path: string, options?: RequestInit) => DirectusManager.fetchShim(path, options);

/* ==========================================================================
   SECCIÓN: FUNCIONES MIGRADAS AL SDK
   ========================================================================== */

export async function getSeries() {
    try {
        const client = await DirectusManager.getClient();
        const folders = await client.request(readFolders({
            filter: { name: { _eq: 'Catalogo' } }
        }));
        const rootId = folders[0]?.id;
        if (!rootId) return [];

        const subfolders = await client.request(readFolders({
            filter: { parent: { _eq: rootId } }
        }));

        return await Promise.all(subfolders.map(async (f: any) => {
            const files = await client.request(readItems('directus_files' as any, {
                filter: { folder: { _eq: f.id }, type: { _contains: 'image' } },
                limit: 1
            }));
            const allFiles = await client.request(readItems('directus_files' as any, {
                filter: { folder: { _eq: f.id }, type: { _contains: 'image' } },
                fields: ['id']
            }));
            return {
                id: f.id,
                name: f.name,
                coverId: files?.[0]?.id || null,
                count: allFiles.length
            };
        }));
    } catch (e) {
        return [];
    }
}

export async function getArtworks() {
    try {
        const client = await DirectusManager.getClient();
        return await client.request(readItems('artworks'));
    } catch (e) {
        return [];
    }
}

export async function getArtworkDetails(fileId: string) {
    try {
        const client = await DirectusManager.getClient();
        const file: any = await client.request(readItem('directus_files' as any, fileId));
        if (!file) return null;

        const filename = file.filename_download;
        const baseName = filename.split('.')[0];
        
        const meta = await client.request(readItems('artworks', {
            filter: {
                _or: [
                    { filename: { _eq: filename } },
                    { filename: { _eq: baseName } }
                ]
            },
            limit: 1
        }));

        return { mainFile: file, meta: meta[0] || null };
    } catch (e) {
        return null;
    }
}

export async function getCatalogoFiles() {
    try {
        const client = await DirectusManager.getClient();
        const folders = await client.request(readFolders({
            filter: { name: { _eq: 'Catalogo' } }
        }));
        const rootId = folders[0]?.id;
        if (!rootId) return [];

        const seriesFolders = await client.request(readFolders({
            filter: { parent: { _eq: rootId } }
        }));
        const seriesMap = new Map(seriesFolders.map((f: any) => [f.id, f.name]));
        const folderIds = seriesFolders.map((f: any) => f.id);

        if (folderIds.length === 0) return [];

        const files = await client.request(readItems('directus_files' as any, {
            filter: { folder: { _in: folderIds } },
            limit: -1
        }));

        return (files as any[]).map((file: any) => ({
            ...file,
            serie_name: seriesMap.get(file.folder) || "Sin Serie"
        }));
    } catch (e) {
        return [];
    }
}

export async function addLike(artworkId: string, ip: string) {
    try {
        const client = await DirectusManager.getClient();
        const file: any = await client.request(readItem('directus_files' as any, artworkId));
        if (!file) return { success: false, message: "Obra no encontrada" };

        const filename = file.filename_download;
        const redisKey = `likes:${filename}`;
        const ipKey = `track:${filename}:${ip}`;

        const hasVoted = await REDIS.get(ipKey);
        if (hasVoted) return { success: false, message: "Ya has votado" };

        const currentLikes = await REDIS.get(redisKey);
        const newLikes = (currentLikes ? parseInt(currentLikes) : 0) + 1;
        
        await REDIS.set(redisKey, newLikes.toString());
        await REDIS.set(ipKey, '1', 'EX', 86400 * 7);

        // Sync (Fire & Forget)
        (async () => {
            try {
                const records = await client.request(readItems('artworks', { filter: { filename: { _eq: filename } } }));
                if (!records[0]) {
                    await client.request(createItem('artworks', { filename, title: file.title || "Sin título", likes: newLikes, serie_id: 'default' }));
                } else {
                    await client.request(updateItem('artworks', records[0].id, { likes: newLikes }));
                }
            } catch (err: any) {
                console.error(`[Sync-Error] ${filename}:`, err.message);
            }
        })();

        return { success: true, likes: newLikes };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function getArticles() {
    try {
        const client = await DirectusManager.getClient();
        return await client.request(readItems('magazine', {
            sort: ['-created_at'],
            fields: ['*', { user_created: ['*'] }]
        }));
    } catch (e) {
        return [];
    }
}

export async function createOrder(data: Partial<Order>) {
    try {
        const client = await DirectusManager.getClient();
        return await client.request(createItem('orders', data as any));
    } catch (e) {
        return null;
    }
}

export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number } = {}) {
    if (!id) return null;
    const { width = 1200, format = 'avif', quality = 80 } = options;
    return `${PUBLIC_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`;
}
