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
const INTERNAL_URL = import.meta.env?.INTERNAL_DIRECTUS_URL || 'http://directus:8055'; 
const STATIC_TOKEN = import.meta.env?.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * 🛰️ Cliente Directus (Singleton con Fallback Inteligente)
 */
export class DirectusManager {
    private static client: any = null;
    private static isLocalFallback = false;

    public static getBaseUrl() {
        return (typeof window === 'undefined' && !this.isLocalFallback) ? INTERNAL_URL : PUBLIC_URL;
    }

    public static async getClient() {
        // [Server-Side] Bypass SSL Interno para Caddy Loopback
        if (typeof process !== 'undefined' && typeof window === 'undefined') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        if (!this.client) {
            const isServer = typeof window === 'undefined';
            const envInternal = typeof process !== 'undefined' ? process.env.INTERNAL_DIRECTUS_URL : null;
            const baseUrl = (isServer && !this.isLocalFallback) ? (envInternal || INTERNAL_URL) : PUBLIC_URL;

            this.client = createDirectus<Schema>(baseUrl)
                .with(rest())
                .with(staticToken(STATIC_TOKEN));

            // [SSR] Verificación de red interna optimizada
            if (isServer && !this.isLocalFallback) {
                try {
                    const res = await fetch(`${baseUrl}/server/health`);
                    if (!res.ok) throw new Error(`Status ${res.status}`);
                    console.log(`[DirectusManager] ✅ Conectado vía Red Interna: ${baseUrl}`);
                } catch (e: any) {
                    console.warn(`[DirectusManager] ⚠️ Red Interna (${baseUrl}) inaccesible. Conmutando a ${PUBLIC_URL}...`);
                    this.isLocalFallback = true;
                    this.client = null; 
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

export async function getSerieDetails(folderId: string) {
    try {
        const client = await DirectusManager.getClient();
        const folder: any = await client.request(readItem('directus_folders' as any, folderId));
        const items: any = await client.request(readItems('directus_files' as any, {
            filter: { folder: { _eq: folderId } },
            limit: -1
        }));
        return { name: folder.name, items: items || [] };
    } catch (e) {
        return { name: 'Colección', items: [] };
    }
}

export async function getArtworkLikes(fileId: string) {
    try {
        const client = await DirectusManager.getClient();
        const file: any = await client.request(readItem('directus_files' as any, fileId));
        if (!file) return 0;
        
        const filename = file.filename_download;
        const redisKey = `likes:${filename}`;
        
        // Intentar Redis primero
        const likes = await REDIS.get(redisKey);
        if (likes !== null) return parseInt(likes);
        
        // Fallback a la colección
        const records = await client.request(readItems('artworks', {
            filter: { filename: { _eq: filename } },
            limit: 1
        }));
        return records[0]?.likes || 0;
    } catch (e) {
        return 0;
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

export async function getArticles(token?: string) {
    try {
        const client = await DirectusManager.getClient();
        
        // Si hay token, creamos un cliente temporal con ese token para ver borradores
        const authClient = token ? 
            createDirectus<Schema>(DirectusManager.getBaseUrl())
                .with(rest())
                .with(staticToken(token)) : client;

        return await authClient.request(readItems('magazine', {
            sort: ['-created_at'],
            fields: ['*', { user_created: ['*'] }]
        }));
    } catch (e) {
        return [];
    }
}

export async function getArtworks() {
    try {
        const client = await DirectusManager.getClient();
        return await client.request(readItems('artworks', {
            limit: -1
        }));
    } catch (e) {
        return [];
    }
}

export async function getCertificates(token?: string) {
    try {
        const baseUrl = DirectusManager.getBaseUrl();
        const client = createDirectus<Schema>(baseUrl)
            .with(rest())
            .with(staticToken(token || STATIC_TOKEN));

        return await client.request(readItems('certificates', {
            fields: ['*', { artwork_id: ['*'], collector_id: ['*'] }],
            limit: -1
        }));
    } catch (e) {
        console.error('[getCertificates Error]:', e);
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

/* ==========================================================================
   SECCIÓN: FUNCIONES DASHBOARD (SSR / PRIVILEGIADAS)
   ========================================================================== */

export async function getCertificateByUuid(uuid: string, _token?: string) {
    try {
        const client = await DirectusManager.getClient();
        const results = await client.request(readItems('certificates', {
            filter: { id: { _eq: uuid } },
            fields: ['*', { artwork_id: ['*'], collector_id: ['*'] }],
            limit: 1
        }));
        return results[0] || null;
    } catch (e) {
        console.error(`[getCertificateByUuid Error]:`, e);
        return null;
    }
}

export async function getArtworkById(id: string) {
    try {
        const client = await DirectusManager.getClient();
        return await client.request(readItem('artworks', id));
    } catch (e) {
        return null;
    }
}

export async function getArticleDetails(idOrSlug: string, _token?: string) {
    try {
        const client = await DirectusManager.getClient();
        
        // 1. Intentar por ID (PK)
        try {
            return await client.request(readItem('magazine', idOrSlug, {
                fields: ['*', { user_created: ['*'] }]
            }));
        } catch (e) {
            // 2. Si falla (o no es un id válido), intentar por Slug
            const results = await client.request(readItems('magazine', {
                filter: { slug: { _eq: idOrSlug } },
                fields: ['*', { user_created: ['*'] }],
                limit: 1
            }));
            return results[0] || null;
        }
    } catch (e) {
        return null;
    }
}

export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number } = {}) {
    if (!id) return null;
    const { width = 1200, format = 'avif', quality = 80 } = options;
    return `${PUBLIC_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`;
}
