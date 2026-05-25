import { REDIS } from './redis';
import { DirectusManager } from './directus';
import { readFiles } from '@directus/sdk';
import { db, artworks, artworkLikesTracking } from './db';
import { eq, and, sql } from 'drizzle-orm';

export async function hasLiked(artworkId: string, ip: string): Promise<boolean> {
    try {
        const client = await DirectusManager.getClient();
        const files = await client.request(readFiles({ filter: { id: { _eq: artworkId } }, limit: 1 }));
        const file = files[0];
        if (!file) return false;

        const dbRes = await db.select()
            .from(artworkLikesTracking)
            .where(
                and(
                    eq(artworkLikesTracking.artwork_filename, file.filename_download),
                    eq(artworkLikesTracking.user_ip, ip)
                )
            )
            .limit(1);

        return dbRes.length > 0;
    } catch (e) {
        console.error('[hasLiked] Error:', e);
        return false;
    }
}

export async function addLike(artworkId: string, ip: string) {
    try {
        const client = await DirectusManager.getClient();
        const files = await client.request(readFiles({ filter: { id: { _eq: artworkId } }, limit: 1 }));
        const file = files[0];
        if (!file) return { success: false, message: 'Obra no encontrada' };
        
        const filename = file.filename_download;
        const redisKey = `likes:${filename}`;
        
        // 1. Validar duplicado por IP
        const alreadyLiked = await hasLiked(artworkId, ip);
        if (alreadyLiked) {
            // Obtener el conteo actual para retornarlo de todos modos
            const currentLikes = await REDIS.get(redisKey);
            return { 
                success: false, 
                alreadyLiked: true, 
                message: 'Ya has valorado esta obra', 
                likes: currentLikes ? parseInt(currentLikes) : 0 
            };
        }

        // 2. Registrar el voto en el tracking de PostgreSQL (Persistencia de IP)
        await db.insert(artworkLikesTracking).values({
            artwork_filename: filename,
            user_ip: ip
        });

        // 3. Incrementar en Redis (Velocidad)
        const currentLikes = await REDIS.get(redisKey);
        const newLikes = (currentLikes ? parseInt(currentLikes) : 0) + 1;
        await REDIS.set(redisKey, newLikes.toString());

        // 4. Incrementar en la tabla de Obras
        await db.update(artworks)
            .set({ likes: sql`${artworks.likes} + 1` })
            .where(eq(artworks.filename, filename));
            
        return { success: true, likes: newLikes };
    } catch (e) {
        console.error('[addLike] Error:', e);
        return { success: false, message: 'Error interno en el servidor' };
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
