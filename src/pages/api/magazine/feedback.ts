import type { APIRoute } from 'astro';
import { getArticleFeedback, submitFeedback } from '@conexion/magazine_feedback';

export const GET: APIRoute = async ({ request, clientAddress }) => {
    try {
        const url = new URL(request.url);
        const articleIdStr = url.searchParams.get('articleId');
        
        if (!articleIdStr) {
            return new Response(JSON.stringify({ message: "ID de artículo requerido" }), { status: 400 });
        }

        const articleId = parseInt(articleIdStr);
        if (isNaN(articleId)) {
            return new Response(JSON.stringify({ message: "ID de artículo inválido" }), { status: 400 });
        }

        const ip = clientAddress || "unknown";
        const result = await getArticleFeedback(articleId, ip);

        return new Response(JSON.stringify(result), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        console.error('[API-Feedback-GET] Error:', e);
        return new Response(JSON.stringify({ message: "Error interno en el servidor", error: e.message }), { status: 500 });
    }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        const body = await request.json();
        const { articleId, name, email, instagram, comment, rating } = body;
        const ip = clientAddress || "unknown";

        // Validaciones básicas
        if (!articleId) {
            return new Response(JSON.stringify({ message: "ID de artículo requerido" }), { status: 400 });
        }
        if (!name || name.trim().length === 0) {
            return new Response(JSON.stringify({ message: "El nombre es requerido" }), { status: 400 });
        }
        if (!email || email.trim().length === 0 || !email.includes('@')) {
            return new Response(JSON.stringify({ message: "Un correo electrónico válido es requerido" }), { status: 400 });
        }
        if (!comment || comment.trim().length === 0) {
            return new Response(JSON.stringify({ message: "El comentario no puede estar vacío" }), { status: 400 });
        }

        const parsedArticleId = parseInt(articleId);
        const parsedRating = rating !== null && rating !== undefined ? parseInt(rating) : null;

        const result = await submitFeedback({
            articleId: parsedArticleId,
            name: name.trim(),
            email: email.trim(),
            instagram: instagram ? instagram.trim() : null,
            comment: comment.trim(),
            rating: parsedRating,
            ip
        });

        return new Response(JSON.stringify(result), { 
            status: result.success ? 200 : (result.alreadyRated ? 403 : 500),
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        console.error('[API-Feedback-POST] Error:', e);
        return new Response(JSON.stringify({ message: "Error al registrar la opinión", error: e.message }), { status: 500 });
    }
}
