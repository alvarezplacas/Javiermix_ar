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
import type { Schema, Order } from '@types/directus';

// 🌐 Configuración de URLs (Blindaje HTTPS)
const PUBLIC_URL = import.meta.env?.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
const INTERNAL_URL = import.meta.env?.INTERNAL_DIRECTUS_URL || 'http://javiermix-directus:8055'; 
const STATIC_TOKEN = import.meta.env?.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * 🛰️ Cliente Directus (Singleton con Fallback Inteligente)
 */
export class DirectusManager {
    private static client: any = null;
    private static isLocalFallback = false;

    public static getBaseUrl() { return PUBLIC_URL; }

    public static async getClient() {
        if (!this.client) {
            const isServer = typeof window === 'undefined';
            const baseUrl = isServer ? INTERNAL_URL : PUBLIC_URL;
            try {
                const baseClient = createDirectus<Schema>(baseUrl).with(rest());
                if (STATIC_TOKEN && STATIC_TOKEN !== 'undefined') {
                    this.client = baseClient.with(staticToken(STATIC_TOKEN));
                } else {
                    this.client = baseClient;
                }
            } catch (error: any) {
                console.error(`[DirectusManager] ❌ Error:`, error.message);
                throw error;
            }
        }
        return this.client;
    }

    public static async fetchShim(path: string, options: RequestInit = {}) {
        const useInternal = !this.isLocalFallback && typeof window === 'undefined';
        const baseUrl = useInternal ? INTERNAL_URL : PUBLIC_URL;
        const url = `${baseUrl}${path}`;
        const headers: any = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${STATIC_TOKEN}`, ...options.headers };
        try {
            const response = await fetch(url, { ...options, headers });
            return response;
        } catch (e: any) {
            if (useInternal) {
                this.isLocalFallback = true;
                this.client = null;
                return this.fetchShim(path, options);
            }
            throw e;
        }
    }
}

/* ==========================================================================
   SECCIÓN: FUNCIONES DE DATOS (IDs FIJOS PARA VELOCIDAD)
   ========================================================================== */

export async function getHomeFiles() {
    try {
        const client = await DirectusManager.getClient();
        const HOME_FOLDER_ID = 'f74cc3cc-4fce-46e4-8efd-477c65c79e67'; 
        return await client.request(readItems('directus_files' as any, { filter: { folder: { _eq: HOME_FOLDER_ID } }, sort: ['filename_download'], limit: -1 }));
    } catch (e) { return []; }
}

export async function getLaboratorioFiles() {
    try {
        const client = await DirectusManager.getClient();
        const LAB_FOLDER_ID = 'd69266c5-90b3-467f-af9c-de4c7af02f46';
        return await client.request(readItems('directus_files' as any, { filter: { folder: { _eq: LAB_FOLDER_ID } }, sort: ['filename_download'], limit: -1 }));
    } catch (e) { return []; }
}

export async function getSeries() {
    try {
        const client = await DirectusManager.getClient();
        const allFolders = await client.request(readFolders());
        const series = await Promise.all(allFolders.map(async (f: any) => {
            if (['Home', 'home', 'Laboratorio', 'Catalogo'].includes(f.name)) return null;
            const files = await client.request(readItems('directus_files' as any, { filter: { folder: { _eq: f.id }, type: { _contains: 'image' } }, limit: 1 }));
            if (files.length === 0) return null;
            return { id: f.id, name: f.name, coverId: files[0]?.id || null };
        }));
        return series.filter(s => s !== null);
    } catch (e) { return []; }
}

export async function getSerieDetails(folderId: string) {
    try {
        const client = await DirectusManager.getClient();
        const folder: any = await client.request(readItem('directus_folders' as any, folderId));
        const items: any = await client.request(readItems('directus_files' as any, { filter: { folder: { _eq: folderId } }, limit: -1 }));
        return { name: folder.name, items: items || [] };
    } catch (e) { return { name: 'Colección', items: [] }; }
}

export async function addLike(artworkId: string, ip: string) {
    try {
        const client = await DirectusManager.getClient();
        const file: any = await client.request(readItem('directus_files' as any, artworkId));
        if (!file) return { success: false };
        const filename = file.filename_download;
        const redisKey = `likes:${filename}`;
        const currentLikes = await REDIS.get(redisKey);
        const newLikes = (currentLikes ? parseInt(currentLikes) : 0) + 1;
        await REDIS.set(redisKey, newLikes.toString());
        return { success: true, likes: newLikes };
    } catch (e) { return { success: false }; }
}

export async function getArtworkLikes(fileId: string) {
    try {
        const client = await DirectusManager.getClient();
        const file: any = await client.request(readItem('directus_files' as any, fileId));
        const likes = await REDIS.get(`likes:${file.filename_download}`);
        return likes ? parseInt(likes) : 0;
    } catch (e) { return 0; }
}

export async function createOrder(data: any) { try { const client = await DirectusManager.getClient(); return await client.request(createItem('orders', data)); } catch (e) { return null; } }
export async function updateOrder(id: string, data: any) { try { const client = await DirectusManager.getClient(); return await client.request(updateItem('orders', id, data)); } catch (e) { return null; } }
export async function getArticles() { try { const client = await DirectusManager.getClient(); return await client.request(readItems('magazine', { sort: ['-created_at'], fields: ['*', { user_created: ['*'] }] })); } catch (e) { return []; } }
export async function getArticleDetails(idOrSlug: string) { try { const client = await DirectusManager.getClient(); const results = await client.request(readItems('magazine', { filter: { _or: [{ id: { _eq: idOrSlug } }, { slug: { _eq: idOrSlug } }] }, fields: ['*', { user_created: ['*'] }], limit: 1 })); return results[0] || null; } catch (e) { return null; } }
export async function getArtworkDetails(fileId: string) { try { const client = await DirectusManager.getClient(); const file: any = await client.request(readItem('directus_files' as any, fileId)); return { mainFile: file, meta: null }; } catch (e) { return null; } }
export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number, raw?: boolean } = {}) { if (!id) return null; if (options.raw) return `${PUBLIC_URL}/assets/${id}`; const { width = 1200, format = 'avif', quality = 80 } = options; return `${PUBLIC_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`; }
export const fetchFromDirectus = (path: string, options?: RequestInit) => DirectusManager.fetchShim(path, options);
export async function getArtworks() { try { const client = await DirectusManager.getClient(); return await client.request(readItems('artworks' as any, { limit: -1 })); } catch (e) { return []; } }
export async function getCertificates(token?: string) { try { const client = await DirectusManager.getClient(); return await client.request(readItems('certificates' as any, { fields: ['*', { artwork_id: ['*'], collector_id: ['*'] }], limit: -1 })); } catch (e) { return []; } }
