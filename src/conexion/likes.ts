/**
 * 🚀 Motor de Likes (Server-Only)
 * Separado para evitar conflictos de compilación en el cliente.
 */
import { REDIS } from './redis';
import { DirectusManager } from './directus';
import { readItem } from '@directus/sdk';

export async function addLike(artworkId: string, ip: string) {
    try {
        const client = await DirectusManager.getClient();
        const file: any = await client.request(readItem('directus_files' as any, artworkId));
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
        const file: any = await client.request(readItem('directus_files' as any, fileId));
        const likes = await REDIS.get(`likes:${file.filename_download}`);
        return likes ? parseInt(likes) : 0;
    } catch (e) {
        return 0;
    }
}
