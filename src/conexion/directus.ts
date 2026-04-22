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
    readFiles,
    readFolders,
    createItem, 
    updateItem
} from '@directus/sdk';
import { REDIS } from './redis';
import type { Schema, Order } from '@types/directus';

// 🌐 Configuración de URLs
const PUBLIC_URL = import.meta.env?.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
const INTERNAL_URL = import.meta.env?.INTERNAL_DIRECTUS_URL || 'http://javiermix-directus:8055'; 
const STATIC_TOKEN = import.meta.env?.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * 🛰️ Cliente Directus
 */
export class DirectusManager {
    private static client: any = null;
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
}

/* ==========================================================================
   SECCIÓN: FUNCIONES DE DATOS (IDs CORREGIDOS)
   ========================================================================== */

export async function getHomeFiles() {
    try {
        const client = await DirectusManager.getClient();
        const HOME_FOLDER_ID = 'f74cc3cc-4fce-46e4-8efd-477c65c79e67'; 
        return await client.request(readFiles({ filter: { folder: { _eq: HOME_FOLDER_ID } }, sort: ['filename_download'], limit: -1 }));
    } catch (e) { return []; }
}

export async function getLaboratorioFiles() {
    try {
        const client = await DirectusManager.getClient();
        // 🎯 ID CORREGIDO: de4c7fa02f46 (antes estaba al revés)
        const LAB_FOLDER_ID = 'd69266c5-90b3-467f-af9c-de4c7fa02f46';
        return await client.request(readFiles({ filter: { folder: { _eq: LAB_FOLDER_ID } }, sort: ['filename_download'], limit: -1 }));
    } catch (e) { return []; }
}

export async function getSeries() {
    try {
        const client = await DirectusManager.getClient();
        const allFolders = await client.request(readFolders());
        const series = await Promise.all(allFolders.map(async (f: any) => {
            if (['Home', 'home', 'Laboratorio', 'Catalogo'].includes(f.name)) return null;
            const files = await client.request(readFiles({ filter: { folder: { _eq: f.id } }, limit: 1 }));
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
        const items: any = await client.request(readFiles({ filter: { folder: { _eq: folderId } }, limit: -1 }));
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
export async function getCatalogoFiles() { try { const client = await DirectusManager.getClient(); const folders = await client.request(readFolders({ filter: { name: { _eq: 'Catalogo' } } })); const rootId = folders[0]?.id; if (!rootId) return []; const seriesFolders = await client.request(readFolders({ filter: { parent: { _eq: rootId } } })); const seriesMap = new Map(seriesFolders.map((f: any) => [f.id, f.name])); const files = await client.request(readFiles({ filter: { folder: { _in: seriesFolders.map((f: any) => f.id) } }, limit: -1 })); return (files as any[]).map((file: any) => ({ ...file, serie_name: seriesMap.get(file.folder) || "Sin Serie" })); } catch (e) { return []; } }
export async function getCertificateByUuid(uuid: string) { try { const client = await DirectusManager.getClient(); const results = await client.request(readItems('certificates', { filter: { id: { _eq: uuid } }, fields: ['*', { artwork_id: ['*'], collector_id: ['*'] }], limit: 1 })); return results[0] || null; } catch (e) { return null; } }
export async function getArtworkById(id: string) { try { const client = await DirectusManager.getClient(); return await client.request(readItem('artworks', id)); } catch (e) { return null; } }
export async function getArtworks() { try { const client = await DirectusManager.getClient(); return await client.request(readItems('artworks' as any, { limit: -1 })); } catch (e) { return []; } }
export async function getCertificates() { try { const client = await DirectusManager.getClient(); return await client.request(readItems('certificates' as any, { fields: ['*', { artwork_id: ['*'], collector_id: ['*'] }], limit: -1 })); } catch (e) { return []; } }
export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number, raw?: boolean } = {}) { if (!id) return null; if (options.raw) return `${PUBLIC_URL}/assets/${id}`; const { width = 1200, format = 'avif', quality = 80 } = options; return `${PUBLIC_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`; }
export const fetchFromDirectus = (path: string, options?: RequestInit) => DirectusManager.fetchShim(path, options);
