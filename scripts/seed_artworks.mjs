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

async function runSeed() {
    console.log('🌱 Iniciando repoblación de Obras (Artworks)...');

    const csvPath = path.resolve('biblioteca/obras.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ Error: No se encontró biblioteca/obras.csv');
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').slice(1); // Saltar cabecera

    for (const line of lines) {
        if (!line.trim()) continue;
        
        // El CSV usa punto y coma (;) como separador
        const [filename, serie_id, title, camera, lens, material, dimensions, date, description] = line.split(';');

        if (!filename) continue;

        console.log(`🚀 Procesando: ${title || filename}...`);

        // 1. Verificar si ya existe el registro por filename
        const check = await api(`/items/artworks?filter[filename][_eq]=${filename}`);
        if (!check.error && check.data.length > 0) {
            console.log(`⏩ Ya existe: ${filename}. Actualizando...`);
            await api(`/items/artworks/${check.data[0].id}`, 'PATCH', {
                title: title || filename,
                description: description || "",
                // Otros campos si se desea...
            });
        } else {
            console.log(`➕ Creando registro para: ${filename}`);
            await api(`/items/artworks`, 'POST', {
                filename: filename.trim(),
                title: title || filename,
                description: description || "",
                likes: 0
            });
        }
    }

    console.log('✅ Repoblación finalizada.');
}

runSeed().catch(console.error);
