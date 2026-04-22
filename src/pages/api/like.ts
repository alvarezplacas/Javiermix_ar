import type { APIRoute } from 'astro';
import { addLike } from '@conexion/likes';

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        const body = await request.json();
        const { artworkId } = body;
        const ip = clientAddress || "unknown";

        if (!artworkId) {
            return new Response(JSON.stringify({ message: "ID de obra requerido" }), { status: 400 });
        }

        const result = await addLike(artworkId, ip);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 403 });
    } catch (e) {
        return new Response(JSON.stringify({ message: "Error interno" }), { status: 500 });
    }
}
