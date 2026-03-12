import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { artworks, artworkLikesTracking } from '../../../db/schema';
import { eq, sql, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        const { filename, serie_id, title } = await request.json();

        // Robust IP detection for local and production
        const forwarded = request.headers.get('x-forwarded-for');
        const userIp = forwarded ? forwarded.split(',')[0] : (clientAddress || '127.0.0.1');

        if (!filename) {
            return new Response(JSON.stringify({ error: 'Filename is required' }), { status: 400 });
        }

        // Check if user already liked this
        const existingLike = await db.select()
            .from(artworkLikesTracking)
            .where(and(
                eq(artworkLikesTracking.artwork_filename, filename),
                eq(artworkLikesTracking.user_ip, userIp)
            ))
            .limit(1);

        const hasLiked = existingLike.length > 0;

        if (hasLiked) {
            // UNLIKE: Remove tracking and decrement
            await db.delete(artworkLikesTracking)
                .where(and(
                    eq(artworkLikesTracking.artwork_filename, filename),
                    eq(artworkLikesTracking.user_ip, userIp)
                ));

            await db.update(artworks)
                .set({ likes: sql`GREATEST(0, ${artworks.likes} - 1)` })
                .where(eq(artworks.filename, filename));

            const updated = await db.select({ likes: artworks.likes }).from(artworks).where(eq(artworks.filename, filename)).limit(1);
            return new Response(JSON.stringify({ success: true, likes: updated[0]?.likes || 0, hasLiked: false }), { status: 200 });
        } else {
            // LIKE: Add tracking and increment
            await db.insert(artworkLikesTracking).values({
                artwork_filename: filename,
                user_ip: userIp
            });

            const artworkExists = await db.select().from(artworks).where(eq(artworks.filename, filename)).limit(1);

            if (artworkExists.length === 0) {
                await db.insert(artworks).values({
                    filename,
                    serie_id: serie_id || 'unknown',
                    title: title || filename,
                    likes: 1
                });
                return new Response(JSON.stringify({ success: true, likes: 1, hasLiked: true }), { status: 200 });
            } else {
                await db.update(artworks)
                    .set({ likes: sql`${artworks.likes} + 1` })
                    .where(eq(artworks.filename, filename));

                const updated = await db.select({ likes: artworks.likes }).from(artworks).where(eq(artworks.filename, filename)).limit(1);
                return new Response(JSON.stringify({ success: true, likes: updated[0]?.likes || 1, hasLiked: true }), { status: 200 });
            }
        }

    } catch (error) {
        console.error('Error liking artwork:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
};

// GET to fetch current likes AND check if this user liked it
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
    const filename = url.searchParams.get('filename');

    // Robust IP detection
    const forwarded = request.headers.get('x-forwarded-for');
    const userIp = forwarded ? forwarded.split(',')[0] : (clientAddress || '127.0.0.1');

    if (!filename) return new Response('Filename required', { status: 400 });

    try {
        const artworksResult = await db.select({ likes: artworks.likes })
            .from(artworks)
            .where(eq(artworks.filename, filename))
            .limit(1);

        const trackingResult = await db.select()
            .from(artworkLikesTracking)
            .where(and(
                eq(artworkLikesTracking.artwork_filename, filename),
                eq(artworkLikesTracking.user_ip, userIp)
            ))
            .limit(1);

        const count = artworksResult.length > 0 ? artworksResult[0].likes : 0;
        const hasLiked = trackingResult.length > 0;

        return new Response(JSON.stringify({ likes: count, hasLiked }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ likes: 0, hasLiked: false }), { status: 500 });
    }
};
