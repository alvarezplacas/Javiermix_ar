/**
 * 🚀 Motor de Likes (Server-Only)
 * Separado para evitar conflictos de compilación en el cliente.
 */
import { REDIS } from './redis';
import { DirectusManager } from './directus';
import { readFiles } from '@directus/sdk';

export async function addLike(artworkId: string, ip: string) {
    try {
        const client = await DirectusManager.getClient();
        const files = await client.request(readFiles({ filter: { id: { _eq: artworkId } }, limit: 1 }));
        const file = files[0];
        if (!file) return { success: false };
        
        const filename = file.filename_download;
        const redisKey = `likes:${filename}`;
        
        const currentLikes = await REDIS.get(redisKey);
        const newLikes = (currentLikes ? parseInt(currentLikes) : 0) + 1;
        
        await REDIS.set(redisKey, newLikes.toString());
        return { success: true, likes: newLikes };
    } catch (e) {
        return { success: false };
    }
}

export async function getArtworkLikes(fileId: string) {
    try {
        const client = await DirectusManager.getClient();
        const files = await client.request(readFiles({ filter: { id: { _eq: fileId } }, limit: 1 }));
        const file = files[0];
        if (!file) return 0;
        const likes = await REDIS.get(`likes:${file.filename_download}`);
        return likes ? parseInt(likes) : 0;
    } catch (e) {
        return 0;
    }
}
