/**
 * Capa de Conexión centralizada con Directus API REST.
 * Implementa redundancia de red (Internal -> Public fallback) y autenticación por Token.
 */

// Usamos import.meta.env para Astro o valores por defecto del VPS
export const PUBLIC_DIRECTUS_URL = import.meta.env?.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
export const INTERNAL_DIRECTUS_URL = import.meta.env?.INTERNAL_DIRECTUS_URL || 'http://javiermix_directus:8055';
const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';
import { REDIS } from './redis';

/**
 * Utility to fetch from Directus with internal/public fallback and Token auth
 */
export async function fetchFromDirectus(path: string, options: RequestInit = {}) {
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json'
    };

    // Try Internal first (High speed within Docker)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); 
        
        const res = await fetch(`${INTERNAL_DIRECTUS_URL}${path}`, { 
            ...options, 
            headers,
            signal: controller.signal 
        });
        clearTimeout(timeoutId);
        if (res.ok) return res;
    } catch (e: any) {
        // console.warn(`[Directus Warning] Internal failed. Falling back to Public.`);
    }

    // Fallback to Public (Internet)
    try {
        return await fetch(`${PUBLIC_DIRECTUS_URL}${path}`, { ...options, headers });
    } catch (err) {
        console.error("[Directus Error] Fallback fetch failed:", err.message);
        throw err;
    }
}

export async function getSeries() {
  try {
    const folderRes = await fetchFromDirectus(`/folders?filter[name][_eq]=Catalogo`);
    const folderData = await folderRes.json();
    const parentFolder = folderData.data?.[0];
    if (!parentFolder) return [];

    const subfoldersRes = await fetchFromDirectus(`/folders?filter[parent][_eq]=${parentFolder.id}`);
    const subfoldersData = await subfoldersRes.json();
    const folders = subfoldersData.data || [];

    // Enriquecer con portada (primer archivo) y conteo
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
    console.error("Error fetching series:", e);
    return [];
  }
}

export async function getSerieDetails(folderId: string) {
    try {
        const folderRes = await fetchFromDirectus(`/folders/${folderId}`);
        const folderData = await folderRes.json();
        
        const filesRes = await fetchFromDirectus(`/files?filter[folder][_eq]=${folderId}&sort=filename_download`);
        const filesData = await filesRes.json();
        
        // Filtrar solo imágenes y excluir archivos que no sean obras (ej: .xmp)
        const items = (filesData.data || []).filter((f: any) => f.type.includes('image'));

        return {
            name: folderData.data?.name || "Serie",
            items
        };
    } catch (e) {
        console.error("Error fetching serie details:", e);
        return { name: "Error", items: [] };
    }
}

export async function getArtworkLikes(artworkId: string) {
  try {
    // 1. Get filename first
    const fileRes = await fetchFromDirectus(`/files/${artworkId}`);
    const fileData = await fileRes.json();
    const filename = fileData.data?.filename_download;
    if (!filename) return 0;

    const redisKey = `likes:${filename}`;

    // 2. Try Redis first
    const cachedLikes = await REDIS.get(redisKey);
    if (cachedLikes !== null) return parseInt(cachedLikes);

    // 3. Fallback to Directus
    const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${filename}`);
    const data = await res.json();
    const likes = data.data?.[0]?.likes || 0;

    // 4. Update Redis
    await REDIS.set(redisKey, likes.toString(), 'EX', 3600); // Cache for 1 hour

    return likes;
  } catch (e) {
    console.error("Error in getArtworkLikes:", e);
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

        // 1. Check IP tracking in Redis (Prevention of spam)
        const ipKey = `track:${filename}:${ip}`;
        const hasVoted = await REDIS.get(ipKey);
        if (hasVoted) return { success: false, message: "Ya has votado por esta obra" };

        // 2. Immediate Logic: Redis + Directus
        const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${filename}`);
        const data = await res.json();
        let artworkRecord = data.data?.[0];

        let newLikes = 1;

        if (!artworkRecord) {
            await fetchFromDirectus(`/items/artworks`, {
                method: 'POST',
                body: JSON.stringify({
                    filename: filename,
                    title: file.title || "Sin título",
                    likes: 1
                })
            });
        } else {
            newLikes = (artworkRecord.likes || 0) + 1;
            await fetchFromDirectus(`/items/artworks/${artworkRecord.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ likes: newLikes })
            });
        }

        // 3. Update Redis Cache and Track IP
        await REDIS.set(redisKey, newLikes.toString());
        await REDIS.set(ipKey, '1', 'EX', 86400 * 7); // Block for 1 week

        return { success: true, likes: newLikes };
    } catch (e: any) {
        console.error("Error in addLike:", e);
        return { success: false, message: e.message };
    }
}

export async function getArtworks() {
  try {
    const res = await fetchFromDirectus(`/items/artworks?limit=-1`);
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    return [];
  }
}

export async function getCatalogoFiles() {
    try {
        // 1. Obtener ID de la carpeta "Catalogo"
        const folderRes = await fetchFromDirectus(`/folders?filter[name][_eq]=Catalogo`);
        const folderData = await folderRes.json();
        const rootId = folderData.data?.[0]?.id;
        if (!rootId) return [];

        // 2. Obtener subcarpetas (series)
        const subsRes = await fetchFromDirectus(`/folders?filter[parent][_eq]=${rootId}`);
        const subsData = await subsRes.json();
        const seriesFolders = subsData.data || [];
        const seriesMap = new Map(seriesFolders.map((f: any) => [f.id, f.name]));

        // 3. Obtener todos los archivos de esas carpetas
        const folderIds = seriesFolders.map((f: any) => f.id);
        if (folderIds.length === 0) return [];

        const filesRes = await fetchFromDirectus(`/files?filter[folder][_in]=${folderIds.join(',')}&limit=-1`);
        const filesData = await filesRes.json();

        // 4. Mapear archivos agregando el nombre de la serie
        return (filesData.data || []).map((file: any) => ({
            ...file,
            serie_name: seriesMap.get(file.folder) || "Sin Serie"
        }));

    } catch (e) {
        console.error("Error fetching catalogo files:", e);
        return [];
    }
}

export async function getArtworkById(id: string) {
  try {
    const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${id}`); 
    const data = await res.json();
    return data.data?.[0] || null;
  } catch (e) {
    return null;
  }
}

export async function getArtworkDetails(id: string) {
    try {
        // 1. Obtener el archivo principal de Directus
        const fileRes = await fetchFromDirectus(`/files/${id}`);
        const fileData = await fileRes.json();
        const mainFile = fileData.data;
        
        if (!mainFile) return null;

        // 2. Obtener metadatos extendidos de la colección artworks
        const res = await fetchFromDirectus(`/items/artworks?filter[filename][_eq]=${mainFile.filename_download}`);
        const data = await res.json();
        const meta = data.data?.[0] || null;

        return {
            mainFile,
            meta
        };
    } catch (e) {
        console.error("Error fetching artwork details:", e);
        return null;
    }
}

/**
 * Genera la URL para un asset con optimización dinámica.
 * Por defecto solicita AVIF para el "Wow Factor" en calidad 80.
 */
export function getAssetUrl(id: string, options: { width?: number, format?: string, quality?: number } = {}) {
    if (!id) return null;

    const { 
        width = 1200, 
        format = 'avif', 
        quality = 80 
    } = options;

    return `${PUBLIC_DIRECTUS_URL}/assets/${id}?width=${width}&format=${format}&quality=${quality}`;
}

