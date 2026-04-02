/**
 * Capa de Conexión centralizada con Directus API REST.
 * Implementa redundancia de red (Internal -> Public fallback).
 */

export const PUBLIC_DIRECTUS_URL = 'https://admin.javiermix.ar';
export const INTERNAL_DIRECTUS_URL = 'http://javiermix_directus:8055';

/**
 * Utility to fetch from Directus with internal/public fallback
 */
export async function fetchFromDirectus(path: string, options: RequestInit = {}) {
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
  } catch (e) {
    console.error("Error fetching artwork:", e);
    return null;
  }
}

export function getAssetUrl(id: string) {
  if (!id) return null;
  return `${PUBLIC_DIRECTUS_URL}/assets/${id}`;
}
