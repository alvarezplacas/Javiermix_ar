// POST /api/admin/save-article
// Guarda un artículo (nuevo o existente) en la tabla magazine
export const prerender = false;

import { db } from '../../../db/client';
import { magazine } from '../../../db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function POST({ request }: { request: Request }) {
    try {
        const body = await request.json() as {
            id?: number | null;
            title: string;
            slug: string;
            content_html: string;
            featured_image?: string | null;
            video_url?: string | null;
            media_json?: string | null;
            tags?: string | null;
        };

        const { id, title, slug, content_html, featured_image, video_url, media_json, tags } = body;

        const isContentEmpty = !content_html || content_html.trim() === '' || content_html.trim() === '<p><br></p>';

        if (!title?.trim() || !slug?.trim() || isContentEmpty) {
            return new Response(JSON.stringify({ ok: false, error: 'Título, slug y contenido real son obligatorios.' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verificar que el slug no existe (excluyendo el artículo actual si estamos editando)
        const slugQuery = id
            ? and(eq(magazine.slug, slug.trim()), ne(magazine.id, id))
            : eq(magazine.slug, slug.trim());

        const existing = await db.select({ id: magazine.id })
            .from(magazine)
            .where(slugQuery);

        if (existing.length > 0) {
            return new Response(JSON.stringify({ ok: false, error: `El slug "${slug}" ya está en uso. Elegí uno diferente.` }), {
                status: 409, headers: { 'Content-Type': 'application/json' }
            });
        }

        if (id) {
            // ACTUALIZAR
            await db.update(magazine).set({
                title: title.trim(),
                slug: slug.trim(),
                content_html: content_html.trim(),
                featured_image: featured_image || null,
                video_url: video_url || null,
                media_json: media_json || null,
                tags: tags || null,
            }).where(eq(magazine.id, id));
        } else {
            // INSERTAR NUEVO
            await db.insert(magazine).values({
                title: title.trim(),
                slug: slug.trim(),
                content_html: content_html.trim(),
                featured_image: featured_image || null,
                video_url: video_url || null,
                media_json: media_json || null,
                tags: tags || null,
            });
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: unknown) {
        console.error('Save article error:', err);
        return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}
