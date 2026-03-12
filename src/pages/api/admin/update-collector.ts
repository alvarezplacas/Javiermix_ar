import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { collectors } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        if (!data.id) {
            return new Response(JSON.stringify({ ok: false, error: 'ID de coleccionista requerido.' }), { status: 400 });
        }

        const collectorId = parseInt(data.id);

        await db.update(collectors)
            .set({
                name: data.name,
                instagram: data.instagram || null,
                status: data.status || 'lead',
                notes: data.notes || null,
            })
            .where(eq(collectors.id, collectorId));

        return new Response(JSON.stringify({ ok: true }));
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ ok: false, error: 'Error al actualizar el coleccionista.' }), { status: 500 });
    }
}
