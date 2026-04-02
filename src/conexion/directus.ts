/**
 * Capa de Conexión centralizada con Directus API REST.
 * Implementa redundancia de red (Internal -> Public fallback), autenticación por Token
 * y Caching de alto rendimiento con Redis para likes.
 */

import { REDIS } from './redis';

// Configuración de URLs (Blindaje HTTPS)
const rawPublicUrl = import.meta.env?.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
export const PUBLIC_DIRECTUS_URL = rawPublicUrl.startsWith('http://') 
    ? rawPublicUrl.replace('http://', 'https://') 
    : rawPublicUrl;

export const INTERNAL_DIRECTUS_URL = import.meta.env?.INTERNAL_DIRECTUS_URL || 'http://javiermix_directus:8055';
export const DIRECTUS_URL = PUBLIC_DIRECTUS_URL;

// Token de Acceso (Mantener privado en el servidor)
const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * Utility to fetch from Directus with internal/public fallback and Token auth
 */
export async function fetchFromDirectus(path: string, options: RequestInit = {}) {
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (!headers['Authorization']) {
        headers['Authorization'] = `Bearer ${DIRECTUS_TOKEN}`;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); 
        
        const res = await fetch(`${INTERNAL_DIRECTUS_URL}${path}`, { 
            ...options, 
            headers,
            signal: controller.signal 
        });
        clearTimeout(timeoutId);
        if (res.ok) return res;
    } catch (e: any) {}

    try {
        return await fetch(`${PUBLIC_DIRECTUS_URL}${path}`, { ...options, headers });
    } catch (err: any) {
        console.error("[Directus Error] Fallback fetch failed:", err.message);
        throw err;
    }
}

/* ==========================================================================
   SECCIÓN: AUTENTICACIÓN
   ========================================================================== */

export async function loginAdmin(email: string, password: string) {
    try {
        const res = await fetch(`${PUBLIC_DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, accessToken: data.data.access_token };
        }
        return { success: false, message: data.errors?.[0]?.message || "Credenciales inválidas" };
    } catch (e) {
        return { success: false, message: "Error de conexión con el servidor" };
    }
}

/* ==========================================================================
   SECCIÓN: CATÁLOGO Y SERIES
   ========================================================================== */

export async function getSeries() {
  try {
    const folderRes = await fetchFromDirectus(`/folders?filter[name][_eq]=Catalogo`);
    const folderData = await folderRes.json();
    const parentFolder = folderData.data?.[0];
    if (!parentFolder) return [];

    const subfoldersRes = await fetchFromDirectus(`/folders?filter[parent][_eq]=${parentFolder.id}`);
    const subfoldersData = await subfoldersRes.json();
    const folders = subfoldersData.data || [];

    return await Promise.all(folders.map(async (f: any) => {
        const filesRes = await fetchFromDirectus(`/files?filter[folder][_eq]=${f.id}&filter[type][_contains]=image&limit=1`);
        const filesData = await filesRes.json();
        
        const countRes = await fetchFromDirectus(`/files?filter[folder][_eq]=${f.id}&filter[type][_contains]=image&aggregate[count]=*`);
        const countData = await countRes.json();

        return {
            id: f.id,
            name: f.name,
            coverId: filesData.data?.[0]?.id || null,
            count: countData.data?.[0]?.count || 0
        };
    }));
  } catch (e: any) {
    return [];
  }
}

export async function getSerieDetails(folderId: string) {
    try {
        const folderRes = await fetchFromDirectus(`/folders/${folderId}`);
        const folderData = await folderRes.json();
        const filesRes = await fetchFromDirectus(`/files?filter[folder][_eq]=${folderId}&sort=filename_download`);
        const filesData = await filesRes.json();
        const items = (filesData.data || []).filter((f: any) => f.type.includes('image'));
        return { name: folderData.data?.name || "Serie", items };
    } catch (e) {
        return { name: "Error", items: [] };
    }
}

export async function getCatalogoFiles() {
    try {
        const folderRes = await fetchFromDirectus(`/folders?filter[name][_eq]=Catalogo`);
        const folderData = await folderRes.json();
        const rootId = folderData.data?.[0]?.id;
        if (!rootId) return [];

        const subsRes = await fetchFromDirectus(`/folders?filter[parent][_eq]=${rootId}`);
        const subsData = await subsRes.json();
        const seriesFolders = subsData.data || [];
        const seriesMap = new Map(seriesFolders.map((f: any) => [f.id, f.name]));

        const folderIds = seriesFolders.map((f: any) => f.id);
        if (folderIds.length === 0) return [];

        const filesRes = await fetchFromDirectus(`/files?filter[folder][_in]=${folderIds.join(',')}&limit=-1`);
        const filesData = await filesRes.json();

        return (filesData.data || []).map((file: any) => ({
            ...file,
            serie_name: seriesMap.get(file.folder) || "Sin Serie"
        }));
    } catch (e) {
        return [];
    }
}

/* ==========================================================================
   SECCIÓN: OBRAS (ARTWORKS)
   ========================================================================== */

export async function getArtworks() {
  try {
    const res = await fetchFromDirectus(`/items/artworks?limit=-1`);
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    return [];
  }
}

export async function getArtworkById(id: string) {
  try {
    // Buscar por ID numérico o por filename_download
    const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${id}`); 
    const data = await res.json();
    // Si no lo encuentra por filename, intentar por ID directo
    if (!data.data?.[0]) {
        const resId = await fetchFromDirectus(`/items/artworks/${id}`);
        const dataId = await resId.json();
        return dataId.data || null;
    }
    return data.data?.[0] || null;
  } catch (e) {
    return null;
  }
}

export async function getArtworkDetails(id: string) {
    try {
        const fileRes = await fetchFromDirectus(`/files/${id}`);
        const fileData = await fileRes.json();
        const mainFile = fileData.data;
        if (!mainFile) return null;

        const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${mainFile.filename_download}`);
        const data = await res.json();
        const meta = data.data?.[0] || null;

        return { mainFile, meta };
    } catch (e) {
        return null;
    }
}

export async function createArtwork(data: any, token: string) {
    const res = await fetchFromDirectus(`/items/artworks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function updateArtwork(id: string, data: any, token: string) {
    const res = await fetchFromDirectus(`/items/artworks/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

/* ==========================================================================
   SECCIÓN: LIKES (CON REDIS)
   ========================================================================== */

export async function getArtworkLikes(artworkId: string) {
  try {
    const fileRes = await fetchFromDirectus(`/files/${artworkId}`);
    const fileData = await fileRes.json();
    const filename = fileData.data?.filename_download;
    if (!filename) return 0;

    const redisKey = `likes:${filename}`;
    const cachedLikes = await REDIS.get(redisKey);
    if (cachedLikes !== null) return parseInt(cachedLikes);

    const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${filename}`);
    const data = await res.json();
    const likes = data.data?.[0]?.likes || 0;

    await REDIS.set(redisKey, likes.toString(), 'EX', 3600);
    return likes;
  } catch (e) {
    return 0;
  }
}

export async function addLike(artworkId: string, ip: string) {
    try {
        const fileRes = await fetchFromDirectus(`/files/${artworkId}`);
        const fileData = await fileRes.json();
        const file = fileData.data;
        if (!file) return { success: false, message: "Obra no encontrada" };

        const filename = file.filename_download;
        const redisKey = `likes:${filename}`;
        const ipKey = `track:${filename}:${ip}`;

        const hasVoted = await REDIS.get(ipKey);
        if (hasVoted) return { success: false, message: "Ya has votado por esta obra" };

        const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${filename}`);
        const data = await res.json();
        let artworkRecord = data.data?.[0];

        let newLikes = 1;
        if (!artworkRecord) {
            await fetchFromDirectus(`/items/artworks`, {
                method: 'POST',
                body: JSON.stringify({ filename, title: file.title || "Sin título", likes: 1 })
            });
        } else {
            newLikes = (artworkRecord.likes || 0) + 1;
            await fetchFromDirectus(`/items/artworks/${artworkRecord.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ likes: newLikes })
            });
        }

        await REDIS.set(redisKey, newLikes.toString());
        await REDIS.set(ipKey, '1', 'EX', 86400 * 7);

        return { success: true, likes: newLikes };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

/* ==========================================================================
   SECCIÓN: REVISTA / MAGAZINE
   ========================================================================== */

export async function getArticles(token?: string) {
    try {
        const options: any = {};
        if (token) options.headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetchFromDirectus(`/items/magazine?sort=-created_at&fields=*,user_created.*`, options);
        const data = await res.json();
        return data.data || [];
    } catch (e) {
        return [];
    }
}

export async function getArticleDetails(id: string, token?: string) {
    try {
        const options: any = {};
        if (token) options.headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetchFromDirectus(`/items/magazine/${id}?fields=*,user_created.*`, options);
        const data = await res.json();
        return data.data || null;
    } catch (e) {
        return null;
    }
}

export async function createArticle(data: any, token: string) {
    const res = await fetchFromDirectus(`/items/magazine`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function updateArticle(id: string, data: any, token: string) {
    const res = await fetchFromDirectus(`/items/magazine/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

/* ==========================================================================
   SECCIÓN: CERTIFICADOS (SALES)
   ========================================================================== */

export async function getCertificates(token?: string) {
    try {
        const options: any = {};
        if (token) options.headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetchFromDirectus(`/items/sales?fields=*,artwork_id.*,collector_id.*&sort=-sale_date`, options);
        const data = await res.json();
        return data.data || [];
    } catch (e) {
        return [];
    }
}

export async function getCertificateByUuid(uuid: string, token?: string) {
    try {
        const options: any = {};
        if (token) options.headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetchFromDirectus(`/items/sales?filter[uuid][_eq]=${uuid}&fields=*,artwork_id.*,collector_id.*`, options);
        const data = await res.json();
        return data.data?.[0] || null;
    } catch (e) {
        return null;
    }
}

/* ==========================================================================
   SECCIÓN: UTILIDADES Y ASSETS
   ========================================================================== */

export async function uploadFile(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${PUBLIC_DIRECTUS_URL}/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    const result = await res.json();
    return { success: !result.errors, id: result.data?.id, ...result };
}

export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number } = {}) {
    if (!id) return null;
    const { width = 1200, format = 'avif', quality = 80 } = options;
    const url = `${PUBLIC_DIRECTUS_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`;
    return url.replace('http://', 'https://');
}
