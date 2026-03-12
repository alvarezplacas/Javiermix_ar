import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { certificates } from '../../../db/schema';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json() as {
            artwork_id: string;
            collector_id: string;
            sale_price: string;
            dimensions: string;
            edition_number?: string;
            sale_date?: string;
        };

        const { artwork_id, collector_id, sale_price, dimensions, edition_number, sale_date } = body;

        if (!artwork_id || !collector_id || !sale_price || !dimensions) {
            return new Response(JSON.stringify({ ok: false, error: 'Faltan campos obligatorios.' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        const uuid = crypto.randomUUID();

        // Insert certificate
        await db.insert(certificates).values({
            uuid: uuid,
            artwork_id: Number(artwork_id),
            collector_id: Number(collector_id),
            sale_price: sale_price,
            dimensions: dimensions,
            edition_number: edition_number || null,
            sale_date: sale_date ? new Date(sale_date) : new Date(),
            is_verified: 1
        });

        return new Response(JSON.stringify({ ok: true, uuid }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error issuing certificate:', error);
        return new Response(JSON.stringify({ ok: false, error: 'Error al procesar el certificado.' }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
};
