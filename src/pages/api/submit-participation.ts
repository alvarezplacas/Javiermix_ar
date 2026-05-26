import type { APIRoute } from 'astro';
import { submitPublicSubmission } from '@conexion/directus';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const socialLink = formData.get('social_link') as string;
        const folderId = formData.get('folder_id') as string;
        const file = formData.get('file') as File;

        if (!name || !email || !folderId || !file) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: "Campos requeridos faltantes (Nombre, Email, Serie o Imagen)" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validaciones básicas de tamaño y tipo de archivo
        if (!file.type.startsWith('image/')) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: "El archivo enviado debe ser una imagen válida" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Limitar a 10MB
        if (file.size > 10 * 1024 * 1024) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: "La imagen es demasiado pesada (máximo 10MB)" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await submitPublicSubmission({
            name,
            email,
            socialLink,
            folderId,
            file
        });

        return new Response(JSON.stringify(result), { 
            status: result.success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        console.error('[API submit-participation] Error:', e);
        return new Response(JSON.stringify({ 
            success: false, 
            message: e.message || "Error interno del servidor" 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
