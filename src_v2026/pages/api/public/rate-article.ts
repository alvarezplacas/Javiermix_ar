import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { magazine, magazineRatingsTracking } from '../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const prerender = false;

// Helper to get Client IP
function getClientIP(request: Request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           '127.0.0.1';
}

/**
 * GET: Fetch current rating and user's previous vote
 */
export const GET: APIRoute = async ({ request, url }) => {
    try {
        const slug = url.searchParams.get('slug');
        if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });

        const ip = getClientIP(request);

        const articleResult = await db.select({
            total: magazine.rating_total,
            count: magazine.rating_count
        })
        .from(magazine)
        .where(eq(magazine.slug, slug))
        .limit(1);

        if (articleResult.length === 0) {
            return new Response(JSON.stringify({ error: 'Article not found' }), { status: 404 });
        }

        const { total, count } = articleResult[0];
        const ratingAvg = count > 0 ? (total / count).toFixed(1) : "0.0";

        // Check if this IP already rated
        const tracking = await db.select({ score: magazineRatingsTracking.score })
            .from(magazineRatingsTracking)
            .where(and(
                eq(magazineRatingsTracking.article_slug, slug),
                eq(magazineRatingsTracking.user_ip, ip)
            ))
            .limit(1);

        return new Response(JSON.stringify({ 
            average: ratingAvg, 
            count, 
            userScore: tracking.length > 0 ? tracking[0].score : 0 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        console.error('Error fetching rating:', e);
        return new Response(JSON.stringify({ average: "0.0", count: 0, userScore: 0 }), { status: 500 });
    }
};

/**
 * POST: Create or update a rating
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { slug, score } = body;

        if (!slug || typeof score !== 'number' || score < 1 || score > 5) {
            return new Response(JSON.stringify({ error: 'Invalid rating data' }), { status: 400 });
        }

        const ip = getClientIP(request);

        // check previous rating
        const existing = await db.select()
            .from(magazineRatingsTracking)
            .where(and(
                eq(magazineRatingsTracking.article_slug, slug),
                eq(magazineRatingsTracking.user_ip, ip)
            ))
            .limit(1);

        if (existing.length > 0) {
            // Update existing
            const oldScore = existing[0].score;
            
            await db.update(magazineRatingsTracking)
                .set({ score, created_at: new Date() })
                .where(and(
                    eq(magazineRatingsTracking.article_slug, slug),
                    eq(magazineRatingsTracking.user_ip, ip)
                ));

            await db.update(magazine)
                .set({ 
                    rating_total: sql`rating_total - ${oldScore} + ${score}`
                })
                .where(eq(magazine.slug, slug));
        } else {
            // New rating
            await db.insert(magazineRatingsTracking).values({
                article_slug: slug,
                user_ip: ip,
                score: score
            });

            await db.update(magazine)
                .set({ 
                    rating_total: sql`rating_total + ${score}`,
                    rating_count: sql`rating_count + 1`
                })
                .where(eq(magazine.slug, slug));
        }

        // Return new calculated values
        const updatedArticle = await db.select({
            total: magazine.rating_total,
            count: magazine.rating_count
        })
        .from(magazine)
        .where(eq(magazine.slug, slug))
        .limit(1);

        const { total, count } = updatedArticle[0];
        const newAvg = count > 0 ? (total / count).toFixed(1) : "0.0";

        return new Response(JSON.stringify({ 
            success: true, 
            average: newAvg, 
            count: count 
        }), { status: 200 });

    } catch (e: any) {
        console.error('Error submitting rating:', e);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
};
