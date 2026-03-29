/**
 * Capa de Conexión centralizada con Directus API REST.
 * Implementa redundancia de red (Internal -> Public fallback).
 */

export const PUBLIC_DIRECTUS_URL = 'https://admin.javiermix.ar';
export const INTERNAL_DIRECTUS_URL = 'http://javiermix_directus:8055';

export const DIRECTUS_STATIC_TOKEN = 'cUeA7kBwUSS-jhhObI4fUdUX6DiwCYci';

/**
 * Utility to fetch from Directus with internal/public fallback
 */
export async function fetchFromDirectus(path: string, options: RequestInit = {}) {
    // Inject secure static token if none provided in headers
    if (DIRECTUS_STATIC_TOKEN) {
        options.headers = {
            'Authorization': `Bearer ${DIRECTUS_STATIC_TOKEN}`,
            ...options.headers
        };
    }

    // Try Internal first (High speed within Docker)
    try {
        console.log(`[Directus Debug] Trying Internal: ${INTERNAL_DIRECTUS_URL}${path}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); 
        
        const res = await fetch(`${INTERNAL_DIRECTUS_URL}${path}`, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) return res;
    } catch (e: any) {
        console.warn(`[Directus Warning] Internal failed (${e.message}). Falling back to Public.`);
    }

    // Fallback to Public (Internet)
    console.log(`[Directus Debug] Fetching Public: ${PUBLIC_DIRECTUS_URL}${path}`);
    return fetch(`${PUBLIC_DIRECTUS_URL}${path}`, options);
}

// Para compatibilidad con código existente que usa FETCH_URL
const FETCH_URL = INTERNAL_DIRECTUS_URL;

export async function getSeries() {
  try {
    const folderRes = await fetchFromDirectus(`/folders?filter[name][_eq]=Catalogo`);
    const folderData = await folderRes.json();
    const parentFolder = folderData.data?.[0];
    if (!parentFolder) return [];

    const subfoldersRes = await fetchFromDirectus(`/folders?filter[parent][_eq]=${parentFolder.id}`);
    const subfoldersData = await subfoldersRes.json();
    return subfoldersData.data || [];
  } catch (e: any) {
    console.error("Error fetching series:", e);
    return [];
  }
}

export async function getArtworksBySeries(seriesId: string) {
  try {
    const res = await fetchFromDirectus(`/items/obras?filter[serie][_eq]=${seriesId}&fields=*,archivo.*`);
    const data = await res.json();
    return data.data || [];
  } catch (e: any) {
    console.error("Error fetching artworks:", e);
    return [];
  }
}

export async function getArtworkById(id: string) {
  try {
    const res = await fetchFromDirectus(`/items/obras/${id}?fields=*,archivo.*`);
    const data = await res.json();
    return data.data;
  } catch (e: any) {
    console.error("Error fetching artwork:", e);
    return null;
  }
}

export function getAssetUrl(id: string) {
  if (!id) return null;
  // Route to Astro API proxy for secure streaming without exposing token
  return `/api/assets/${id}`;
}

export async function getArticles(token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetchFromDirectus('/items/magazine?sort=-created_at', { headers });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
}

export async function getArtworks(token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetchFromDirectus('/items/obras?sort=-created_at&limit=-1', { headers });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
}

export async function getCatalogoFiles() {
  try {
    const res2 = await fetchFromDirectus('/files?limit=-1&fields=id,filename_download,type,title,folder.name');
    const data = await res2.json();
    return data.data?.map((f: any) => ({ ...f, serie_name: f.folder?.name })) || [];
  } catch (e) { return []; }
}

export async function addLike(artworkId: string, ip: string) {
    try {
        const res = await fetchFromDirectus(`/items/obras?filter[archivo][_eq]=${artworkId}`);
        const data = await res.json();
        const obra = data.data?.[0];
        if (!obra) return { success: false, message: "Obra no encontrada" };
        
        const newLikes = (obra.likes || 0) + 1;
        await fetchFromDirectus(`/items/obras/${obra.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ likes: newLikes })
        });
        return { success: true };
    } catch(e) { return { success: false, message: "Error al dar like" }; }
}

export async function uploadFile(file: File, token?: string) {
  if (!token) return { success: false, message: 'No token provided' };
  const formData = new FormData();
  formData.append('title', file.name);
  formData.append('file', file);
  try {
    const res = await fetchFromDirectus('/files', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.data) return { success: true, id: data.data.id };
    return { success: false, message: data.errors?.[0]?.message || 'Upload failed' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function createArticle(articleData: any, token?: string) {
  if (!token) return { success: false, message: 'No token provided' };
  try {
    const res = await fetchFromDirectus('/items/magazine', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleData)
    });
    const data = await res.json();
    if (res.ok) return { success: true, data: data.data };
    return { success: false, message: data.errors?.[0]?.message || 'Error creating article' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function updateArticle(id: string, articleData: any, token?: string) {
  if (!token) return { success: false, message: 'No token provided' };
  try {
    const res = await fetchFromDirectus(`/items/magazine/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleData)
    });
    const data = await res.json();
    if (res.ok) return { success: true, data: data.data };
    return { success: false, message: data.errors?.[0]?.message || 'Error updating article' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function getArticleDetails(id: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetchFromDirectus(`/items/magazine/${id}`, { headers });
    const data = await res.json();
    return data.data;
  } catch (e: any) {
    console.error("Error fetching article details:", e);
    return null;
  }
}

export async function createArtwork(artworkData: any, token?: string) {
  if (!token) return { success: false, message: 'No token provided' };
  try {
    const res = await fetchFromDirectus('/items/obras', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(artworkData)
    });
    const data = await res.json();
    if (res.ok) return { success: true, data: data.data };
    return { success: false, message: data.errors?.[0]?.message || 'Error creating artwork' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function updateArtwork(id: string, artworkData: any, token?: string) {
  if (!token) return { success: false, message: 'No token provided' };
  try {
    const res = await fetchFromDirectus(`/items/obras/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(artworkData)
    });
    const data = await res.json();
    if (res.ok) return { success: true, data: data.data };
    return { success: false, message: data.errors?.[0]?.message || 'Error updating artwork' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function getSerieDetails(folderId: string) {
    try {
        const titleRes = await fetchFromDirectus(`/folders/${folderId}`);
        const titleData = await titleRes.json();
        const serieName = titleData.data?.name || "Serie";

        const filesRes = await fetchFromDirectus(`/files?filter[folder][_eq]=${folderId}`);
        const filesData = await filesRes.json();
        return { name: serieName, items: filesData.data || [] };
    } catch (e: any) {
        console.error("Error fetching serie details:", e);
        return { name: "Serie", items: [] };
    }
}

export async function getArtworkLikes(fileId: string) {
    try {
        const res = await fetchFromDirectus(`/items/obras?filter[archivo][_eq]=${fileId}`);
        const data = await res.json();
        return data.data?.[0]?.likes || 0;
    } catch (e) {
        return 0;
    }
}

export const DIRECTUS_URL = PUBLIC_DIRECTUS_URL;

export async function getArtworkDetails(id: string) {
    try {
        const res = await fetchFromDirectus(`/items/obras/${id}?fields=*,archivo.*`);
        const data = await res.json();
        const obra = data.data;
        if (!obra || !obra.archivo) return null;
        return { mainFile: obra.archivo, meta: obra };
    } catch (e) {
        console.error("Error fetching artwork details:", e);
        return null;
    }
}

export async function loginAdmin(password: string) {
    try {
        const res = await fetchFromDirectus('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@javiermix.ar', password })
        });
        const data = await res.json();
        if (data.data?.access_token) return { success: true, token: data.data.access_token };
        return { success: false };
    } catch (e) { return { success: false }; }
}

export async function getCertificates(token?: string) {
    try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetchFromDirectus('/items/certificates?sort=-created_at&fields=*,artwork_id.*,collector_id.*', { headers });
        const data = await res.json();
        return data.data || [];
    } catch (e) { return []; }
}

export async function getCertificateByUuid(id: string, token?: string) {
    try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetchFromDirectus(`/items/certificates/${id}?fields=*,artwork_id.*,collector_id.*`, { headers });
        const data = await res.json();
        return data.data;
    } catch (e) { return null; }
}
