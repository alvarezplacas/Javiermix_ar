/**
 * Capa de Conexión centralizada con Directus API REST.
 * Cumple con la regla de "Fuente de Verdad" (Single Source of Truth).
 * Asegura compatibilidad local evitando errores ECONNREFUSED de SQL.
 */

export const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 
                    process.env.PUBLIC_DIRECTUS_URL || 
                    process.env.DIRECTUS_URL || 
                    'https://admin.javiermix.ar';

/**
 * Obtiene todas las series (carpetas) dentro de la carpeta "Catalogo".
 */
export async function getSeries() {
  try {
    const folderRes = await fetch(`${DIRECTUS_URL}/folders?filter[name][_eq]=Catalogo`);
    const folderData = await folderRes.json();
    const parentFolder = folderData.data?.[0];
    if (!parentFolder) return [];

    const subfoldersRes = await fetch(`${DIRECTUS_URL}/folders?filter[parent][_eq]=${parentFolder.id}`);
    const subfoldersData = await subfoldersRes.json();
    return subfoldersData.data || [];
  } catch (error) {
    console.error("Error en getSeries:", error);
    return [];
  }
}

/**
 * Obtiene todos los archivos dentro de la jerarquía de 'Catalogo'.
 * Útil para sincronizar archivos que ya existen en Directus pero no en la colección 'artworks'.
 */
export async function getCatalogoFiles() {
    try {
        const series = await getSeries();
        let allFiles: any[] = [];

        for (const serie of series) {
            const res = await fetch(`${DIRECTUS_URL}/files?filter[folder][_eq]=${serie.id}`);
            const data = await res.json();
            const files = (data.data || []).map((f: any) => ({
                ...f,
                serie_name: serie.name
            }));
            allFiles = [...allFiles, ...files];
        }
        return allFiles;
    } catch (error) {
        console.error("Error en getCatalogoFiles:", error);
        return [];
    }
}

/**
 * Obtiene los detalles de una serie y sus obras asociadas.
 */
export async function getSerieDetails(serieId: string) {
    try {
        // 1. Info de carpeta
        const folderRes = await fetch(`${DIRECTUS_URL}/folders/${serieId}`);
        const folderData = await folderRes.json();
        const name = folderData.data?.name?.replace(/_/g, ' ').toUpperCase() || "Serie";

        // 2. Archivos en esa carpeta
        const filesRes = await fetch(`${DIRECTUS_URL}/files?filter[folder][_eq]=${serieId}&sort=filename_download`);
        const filesData = await filesRes.json();
        const items = filesData.data || [];

        return { name, items };
    } catch (error) {
        console.error(`Error en getSerieDetails para ${serieId}:`, error);
        return { name: "Serie", items: [] };
    }
}

/**
 * Obtiene los detalles de una obra individual (archivo + metadatos).
 */
export async function getArtworkDetails(id: string) {
    try {
        const fileRes = await fetch(`${DIRECTUS_URL}/files/${id}`);
        const fileData = await fileRes.json();
        if (!fileData.data) return null;

        const mainFile = fileData.data;

        // Metadatos adicionales de la colección 'artworks'
        const artRes = await fetch(`${DIRECTUS_URL}/items/artworks?filter[filename][_eq]=${mainFile.filename_download}&limit=1`);
        const artData = await artRes.json();
        const meta = artData.data?.[0] || null;

        return { mainFile, meta };
    } catch (error) {
        console.error(`Error en getArtworkDetails para ${id}:`, error);
        return null;
    }
}

/**
 * Obtiene el conteo de likes para una obra.
 */
export async function getArtworkLikes(artworkId: string) {
    try {
        const res = await fetch(`${DIRECTUS_URL}/items/artwork_likes_tracking?filter[artwork_id][_eq]=${artworkId}&aggregate[count]=*`);
        const data = await res.json();
        return data.data?.[0]?.count || 0;
    } catch (error) {
        console.error("Error obteniendo likes:", error);
        return 0;
    }
}

/**
 * Verifica si una IP ya le dio like a una obra.
 */
export async function checkUserLike(artworkId: string, ip: string) {
    try {
        const res = await fetch(`${DIRECTUS_URL}/items/artwork_likes_tracking?filter[artwork_id][_eq]=${artworkId}&filter[ip_address][_eq]=${ip}&limit=1`);
        const data = await res.json();
        return data.data?.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Registra un nuevo like.
 */
export async function addLike(artworkId: string, ip: string) {
    try {
        const hasLiked = await checkUserLike(artworkId, ip);
        if (hasLiked) return { success: false, message: "Ya has dado like a esta obra." };

        const res = await fetch(`${DIRECTUS_URL}/items/artwork_likes_tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artwork_id: artworkId, ip_address: ip })
        });
        
        return { success: res.ok };
    } catch (error) {
        console.error("Error registrando like:", error);
        return { success: false };
    }
}

/**
 * Autentica un usuario en Directus y devuelve los tokens.
 */
export async function loginAdmin(email: string, password: string) {
    try {
        const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) {
            return { success: false, message: data.errors?.[0]?.message || "Error de autenticación" };
        }
        
        return { 
            success: true, 
            accessToken: data.data.access_token,
            refreshToken: data.data.refresh_token,
            expires: data.data.expires
        };
    } catch (error) {
        console.error("Error en loginAdmin:", error);
        return { success: false, message: "Error de conexión con el servidor" };
    }
}

/**
 * Obtiene todas las obras de la colección 'artworks'.
 */
export async function getArtworks() {
    try {
        const res = await fetch(`${DIRECTUS_URL}/items/artworks?sort=serie_id,title`);
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error("Error en getArtworks:", error);
        return [];
    }
}

/**
 * Crea una nueva obra en Directus.
 */
export async function createArtwork(artworkData: any, token?: string) {
    try {
        const headers: Record<string, string> = { 
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${DIRECTUS_URL}/items/artworks`, {
            method: 'POST',
            headers,
            body: JSON.stringify(artworkData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.errors?.[0]?.message || "Error al crear obra");
        return { success: true, data: data.data };
    } catch (error: any) {
        console.error("Error en createArtwork:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Obtiene una obra por ID.
 */
export async function getArtworkById(id: string) {
    try {
        const res = await fetch(`${DIRECTUS_URL}/items/artworks/${id}`);
        const data = await res.json();
        return data.data || null;
    } catch (error) {
        console.error("Error en getArtworkById:", error);
        return null;
    }
}

/**
 * Actualiza una obra en Directus.
 */
export async function updateArtwork(id: string, artworkData: any, token?: string) {
    try {
        const headers: Record<string, string> = { 
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${DIRECTUS_URL}/items/artworks/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(artworkData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.errors?.[0]?.message || "Error al actualizar obra");
        return { success: true, data: data.data };
    } catch (error: any) {
        console.error("Error en updateArtwork:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Sube un archivo a Directus (Imagen o Video).
 */
export async function uploadFile(file: File, token?: string) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${DIRECTUS_URL}/files`, {
            method: 'POST',
            headers,
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.errors?.[0]?.message || "Error al subir archivo");
        return { success: true, id: data.data.id };
    } catch (error: any) {
        console.error("Error en uploadFile:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Obtiene todos los artículos de la revista (colección 'magazine').
 * Incluye cabeceras de autorización si se provee un token para ver borradores.
 */
export async function getArticles(token?: string) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const url = `${DIRECTUS_URL}/items/magazine`;
        console.log(`[getArticles] Fetching from ${url} (Token: ${token ? 'YES' : 'NO'})`);
        
        const res = await fetch(url, { headers });
        if (!res.ok) {
            const errText = await res.text();
            console.error(`[getArticles] HTTP Error ${res.status}:`, errText);
            return [];
        }

        const data = await res.json();
        console.log(`[getArticles] Success. Found ${data.data?.length || 0} items.`);
        return data.data || [];
    } catch (error) {
        console.error("Error en getArticles:", error);
        return [];
    }
}

/**
 * Crea un nuevo artículo en la revista (colección 'magazine').
 */
export async function createArticle(articleData: any, token?: string) {
    try {
        const headers: Record<string, string> = { 
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${DIRECTUS_URL}/items/magazine`, {
            method: 'POST',
            headers,
            body: JSON.stringify(articleData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.errors?.[0]?.message || "Error al crear artículo");
        return { success: true, data: data.data };
    } catch (error: any) {
        console.error("Error en createArticle:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Obtiene los detalles de un artículo por ID (incluyendo metadatos).
 */
export async function getArticleDetails(id: string, token?: string) {
    try {
        const headers: Record<string, string> = { };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const url = `${DIRECTUS_URL}/items/magazine/${id}`;
        console.log(`[getArticleDetails] Fetching item ${id} from ${url}`);
        
        const res = await fetch(url, { headers });
        const data = await res.json();
        
        if (!res.ok) {
            console.error(`[getArticleDetails] Error ${res.status}:`, data.errors?.[0]?.message);
            throw new Error(data.errors?.[0]?.message || "Error al obtener artículo");
        }
        
        console.log(`[getArticleDetails] Success for ID: ${id}`);
        return data.data || null;
    } catch (error) {
        console.error("Error en getArticleDetails:", error);
        return null;
    }
}

/**
 * Actualiza un artículo existente.
 */
export async function updateArticle(id: string, articleData: any, token?: string) {
    try {
        const headers: Record<string, string> = { 
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${DIRECTUS_URL}/items/magazine/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(articleData)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.errors?.[0]?.message || "Error al actualizar artículo");
        return { success: true, data: data.data };
    } catch (error: any) {
        console.error("Error en updateArticle:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Obtiene todos los certificados con sus relaciones (obras y coleccionistas).
 */
export async function getCertificates(token?: string) {
    try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Usamos fields=*.* para traer datos de las relaciones artwork_id y collector_id
        const res = await fetch(`${DIRECTUS_URL}/items/certificates?fields=*,artwork_id.*,collector_id.*&sort=-sale_date`, { headers });
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error("Error en getCertificates:", error);
        return [];
    }
}

/**
 * Obtiene un certificado específico por su UUID.
 */
export async function getCertificateByUuid(uuid: string, token?: string) {
    try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${DIRECTUS_URL}/items/certificates?filter[uuid][_eq]=${uuid}&fields=*,artwork_id.*,collector_id.*&limit=1`, { headers });
        const data = await res.json();
        return data.data?.[0] || null;
    } catch (error) {
        console.error("Error en getCertificateByUuid:", error);
        return null;
    }
}

/**
 * Crea un nuevo coleccionista.
 */
export async function createCollector(collectorData: any, token?: string) {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${DIRECTUS_URL}/items/collectors`, {
            method: 'POST',
            headers,
            body: JSON.stringify(collectorData)
        });
        const data = await res.json();
        return data.data || null;
    } catch (error) {
        console.error("Error en createCollector:", error);
        return null;
    }
}

/**
 * Crea un nuevo certificado.
 */
export async function createCertificate(certData: any, token?: string) {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${DIRECTUS_URL}/items/certificates`, {
            method: 'POST',
            headers,
            body: JSON.stringify(certData)
        });
        const data = await res.json();
        return data.data || null;
    } catch (error) {
        console.error("Error en createCertificate:", error);
        return null;
    }
}
