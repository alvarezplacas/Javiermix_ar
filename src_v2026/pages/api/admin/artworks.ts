import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { artworks } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { filename, serie_id, title, description, camera, lens, date, precio_small, precio_medium, precio_large, stock, status } = data;

        if (!filename) {
            return new Response(JSON.stringify({ error: 'Filename missing' }), { status: 400 });
        }

        // Buscamos si ya existe
        const existing = await db.select().from(artworks).where(eq(artworks.filename, filename)).then((res: any[]) => res[0]);

        if (existing) {
            // Update
            await db.update(artworks)
                .set({
                    title,
                    description,
                    camera,
                    lens,
                    date,
                    precio_small: precio_small?.toString(),
                    precio_medium: precio_medium?.toString(),
                    precio_large: precio_large?.toString(),
                    stock: parseInt(stock) || 1,
                    status: status || 'published'
                })
                .where(eq(artworks.filename, filename));
        } else {
            // Insert
            await db.insert(artworks).values({
                filename,
                serie_id,
                title,
                description,
                camera,
                lens,
                date,
                precio_small: precio_small?.toString(),
                precio_medium: precio_medium?.toString(),
                precio_large: precio_large?.toString(),
                stock: parseInt(stock) || 1,
                status: status || 'published'
            });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error saving artwork metadata:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
};
