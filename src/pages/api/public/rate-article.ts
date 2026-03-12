import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { magazine, magazineRatingsTracking } from '../../../db/schema';
import { eq, sql, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        const { slug, score } = await request.json();
        const forwarded = request.headers.get('x-forwarded-for');
        const userIp = forwarded ? forwarded.split(',')[0] : (clientAddress || '127.0.0.1');

        if (!slug || !score || score < 1 || score > 5) {
            return new Response(JSON.stringify({ error: 'Valid slug and score (1-5) required' }), { status: 400 });
        }

        // 1. Check if user already rated this article
        const existingRating = await db.select()
            .from(magazineRatingsTracking)
            .where(and(
                eq(magazineRatingsTracking.article_slug, slug),
                eq(magazineRatingsTracking.user_ip, userIp)
            ))
            .limit(1);

        if (existingRating.length > 0) {
            // UPDATE: User is changing their vote
            const oldScore = existingRating[0].score;

            await db.update(magazineRatingsTracking)
                .set({ score: score })
                .where(and(
                    eq(magazineRatingsTracking.article_slug, slug),
                    eq(magazineRatingsTracking.user_ip, userIp)
                ));

            await db.update(magazine)
                .set({
                    rating_total: sql`rating_total - ${oldScore} + ${score}`
                })
                .where(eq(magazine.slug, slug));
        } else {
            // INSERT: New vote
            await db.insert(magazineRatingsTracking).values({
                article_slug: slug,
                user_ip: userIp,
                score: score
            });

            await db.update(magazine)
                .set({
                    rating_total: sql`rating_total + ${score}`,
                    rating_count: sql`rating_count + 1`
                })
                .where(eq(magazine.slug, slug));
        }

        const updated = await db.select({
            total: magazine.rating_total,
            count: magazine.rating_count
        }).from(magazine).where(eq(magazine.slug, slug)).limit(1);

        const safeTotal = updated[0]?.total || 0;
        const safeCount = updated[0]?.count || 0;
        const average = safeCount > 0 ? (safeTotal / safeCount).toFixed(1) : "0.0";

        return new Response(JSON.stringify({
            success: true,
            average,
            count: safeCount,
            userScore: score
        }), { status: 200 });

    } catch (error) {
        console.error('Error rating article:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
};

// GET current rating and user status
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
    const slug = url.searchParams.get('slug');
    const forwarded = request.headers.get('x-forwarded-for');
    const userIp = forwarded ? forwarded.split(',')[0] : (clientAddress || '127.0.0.1');

    if (!slug) return new Response('Slug required', { status: 400 });

    try {
        const stats = await db.select({
            total: magazine.rating_total,
            count: magazine.rating_count
        }).from(magazine).where(eq(magazine.slug, slug)).limit(1);

        const userRating = await db.select({ score: magazineRatingsTracking.score })
            .from(magazineRatingsTracking)
            .where(and(
                eq(magazineRatingsTracking.article_slug, slug),
                eq(magazineRatingsTracking.user_ip, userIp)
            ))
            .limit(1);

        const safeTotal = stats[0]?.total || 0;
        const safeCount = stats[0]?.count || 0;
        const average = safeCount > 0 ? (safeTotal / safeCount).toFixed(1) : "0.0";
        const userScore = userRating.length > 0 ? userRating[0].score : 0;

        return new Response(JSON.stringify({ average, count: safeCount, userScore }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ average: "0.0", count: 0, userScore: 0 }), { status: 500 });
    }
};
