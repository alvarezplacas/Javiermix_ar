/**
 * 🌐 Client-Side Directus Connector (SDK v11+)
 * Optimized for Browser / Client components
 */

import { 
    createDirectus, 
    rest, 
    staticToken, 
    createItem, 
    updateItem,
    uploadFiles,
    readItem
} from '@directus/sdk';
import type { Schema, Order } from '../types/directus';

const PUBLIC_URL = 'https://admin.javiermix.ar';
const STATIC_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

// Browser-safe client
const client = createDirectus<Schema>(PUBLIC_URL)
    .with(rest())
    .with(staticToken(STATIC_TOKEN));

/**
 * Login function (used in admin widgets)
 */
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

/**
 * Upload file from browser
 */
export async function uploadFile(file: File, token: string) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        // Note: Using raw fetch here because uploadFiles with Blob/File in SDK 
        // can sometimes be tricky with environment-specific FormData.
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

/**
 * Create artwork (Admin only)
 */
export async function createArtwork(data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/artworks`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

/**
 * Update artwork (Admin only)
 */
export async function updateArtwork(id: string, data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/artworks/${id}`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

/**
 * Create article (Magazine)
 */
export async function createArticle(data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/magazine`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}

/**
 * Update article (Magazine)
 */
export async function updateArticle(id: string, data: any, token: string) {
    const res = await fetch(`${PUBLIC_URL}/items/magazine/${id}`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    return { success: !result.errors, ...result };
}
