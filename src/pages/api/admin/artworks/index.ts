import type { APIRoute } from 'astro';
import { db } from '../../../../db/client';
import { artworks } from '../../../../db/schema';
import fs from 'node:fs';
import path from 'node:path';
import { exiftool } from 'exiftool-vendored';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();

        // Extraer Archivo
        const imageFile = formData.get('image') as File | null;
        const filename = formData.get('filename') as string | null;
        const serie_id = formData.get('serie_id') as string | null;
        const title = formData.get('title') as string | null;

        if (!imageFile || !filename || !serie_id || !title) {
            return new Response(JSON.stringify({ ok: false, error: 'Faltan campos obligatorios (Imagen, Nombre de Archivo, Serie o Título).' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Determinar Serie (Existente o Nueva)
        let finalSerieId = serie_id;
        if (serie_id === 'new_serie') {
            const newSerieName = formData.get('new_serie_name') as string | null;
            if (!newSerieName) {
                return new Response(JSON.stringify({ ok: false, error: 'Nombre de nueva serie no proporcionado.' }), {
                    status: 400, headers: { 'Content-Type': 'application/json' }
                });
            }
            // Formatear: "Nueva Serie 2024" -> "Nueva_Serie_2024" (Primera letra Mayúscula por convención de tus carpetas)
            finalSerieId = newSerieName.trim().replace(/\s+/g, '_');
            finalSerieId = finalSerieId.charAt(0).toUpperCase() + finalSerieId.slice(1);
        }

        // 2. Guardar Imagen en el sistema de archivos
        const seriesPath = path.join(process.cwd(), 'public', 'img', 'Series', finalSerieId);

        // Asegurar que la carpeta existe (aunque el select debería garantizarlo)
        if (!fs.existsSync(seriesPath)) {
            fs.mkdirSync(seriesPath, { recursive: true });
        }

        const filePath = path.join(seriesPath, filename);
        const arrayBuffer = await imageFile.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

        // 3. Extraer Metadatos EXIF si es necesario
        let exifData: any = {};
        if (!formData.get('camera') || !formData.get('lens') || !formData.get('date')) {
            try {
                exifData = await exiftool.read(filePath);
            } catch (e) {
                console.error("Error leyendo EXIF:", e);
            }
        }

        // 4. Guardar Metadatos en MariaDB
        const artworkData = {
            filename: filename,
            serie_id: finalSerieId,
            title: title,
            camera: (formData.get('camera') as string) || exifData.Model || null,
            lens: (formData.get('lens') as string) || exifData.LensModel || exifData.LensID || null,
            paper: (formData.get('paper') as string) || null,
            dimensions: (formData.get('dimensions') as string) || null,
            date: (formData.get('date') as string) || (exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal.toString()).toLocaleDateString('es-CL') : null),
            description: (formData.get('description') as string) || null,
            size_small: (formData.get('size_small') as string) || null,
            precio_small: formData.get('precio_small') ? String(formData.get('precio_small')) : null,
            size_medium: (formData.get('size_medium') as string) || null,
            precio_medium: formData.get('precio_medium') ? String(formData.get('precio_medium')) : null,
            size_large: (formData.get('size_large') as string) || null,
            precio_large: formData.get('precio_large') ? String(formData.get('precio_large')) : null,
        };

        await db.insert(artworks).values(artworkData);

        return new Response(JSON.stringify({ ok: true, message: 'Obra creada y archivo guardado correctamente.' }), {
            status: 201, headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('Error en creación de obra:', err);
        return new Response(JSON.stringify({ ok: false, error: err.message || 'Error interno del servidor.' }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
};
