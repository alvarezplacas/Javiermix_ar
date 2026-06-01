import { db, magazineComments, magazineRatingsTracking } from './db';
import { eq, and, avg, count, desc, sql } from 'drizzle-orm';
import { DirectusManager } from './directus';
import { createItem } from '@directus/sdk';

/**
 * Obtiene el feedback (promedio de estrellas, conteo y comentarios aprobados) de un artículo.
 */
export async function getArticleFeedback(articleId: number, ip: string) {
    try {
        // 1. Obtener lista de comentarios aprobados para este artículo
        const commentsList = await db.select()
            .from(magazineComments)
            .where(
                and(
                    eq(magazineComments.article_id, articleId),
                    eq(magazineComments.status, 'approved')
                )
            )
            .orderBy(desc(magazineComments.created_at));

        // 2. Calcular agregados de calificaciones (solo comentarios con rating no nulo y aprobados)
        const ratingsRes = await db.select({
            avgRating: avg(magazineComments.rating),
            countRating: count(magazineComments.rating)
        })
        .from(magazineComments)
        .where(
            and(
                eq(magazineComments.article_id, articleId),
                eq(magazineComments.status, 'approved'),
                sql`${magazineComments.rating} IS NOT NULL`
            )
        );

        // 3. Verificar si esta IP ya ha calificado el artículo en el tracking de IPs
        const hasRatedRes = await db.select()
            .from(magazineRatingsTracking)
            .where(
                and(
                    eq(magazineRatingsTracking.article_id, articleId),
                    eq(magazineRatingsTracking.user_ip, ip)
                )
            )
            .limit(1);

        const hasRated = hasRatedRes.length > 0;
        const rawAvg = ratingsRes[0]?.avgRating;
        const averageRating = rawAvg ? parseFloat(parseFloat(rawAvg).toFixed(1)) : 0;
        const ratingsCount = ratingsRes[0]?.countRating || 0;

        return {
            success: true,
            comments: commentsList.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                instagram: c.instagram,
                comment: c.comment,
                rating: c.rating,
                created_at: c.created_at
            })),
            averageRating,
            ratingsCount,
            hasRated
        };
    } catch (e) {
        console.error('[getArticleFeedback] Error:', e);
        return {
            success: false,
            comments: [],
            averageRating: 0,
            ratingsCount: 0,
            hasRated: false,
            message: 'Error al recuperar comentarios'
        };
    }
}

/**
 * Registra una calificación y un comentario para un artículo en Directus CMS y PostgreSQL.
 */
export async function submitFeedback(data: {
    articleId: number;
    name: string;
    email: string;
    instagram: string | null;
    comment: string;
    rating: number | null;
    ip: string;
}) {
    try {
        // 1. Si califica con estrellas, validar que su IP no haya valorado este artículo antes
        if (data.rating !== null && data.rating !== undefined && data.rating >= 1 && data.rating <= 5) {
            const hasRatedRes = await db.select()
                .from(magazineRatingsTracking)
                .where(
                    and(
                        eq(magazineRatingsTracking.article_id, data.articleId),
                        eq(magazineRatingsTracking.user_ip, data.ip)
                    )
                )
                .limit(1);

            if (hasRatedRes.length > 0) {
                return {
                    success: false,
                    alreadyRated: true,
                    message: 'Ya has calificado esta crónica desde esta dirección IP'
                };
            }

            // Registrar la IP y calificación en la tabla de tracking
            await db.insert(magazineRatingsTracking).values({
                article_id: data.articleId,
                user_ip: data.ip,
                rating: data.rating
            });
        }

        // 2. Registrar el comentario en Directus CMS mediante el SDK
        // Esto creará automáticamente la fila en PostgreSQL y sincronizará con la admin UI de Directus
        const client = await DirectusManager.getClient();
        await client.request(createItem('magazine_comments', {
            article_id: data.articleId,
            name: data.name,
            email: data.email,
            instagram: data.instagram ? data.instagram.trim() : '',
            comment: data.comment.trim(),
            rating: data.rating,
            status: 'approved' // Por defecto aprobado para reflejo inmediato, moderable desde Directus
        }));

        // 3. Obtener el feedback actualizado para devolverlo al cliente en la misma petición
        const updatedFeedback = await getArticleFeedback(data.articleId, data.ip);

        return {
            success: true,
            message: 'Comentario y valoración registrados correctamente',
            ...updatedFeedback
        };
    } catch (e) {
        console.error('[submitFeedback] Error:', e);
        return {
            success: false,
            message: 'Error interno al registrar tu comentario'
        };
    }
}
