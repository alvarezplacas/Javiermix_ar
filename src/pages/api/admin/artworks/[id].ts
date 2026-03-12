import type { APIRoute } from 'astro';
import { db } from '../../../../db/client';
import { artworks } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ ok: false, error: 'ID no proporcionado' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        await db.delete(artworks).where(eq(artworks.id, Number(id)));

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('Error al eliminar obra:', e);
        return new Response(JSON.stringify({ ok: false, error: 'Error en el servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
