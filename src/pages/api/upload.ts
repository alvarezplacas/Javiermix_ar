import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { DirectusManager } from '../../conexion/directus';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return new Response(JSON.stringify({ error: 'No se recibió ningún archivo' }), { status: 400 });
        }

        console.log(`[Upload API] Recibiendo archivo: ${file.name}, tamaño: ${file.size} bytes`);

        // Convertir el archivo a un buffer para procesarlo con Sharp
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Procesar con Sharp (Convertir a AVIF de alta calidad pero bajo peso)
        console.log('[Upload API] Iniciando conversión a AVIF...');
        const optimizedBuffer = await sharp(buffer)
            .avif({ 
                quality: 85, // Alta calidad de museo
                effort: 4, // Esfuerzo de compresión medio-alto
                chromaSubsampling: '4:4:4' // Preservar color original
            })
            .toBuffer();

        console.log(`[Upload API] Conversión completada. Nuevo tamaño: ${optimizedBuffer.byteLength} bytes`);

        // Preparar para enviar a Directus
        const baseUrl = DirectusManager.getBaseUrl();
        const staticToken = import.meta.env.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';
        
        // Crear un nuevo nombre con extensión .avif
        const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFileName = `${originalName}.avif`;

        // Construir un nuevo FormData para Directus
        const directusFormData = new FormData();
        // Usar Blob para adjuntar el buffer en Node/Astro
        const optimizedBlob = new Blob([optimizedBuffer], { type: 'image/avif' });
        directusFormData.append('file', optimizedBlob, newFileName);
        
        // Opcional: Meterlo en una carpeta específica si la pasamos por el form
        const folderId = formData.get('folder');
        if (folderId) {
            directusFormData.append('folder', folderId.toString());
        }

        console.log('[Upload API] Subiendo a Directus...');
        const directusRes = await fetch(`${baseUrl}/files`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${staticToken}`
            },
            body: directusFormData
        });

        const directusJson = await directusRes.json();

        if (directusJson.errors) {
            console.error('[Upload API] Error de Directus:', directusJson.errors);
            return new Response(JSON.stringify({ error: 'Error al guardar en la base de datos' }), { status: 500 });
        }

        console.log('[Upload API] ¡Subida exitosa!', directusJson.data.id);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Archivo optimizado y subido correctamente',
            file: directusJson.data 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('[Upload API] Error crítico:', error);
        return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), { status: 500 });
    }
};
