import { REDIS } from './redis';
import { DirectusManager } from './directus';
import { readFiles } from '@directus/sdk';
import { db, artworks } from './db';
import { eq, sql } from 'drizzle-orm';

export async function addLike(artworkId: string, ip: string) {
    try {
        const client = await DirectusManager.getClient();
        const files = await client.request(readFiles({ filter: { id: { _eq: artworkId } }, limit: 1 }));
        const file = files[0];
        if (!file) return { success: false };
        
        const filename = file.filename_download;
        const redisKey = `likes:${filename}`;
        
        // 1. Update Redis (Speed)
        const currentLikes = await REDIS.get(redisKey);
        const newLikes = (currentLikes ? parseInt(currentLikes) : 0) + 1;
        await REDIS.set(redisKey, newLikes.toString());

        // 2. Update PostgreSQL (Persistence)
        // Buscamos por filename o título para sincronizar con la DB local
        await db.update(artworks)
            .set({ likes: sql`${artworks.likes} + 1` })
            .where(eq(artworks.filename, filename));
            
        return { success: true, likes: newLikes };
    } catch (e) {
        console.error('[addLike] Error:', e);
        return { success: false };
    }
}

export async function getArtworkLikes(fileId: string) {
    try {
        const client = await DirectusManager.getClient();
        const files = await client.request(readFiles({ filter: { id: { _eq: fileId } }, limit: 1 }));
        const file = files[0];
        if (!file) return 0;

        // Intentar primero desde Redis
        const likes = await REDIS.get(`likes:${file.filename_download}`);
        if (likes) return parseInt(likes);

        // Fallback a Postgres
        const dbRes = await db.select({ likes: artworks.likes })
            .from(artworks)
            .where(eq(artworks.filename, file.filename_download))
            .limit(1);
            
        return dbRes[0]?.likes || 0;
    } catch (e) {
        return 0;
    }
}
