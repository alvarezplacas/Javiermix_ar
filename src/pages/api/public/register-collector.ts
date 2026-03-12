import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { collectors } from '../../../db/schema';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json() as {
            name: string;
            email: string;
            phone?: string;
            country?: string;
        };

        const { name, email, phone, country, instagram } = body as any;

        if (!name?.trim() || !email?.trim()) {
            return new Response(JSON.stringify({ ok: false, error: 'Nombre y Email son obligatorios.' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        // Insert collector
        await db.insert(collectors).values({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
            country: country?.trim() || null,
            instagram: instagram?.trim() || null,
            notes: "Registro autónomo desde el sitio web.",
            status: 'lead'
        });

        return new Response(JSON.stringify({ ok: true }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error registering collector:', error);

        // Handle duplicate email (ER_DUP_ENTRY is 1062)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062 || error.message?.includes('Duplicate entry')) {
            return new Response(JSON.stringify({ ok: false, error: 'Este correo ya está registrado en nuestra base de coleccionistas.' }), {
                status: 409, headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ ok: false, error: 'Lo sentimos, hubo un error al procesar su solicitud. Intente nuevamente.' }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
};
