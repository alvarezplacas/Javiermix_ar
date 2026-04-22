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
const INTERNAL_URL = import.meta.env?.INTERNAL_DIRECTUS_URL || 'http://directus:8055'; 
const STATIC_TOKEN = import.meta.env?.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * 🛰️ Cliente Directus (Singleton con Fallback Inteligente)
 */
export class DirectusManager {
    private static client: any = null;
    private static isLocalFallback = false;

    public static getBaseUrl() {
        // Log de depuración silencioso en servidor
        return PUBLIC_URL; 
    }

    public static async getClient() {
        if (!this.client) {
            const baseUrl = this.getBaseUrl();
            
            // Bypass SSL solo en desarrollo local si es necesario
            if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
                try { process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; } catch(e) {}
            }

            try {
                const baseClient = createDirectus<Schema>(baseUrl).with(rest());
                
                if (STATIC_TOKEN && STATIC_TOKEN !== 'undefined') {
                    this.client = baseClient.with(staticToken(STATIC_TOKEN));
                } else {
                    this.client = baseClient;
                }

                if (typeof window === 'undefined') {
                    console.log(`[DirectusManager] 🚀 Cliente SDK iniciado: ${baseUrl}`);
                }
            } catch (error: any) {
                console.error(`[DirectusManager] ❌ Error inicializando cliente:`, error.message);
                throw error;
            }
        }
        return this.client;
    }

    /**
     * 🛡️ Shim Layer: Capa de compatibilidad mejorada con Fallback Real
     */
    public static async fetchShim(path: string, options: RequestInit = {}) {
        const useInternal = !this.isLocalFallback && typeof window === 'undefined';
        const baseUrl = useInternal ? INTERNAL_URL : PUBLIC_URL;
        const url = `${baseUrl}${path}`;
        
        const headers: any = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STATIC_TOKEN}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok && useInternal) {
                 throw new Error(`Internal connection returned ${response.status}`);
            }
            return response;
        } catch (e: any) {
            if (useInternal) {
                console.warn(`[Directus-Fallback] ⚠️ No se pudo alcanzar la red interna (${INTERNAL_URL}). Cambiando a Pública.`);
                this.isLocalFallback = true;
                this.client = null; // Reiniciar cliente para que use la pública si es necesario
                return this.fetchShim(path, options);
            }
            console.error(`[Directus-Fetch Error] ❌ Fallo total en ${url}:`, e.message);
            throw e;
        }
    }
}

// Exportación del Shim para compatibilidad inmediata
export const fetchFromDirectus = (path: string, options?: RequestInit) => DirectusManager.fetchShim(path, options);

/* ==========================================================================
   SECCIÓN: FUNCIONES MIGRADAS AL SDK
   ========================================================================== */

export async function getHomeFiles() {
    try {
        const client = await DirectusManager.getClient();
        
        // 1. Obtener todas las carpetas (Buscamos "Home" en JS para evitar fallos de filtrado API)
        const allFolders = await client.request(readFolders());
        const homeFolder = allFolders.find((f: any) => 
            ['Home', 'home', 'HOME'].includes(f.name)
        );
        
        let files = [];
        if (homeFolder) {
            console.log(`[getHomeFiles] 📁 Carpeta 'Home' encontrada (ID: ${homeFolder.id})`);
            files = await client.request(readItems('directus_files' as any, {
                filter: { folder: { _eq: homeFolder.id } },
                sort: ['filename_download'],
                limit: -1
            }));
            console.log(`[getHomeFiles] 📄 Archivos recuperados en Home: ${files.length}`);
        } else {
            console.warn(`[getHomeFiles] ⚠️ No se encontró la carpeta 'Home' en Directus. Verificando raíz...`);
        }

        // 2. Fallback: Si no hay archivos en Home, traer los 8 más recientes globales
        if (files.length === 0) {
            console.warn(`[getHomeFiles] 🚑 Ejecutando Fallback: Recuperando 8 archivos recientes globales.`);
            files = await client.request(readItems('directus_files' as any, {
                limit: 8,
                sort: ['-created_on'],
                filter: {
                    _or: [
                        { type: { _contains: 'image' } },
                        { type: { _contains: 'video' } }
                    ]
                }
            }));
        }
        
        return files;
    } catch (e: any) {
        console.error(`[getHomeFiles] ❌ Error catastrófico:`, e.message);
        return [];
    }
}

export async function getLaboratorioFiles() {
    try {
        const client = await DirectusManager.getClient();
        const allFolders = await client.request(readFolders());
        const labFolder = allFolders.find((f: any) => 
            ['Laboratorio', 'laboratorio', 'LABORATORIO'].includes(f.name)
        );
        
        if (!labFolder) return [];

        return await client.request(readItems('directus_files' as any, {
            filter: { folder: { _eq: labFolder.id } },
            sort: ['filename_download'],
            limit: -1
        }));
    } catch (e) {
        return [];
    }
}

export async function getSeries() {
    try {
        const client = await DirectusManager.getClient();
        
        // 1. Obtener TODAS las carpetas (Evitamos problemas de jerarquía Parent/Child)
        const allFolders = await client.request(readFolders());
        
        // 2. Filtrar carpetas que no sean "Home" o carpetas de sistema, y que tengan imágenes
        const series = await Promise.all(allFolders.map(async (f: any) => {
            if (['Home', 'home', 'HOME'].includes(f.name)) return null;

            // Ver si tiene al menos 1 imagen
            const files = await client.request(readItems('directus_files' as any, {
                filter: { folder: { _eq: f.id }, type: { _contains: 'image' } },
                limit: 1
            }));

            if (files.length === 0) return null;

            // Contar total imágenes
            const countFiles = await client.request(readItems('directus_files' as any, {
                filter: { folder: { _eq: f.id }, type: { _contains: 'image' } },
                fields: ['id']
            }));

            return {
                id: f.id,
                name: f.name,
                coverId: files[0]?.id || null,
                count: countFiles.length
            };
        }));

        return series.filter(s => s !== null);
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
        
        try {
            return await client.request(readItem('magazine', idOrSlug, {
                fields: ['*', { user_created: ['*'] }]
            }));
        } catch (e) {
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

export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number, raw?: boolean } = {}) {
    if (!id) return null;
    if (options.raw) return `${PUBLIC_URL}/assets/${id}`;
    const { width = 1200, format = 'avif', quality = 80 } = options;
    return `${PUBLIC_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`;
}

/* ==========================================================================
   SECCIÓN: FUNCIONES DE MUTACIÓN (ADMIN / CLIENT-SIDE)
   ========================================================================== */

export async function loginAdmin(email: string, password: string) {
    try {
        const res = await fetch(`${PUBLIC_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.data?.access_token) return { success: true, accessToken: data.data.access_token };
        return { success: false, message: 'CREDENCIALES INVÁLIDAS' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function uploadFile(file: File, token: string) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${PUBLIC_URL}/files`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const result = await res.json();
        return { success: !result.errors, id: result.data?.id, ...result };
    } catch (e) {
        return { success: false, message: 'Error uploading' };
    }
}

export async function createArtwork(data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/artworks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function updateArtwork(id: string, data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/artworks/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function createArticle(data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/magazine`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function updateArticle(id: string, data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/magazine/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}
