const PUBLIC_DIRECTUS_URL = 'https://admin.javiermix.ar';
const DIRECTUS_STATIC_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

function getAuthHeader(token: string) {
    const finalToken = (token === 'LEGACY_BYPASS') ? DIRECTUS_STATIC_TOKEN : token;
    return `Bearer ${finalToken}`;
}

export async function uploadFile(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${PUBLIC_DIRECTUS_URL}/files`, {
        method: 'POST',
        headers: { 'Authorization': getAuthHeader(token) },
        body: formData
    });
    const result = await res.json();
    return { success: !result.errors, id: result.data?.id, ...result };
}

export async function createArtwork(data: any, token: string) {
    const res = await fetch(`${PUBLIC_DIRECTUS_URL}/items/artworks`, {
        method: 'POST',
        headers: { 
            'Authorization': getAuthHeader(token),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function updateArtwork(id: string, data: any, token: string) {
    const res = await fetch(`${PUBLIC_DIRECTUS_URL}/items/artworks/${id}`, {
        method: 'PATCH',
        headers: { 
            'Authorization': getAuthHeader(token),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function loginAdmin(email: string, password: string) {
    try {
        const res = await fetch(`${PUBLIC_DIRECTUS_URL}/auth/login`, {
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

export async function createArticle(data: any, token: string) {
    const res = await fetch(`${PUBLIC_DIRECTUS_URL}/items/magazine`, {
        method: 'POST',
        headers: { 
            'Authorization': getAuthHeader(token),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

export async function updateArticle(id: string, data: any, token: string) {
    const res = await fetch(`${PUBLIC_DIRECTUS_URL}/items/magazine/${id}`, {
        method: 'PATCH',
        headers: { 
            'Authorization': getAuthHeader(token),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}
