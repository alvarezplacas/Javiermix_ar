import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { artworks, artworkLikesTracking } from '../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const prerender = false;

// Helpers
function getClientIP(request: Request) {
    return request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           '127.0.0.1';
}

export const GET: APIRoute = async ({ request, url }) => {
    try {
        const filename = url.searchParams.get('filename');
        if (!filename) return new Response(JSON.stringify({ error: 'Missing filename' }), { status: 400 });

        const ip = getClientIP(request);

        // Fetch current likes
        const artworkRecord = await db.select({ likes: artworks.likes })
            .from(artworks)
            .where(eq(artworks.filename, filename))
            .limit(1);

        const currentLikes = artworkRecord.length > 0 ? artworkRecord[0].likes || 0 : 0;

        // Check if user already liked
        const trackingRecord = await db.select()
            .from(artworkLikesTracking)
            .where(and(
                eq(artworkLikesTracking.artwork_filename, filename),
                eq(artworkLikesTracking.user_ip, ip)
            ))
            .limit(1);

        const hasLiked = trackingRecord.length > 0;

        return new Response(JSON.stringify({ likes: currentLikes, hasLiked }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('Like GET Error:', e);
        return new Response(JSON.stringify({ likes: 0, hasLiked: false }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { filename, serie_id, title } = body;

        if (!filename || !serie_id || !title) {
            return new Response(JSON.stringify({ error: 'Missing artwork data' }), { status: 400 });
        }

        const ip = getClientIP(request);

        // Check if artwork exists in DB
        const artworkRecord = await db.select({ id: artworks.id, likes: artworks.likes })
            .from(artworks)
            .where(eq(artworks.filename, filename))
            .limit(1);

        let currentLikes = 0;
        let artworkDbId = null;

        if (artworkRecord.length === 0) {
            // First time this artwork is interacted with
            await db.insert(artworks).values({
                filename,
                title,
                serie_id,
                likes: 0
            });
            currentLikes = 0;
        } else {
            artworkDbId = artworkRecord[0].id;
            currentLikes = artworkRecord[0].likes || 0;
        }

        // Check tracking
        const trackingRecord = await db.select()
            .from(artworkLikesTracking)
            .where(and(
                eq(artworkLikesTracking.artwork_filename, filename),
                eq(artworkLikesTracking.user_ip, ip)
            ))
            .limit(1);

        const hasLiked = trackingRecord.length > 0;

        if (hasLiked) {
            // UNLIKE
            await db.delete(artworkLikesTracking)
                .where(and(
                    eq(artworkLikesTracking.artwork_filename, filename),
                    eq(artworkLikesTracking.user_ip, ip)
                ));

            currentLikes = Math.max(0, currentLikes - 1);
            await db.update(artworks)
                .set({ likes: currentLikes })
                .where(eq(artworks.filename, filename));

            return new Response(JSON.stringify({ likes: currentLikes, hasLiked: false }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // LIKE
            await db.insert(artworkLikesTracking).values({
                artwork_filename: filename,
                user_ip: ip
            });

            currentLikes += 1;
            await db.update(artworks)
                .set({ likes: currentLikes })
                .where(eq(artworks.filename, filename));

            return new Response(JSON.stringify({ likes: currentLikes, hasLiked: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (e) {
        console.error('Like POST Error:', e);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
};
