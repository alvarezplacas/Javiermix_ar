import { db } from '../../../db/client';
import { magazine } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// GET: Obtener un artículo por ID (para editar) o todos si se requiere
export async function GET({ request }: { request: Request }) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
        const results = await db.select().from(magazine).where(eq(magazine.id, Number(id))).limit(1);
        return new Response(JSON.stringify(results[0] || null), { status: 200 });
    }

    const all = await db.select().from(magazine);
    return new Response(JSON.stringify(all), { status: 200 });
}

// POST: Crear nuevo artículo
export async function POST({ request }: { request: Request }) {
    try {
        const body = await request.json();
        
        // Validación básica
        if (!body.title || !body.slug || !body.content_html) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: 'Faltan campos obligatorios (Título, Slug o Contenido)' 
            }), { status: 400 });
        }

        // Insertar en base de datos usando Drizzle
        await db.insert(magazine).values({
            title: body.title as string,
            slug: body.slug as string,
            content_html: body.content_html as string,
            featured_image: (body.featured_image as string) || null,
            video_url: (body.video_url as string) || null,
            tags: (body.tags as string) || null,
            status: (body.status as string) || 'draft',
            seo_title: (body.seo_title as string) || null,
            seo_description: (body.seo_description as string) || null,
            created_at: new Date()
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        console.error('Error saving article:', error);
        
        // Manejar error de slug duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return new Response(JSON.stringify({ 
                success: false, 
                message: 'Ya existe un artículo con ese SLUG (URL). Por favor elige uno diferente.' 
            }), { status: 400 });
        }

        return new Response(JSON.stringify({ 
            success: false, 
            message: error.message || 'Error interno del servidor' 
        }), { status: 500 });
    }
}

// PUT: Actualizar artículo existente
export async function PUT({ request }: { request: Request }) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return new Response(JSON.stringify({ success: false, message: 'ID no proporcionado' }), { status: 400 });
        }

        await db.update(magazine)
            .set({
                title: data.title as string,
                slug: data.slug as string,
                content_html: data.content_html as string,
                featured_image: (data.featured_image as string) || null,
                video_url: (data.video_url as string) || null,
                tags: (data.tags as string) || null,
                status: (data.status as string) || 'draft',
                seo_title: (data.seo_title as string) || null,
                seo_description: (data.seo_description as string) || null,
            })
            .where(eq(magazine.id, Number(id)));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        console.error('Error updating article:', error);
        return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
}

// DELETE: Eliminar un artículo
export async function DELETE({ request }: { request: Request }) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ success: false, message: 'ID no proporcionado' }), { status: 400 });
        }

        await db.delete(magazine).where(eq(magazine.id, Number(id)));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
}
