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

// 🌐 Configuración de URLs
const PUBLIC_URL = import.meta.env?.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
const INTERNAL_URL = import.meta.env?.INTERNAL_DIRECTUS_URL || 'http://javiermix-directus:8055'; 
const STATIC_TOKEN = import.meta.env?.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * 🛰️ Cliente Directus
 */
export class DirectusManager {
    private static client: any = null;
    private static isLocalFallback = false;

    public static getBaseUrl() { return PUBLIC_URL; }

    public static async getClient() {
        if (!this.client) {
            const isServer = typeof window === 'undefined';
            let baseUrl = isServer ? INTERNAL_URL : PUBLIC_URL;
            
            try {
                // Configuración inicial con timeout para validación de red
                const checkConnection = async (url: string) => {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 3000);
                    try {
                        const res = await fetch(`${url}/items/laboratorio_entornos?limit=1`, { 
                            signal: controller.signal,
                            headers: { 'Authorization': `Bearer ${STATIC_TOKEN}` }
                        });
                        return res.ok;
                    } catch (e) { return false; }
                    finally { clearTimeout(timeout); }
                };

                if (isServer) {
                    console.log(`[DirectusManager] 🔍 Probando conectividad interna: ${INTERNAL_URL}`);
                    const isInternalUp = await checkConnection(INTERNAL_URL);
                    if (!isInternalUp) {
                        console.warn(`[DirectusManager] ⚠️ URL Interna inalcanzable, conmutando a Pública: ${PUBLIC_URL}`);
                        baseUrl = PUBLIC_URL;
                    } else {
                        console.log(`[DirectusManager] ✅ Conexión interna exitosa.`);
                    }
                }

                const finalClient = createDirectus(baseUrl).with(rest());
                this.client = (STATIC_TOKEN && STATIC_TOKEN !== 'undefined') 
                    ? finalClient.with(staticToken(STATIC_TOKEN))
                    : finalClient;

                console.log(`[DirectusManager] 🚀 Cliente inicializado en: ${baseUrl}`);

            } catch (error: any) {
                console.error(`[DirectusManager] ❌ Error fatal al inicializar cliente:`, error.message);
                // Fallback de emergencia a la URL pública si todo lo demás falla
                const fallbackClient = createDirectus(PUBLIC_URL).with(rest());
                this.client = (STATIC_TOKEN && STATIC_TOKEN !== 'undefined') 
                    ? fallbackClient.with(staticToken(STATIC_TOKEN))
                    : fallbackClient;
            }
        }
        return this.client;
    }

    // 🚀 RESTAURADA: Función necesaria para peticiones manuales
    public static async fetchShim(path: string, options: RequestInit = {}) {
        const useInternal = !this.isLocalFallback && typeof window === 'undefined';
        const baseUrl = useInternal ? INTERNAL_URL : PUBLIC_URL;
        const url = `${baseUrl}${path}`;
        
        // 🔓 Intento sin token primero para evitar bloqueos 403 si el rol público ya tiene acceso
        const headers: any = { 
            'Content-Type': 'application/json', 
            ...options.headers 
        };
        
        // Solo añadir Authorization si el token parece válido
        if (STATIC_TOKEN && STATIC_TOKEN.length > 10) {
            headers['Authorization'] = `Bearer ${STATIC_TOKEN}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok && response.status === 403) {
                // Si da 403, re-intentamos SIN token por si acaso
                const publicHeaders = { 'Content-Type': 'application/json', ...options.headers };
                return await fetch(url, { ...options, headers: publicHeaders });
            }
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
   SECCIÓN: FUNCIONES DE DATOS (TODAS RESTAURADAS)
   ========================================================================== */

export async function getHomeFiles() {
    try {
        const client = await DirectusManager.getClient();
        const folders = await client.request(readFolders({ filter: { name: { _eq: 'Home' } }, limit: 1 }));
        const homeId = folders[0]?.id;
        if (!homeId) return [];
        return await client.request(readFiles({ filter: { folder: { _eq: homeId } }, sort: ['filename_download'], limit: -1 }));
    } catch (e) { return []; }
}

export async function getLaboratorioFiles() {
    try {
        const client = await DirectusManager.getClient();
        const folders = await client.request(readFolders({ filter: { name: { _eq: 'Laboratorio' } }, limit: 1 }));
        const labId = folders[0]?.id;
        if (!labId) return [];
        return await client.request(readFiles({ filter: { folder: { _eq: labId } }, sort: ['filename_download'], limit: -1 }));
    } catch (e) { return []; }
}

export async function getHurlinghamFiles() {
    try {
        const client = await DirectusManager.getClient();
        // 1. Encontrar la carpeta raíz
        const rootFolders = await client.request(readFolders({ filter: { name: { _eq: 'Estudio Hurlingham' } }, limit: 1 }));
        const rootId = rootFolders[0]?.id;
        if (!rootId) return [];

        // 2. Encontrar todas las subcarpetas (series/sesiones)
        const subFolders = await client.request(readFolders({ filter: { parent: { _eq: rootId } }, limit: -1 }));
        const folderIds = [rootId, ...subFolders.map((f: any) => f.id)];
        
        // Crear un mapa de nombres de carpetas para categorizar
        const folderMap = new Map();
        folderMap.set(rootId, "General");
        subFolders.forEach((f: any) => folderMap.set(f.id, f.name));

        // 3. Obtener todos los archivos de todas esas carpetas
        const files = await client.request(readFiles({ 
            filter: { folder: { _in: folderIds } }, 
            sort: ['-filename_download'], 
            limit: -1 
        }));

        // 4. Mapear archivos con el nombre de su serie
        return (files as any[]).map((file: any) => ({
            ...file,
            serie_name: folderMap.get(file.folder) || "Sesión Desconocida"
        }));
    } catch (e) { 
        console.error("[getHurlinghamFiles] Error:", e);
        return []; 
    }
}

export async function getSeries() {
    try {
        const client = await DirectusManager.getClient();
        // Primero encontrar la carpeta raíz "Catalogo"
        const catalogoFolders = await client.request(readFolders({ filter: { name: { _in: ['Catalogo', 'Coleccion'] } }, limit: 1 }));
        const catalogoId = catalogoFolders[0]?.id;
        if (!catalogoId) return [];
        // Obtener TODAS las subcarpetas de Catalogo
        const seriesFolders = await client.request(readFolders({ filter: { parent: { _eq: catalogoId } }, limit: -1 }));
        const series = await Promise.all(seriesFolders.map(async (f: any) => {
            // Contar archivos en esta carpeta (excluyendo variantes _2 si es posible, o contando todos)
            const files = await client.request(readFiles({ filter: { folder: { _eq: f.id } }, limit: -1 }));
            if (files.length === 0) return null;
            
            // Filtrar principales para el conteo real de "obras"
            const mainFilesCount = files.filter((file: any) => !file.filename_download.toLowerCase().includes('_2')).length;

            return { 
                id: f.id, 
                name: f.name, 
                description: f.description || "Explora esta serie exclusiva de obras Fine Art.",
                count: mainFilesCount || files.length,
                coverId: files[0]?.id || null 
            };
        }));
        return series.filter(s => s !== null);
    } catch (e) { return []; }
}

export async function getSerieDetails(folderId: string) {
    try {
        const client = await DirectusManager.getClient();
        // Usar readFolders en lugar de readItem para evitar restricciones de colecciones del sistema en v11
        const folders = await client.request(readFolders({ filter: { id: { _eq: folderId } } as any, limit: 1 }));
        const folder = folders[0];
        if (!folder) return { name: 'Colección', items: [] };
        const items: any = await client.request(readFiles({ filter: { folder: { _eq: folderId } }, limit: -1 }));
        return { name: folder.name, items: items || [] };
    } catch (e) { 
        console.error('[getSerieDetails] Error:', e);
        return { name: 'Colección', items: [] }; 
    }
}

export async function createOrder(data: any) { try { const client = await DirectusManager.getClient(); return await client.request(createItem('orders', data)); } catch (e) { return null; } }
export async function updateOrder(id: string, data: any) { try { const client = await DirectusManager.getClient(); return await client.request(updateItem('orders', id, data)); } catch (e) { return null; } }
export async function getOrder(id: string) { try { const client = await DirectusManager.getClient(); return await client.request(readItem('orders', id)); } catch (e) { return null; } }

export async function createCollector(data: any) { 
    try { 
        const client = await DirectusManager.getClient(); 
        const existing = await client.request(readItems('collectors', { filter: { email: { _eq: data.email } }, limit: 1 }));
        if (existing.length > 0) return existing[0];
        return await client.request(createItem('collectors', data)); 
    } catch (e) { return null; } 
}

export async function createCertificate(data: any) { 
    try { 
        const client = await DirectusManager.getClient(); 
        return await client.request(createItem('certificates', data)); 
    } catch (e) { return null; } 
}

export async function getArticles() { 
    try { 
        const client = await DirectusManager.getClient(); 
        return await client.request(readItems('magazine' as any, { 
            sort: ['-date_created'],
            fields: ['*', { user_created: ['*'] }] 
        })); 
    } catch (e: any) { 
        console.error(`[Directus] Fallo total en artículos:`, e.message);
        return []; 
    } 
}
export async function getArticleDetails(idOrSlug: string) { 
    try { 
        const client = await DirectusManager.getClient(); 
        const results = await client.request(readItems('magazine' as any, { 
            filter: { _or: [{ id: { _eq: idOrSlug } }, { slug: { _eq: idOrSlug } }] }, 
            fields: ['*', { user_created: ['*'] }], 
            limit: 1 
        })); 
        return results[0] || null; 
    } catch (e: any) { 
        try {
            const client = await DirectusManager.getClient(); 
            const results = await client.request(readItems('Magazine' as any, { 
                filter: { _or: [{ id: { _eq: idOrSlug } }, { slug: { _eq: idOrSlug } }] },
                limit: 1 
            }));
            return results[0] || null;
        } catch (e2) {
            return null; 
        }
    } 
}

export async function getArtworkDetails(fileId: string) { 
    try { 
        const client = await DirectusManager.getClient(); 
        // Usar readFiles con filtro en lugar de readItem para evitar restricciones de v11
        const files = await client.request(readFiles({ filter: { id: { _eq: fileId } }, limit: 1 }));
        const file = files[0];
        if (!file) return null;
        return { mainFile: file, meta: null }; 
    } catch (e) { 
        console.error('[getArtworkDetails] Error:', e);
        return null; 
    } 
}
export async function getArtworkById(id: string) { 
    try { 
        const client = await DirectusManager.getClient(); 
        const items = await client.request(readItems('artworks', { filter: { id: { _eq: id } }, limit: 1 }));
        return items[0] || null;
    } catch (e) { return null; } 
}
export async function getArtworks() { try { const client = await DirectusManager.getClient(); return await client.request(readItems('artworks' as any, { limit: -1 })); } catch (e) { return []; } }
export async function getCertificates() { try { const client = await DirectusManager.getClient(); return await client.request(readItems('certificates' as any, { fields: ['*', { artwork_id: ['*'], collector_id: ['*'] }], limit: -1 })); } catch (e) { return []; } }
export async function getCertificateByUuid(uuid: string) { try { const client = await DirectusManager.getClient(); const results = await client.request(readItems('certificates', { filter: { id: { _eq: uuid } }, fields: ['*', { artwork_id: ['*'], collector_id: ['*'] }], limit: 1 })); return results[0] || null; } catch (e) { return null; } }
export async function getHomeSettings() { 
    try { 
        const res = await fetchFromDirectus('/items/home_settings?limit=1');
        const json = await res.json();
        const data = json.data;
        return Array.isArray(data) ? data[0] : data;
    } catch (e) { return null; } 
}

export async function getFooterSettings() { 
    try { 
        const res = await fetchFromDirectus('/items/footer_settings');
        const json = await res.json();
        const data = json.data;
        
        if (!data) {
            console.warn('[Directus] getFooterSettings: No se encontraron datos vía Shim.');
            return null;
        }

        console.log('[Directus] ✅ Footer Settings (Ruth Bernhard) detectados.');
        return Array.isArray(data) ? data[0] : data; 
    } catch (e: any) { 
        console.error('[Directus] Error en getFooterSettings (Shim):', e.message);
        return null; 
    } 
}

export async function getCatalogoFiles() { try { const client = await DirectusManager.getClient(); const folders = await client.request(readFolders({ filter: { name: { _in: ['Catalogo', 'Coleccion'] } } })); const rootId = folders[0]?.id; if (!rootId) return []; const seriesFolders = await client.request(readFolders({ filter: { parent: { _eq: rootId } } })); const seriesMap = new Map(seriesFolders.map((f: any) => [f.id, f.name])); const files = await client.request(readFiles({ filter: { folder: { _in: seriesFolders.map((f: any) => f.id) } }, limit: -1 })); return (files as any[]).map((file: any) => ({ ...file, serie_name: seriesMap.get(file.folder) || "Sin Serie" })); } catch (e) { return []; } }

export async function getApprovedExhibitionModes() {
    try {
        const client = await DirectusManager.getClient();
        // Por ahora hardcodeado como aprobado, preparado para leer de una colección 'laboratorio_modos'
        return [
            { 
                id: 'royal-gallery', 
                name: 'Royal Gallery', 
                path: '/laboratorio/galeria-real', 
                label: '- Royal Gallery -',
                isApproved: true 
            }
        ];
    } catch (e) { return []; }
}

export async function getLaboratorioEntornos() {
    try {
        const client = await DirectusManager.getClient();
        return await client.request(readItems('laboratorio_entornos' as any, {
            fields: ['*', { background_image: ['id'], background_audio: ['id'] }],
            sort: ['sort']
        }));
    } catch (e) {
        console.error('[Directus] Error fetching laboratorio_entornos:', e.message);
        if (e.errors) console.error('[Directus] Details:', JSON.stringify(e.errors));
        // Fallback si la colección no existe aún
        return [
            { name: 'Mármol Carrara', slug: 'gallery', icon: 'museum' },
            { name: 'Urban Brick', slug: 'night', icon: 'brick' },
            { name: 'Velvet Red', slug: 'velvet', icon: 'wine' }
        ];
    }
}

export async function getAudioFiles() {
    try {
        const client = await DirectusManager.getClient();
        return await client.request(readFiles({
            filter: {
                type: { _starts_with: 'audio/' }
            },
            limit: -1
        }));
    } catch (e) {
        console.error('[Directus] Error fetching audio files:', e);
        return [];
    }
}

export async function loginAdmin(email: string, password: string) {
    const res = await fetch(`${PUBLIC_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return { success: !!data.data?.access_token, accessToken: data.data?.access_token };
}

export async function uploadFile(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${PUBLIC_URL}/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    const result = await res.json();
    return { success: !result.errors, id: result.data?.id };
}

export async function createArtwork(data: any, token: string) { const res = await fetch(`${PUBLIC_URL}/items/artworks`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return await res.json(); }
export async function updateArtwork(id: string, data: any, token: string) { const res = await fetch(`${PUBLIC_URL}/items/artworks/${id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return await res.json(); }
export async function createArticle(data: any, token: string) { const res = await fetch(`${PUBLIC_URL}/items/magazine`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return await res.json(); }
export async function updateArticle(id: string, data: any, token: string) { const res = await fetch(`${PUBLIC_URL}/items/magazine/${id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return await res.json(); }

export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number, raw?: boolean } = {}) {
    if (!id) return null;
    if (options.raw) return `${PUBLIC_URL}/assets/${id}`;
    const { width = 1200, format = 'avif', quality = 80 } = options;
    return `${PUBLIC_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`;
}

// 🚀 RESTAURADA: Función que pedía la Revista
export const fetchFromDirectus = (path: string, options?: RequestInit) => DirectusManager.fetchShim(path, options);
