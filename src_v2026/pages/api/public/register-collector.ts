import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { collectors } from '../../../db/schema';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        
        // Basic validation
        if (!body.name || !body.email) {
            return new Response(JSON.stringify({ ok: false, error: 'Faltan campos obligatorios' }), { status: 400 });
        }

        // Insert into database
        await db.insert(collectors).values({
            name: body.name,
            email: body.email,
            instagram: body.instagram || null,
            status: 'lead'
        });

        return new Response(JSON.stringify({ ok: true }), { status: 200 });

    } catch (e: any) {
        console.error("Error registering collector:", e);
        
        if (e.code === 'ER_DUP_ENTRY' || (e.message && e.message.includes('Duplicate'))) {
             return new Response(JSON.stringify({ ok: false, error: 'Este correo ya pertenece a nuestra colección.' }), { status: 400 });
        }
        
        return new Response(JSON.stringify({ ok: false, error: 'Error del servidor. Intente más tarde.' }), { status: 500 });
    }
}
