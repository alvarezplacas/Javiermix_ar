import fs from 'fs';
import path from 'path';

const DIRECTUS_URL = 'https://admin.javiermix.ar';
const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function api(path, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
        },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${DIRECTUS_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        console.error(`❌ Error API [${res.status}]: ${path} ->`, data.errors || data);
        return { error: true, status: res.status, data };
    }
    return { error: false, data: data.data || data };
}

async function updateSchema() {
    console.log('🏗️ Actualizando esquema de Directus...');

    // 1. Agregar campo 'serie' a 'artworks' si no existe
    console.log('  + Verificando campo "serie" en artworks...');
    const fieldsRes = await api('/fields/artworks');
    const fields = fieldsRes.data || [];
    
    if (!fields.find(f => f.field === 'serie')) {
        console.log('  ➕ Creando campo "serie"...');
        await api('/fields/artworks', 'POST', {
            field: 'serie',
            type: 'string',
            meta: {
                interface: 'input',
                width: 'full',
                note: 'ID de la serie (ej: rostros_de_metal)'
            }
        });
    }

    console.log('✅ Esquema actualizado.');
}

async function runSeed() {
    await updateSchema();

    console.log('🌱 Iniciando repoblación de Obras (Artworks) con Series...');

    const csvPath = path.resolve('biblioteca/obras.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ Error: No se encontró biblioteca/obras.csv');
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim()).slice(1);

    for (const line of lines) {
        const parts = line.split(';');
        const filename = parts[0]?.trim();
        const serie_id = parts[1]?.trim();
        const title = parts[2]?.trim();
        const description = parts[8]?.trim();

        if (!filename) continue;

        console.log(`🚀 Procesando: ${filename} (Serie: ${serie_id})`);

        const check = await api(`/items/artworks?filter[filename][_eq]=${filename}`);
        const payload = {
            filename: filename,
            serie: serie_id,
            title: title || filename,
            description: description || "",
            likes: 0
        };

        if (!check.error && check.data.length > 0) {
            await api(`/items/artworks/${check.data[0].id}`, 'PATCH', payload);
        } else {
            await api(`/items/artworks`, 'POST', payload);
        }
    }

    console.log('✅ Repoblación Completa.');
}

runSeed().catch(console.error);
