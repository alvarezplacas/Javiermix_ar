import 'dotenv/config';

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
    return { ok: res.ok, status: res.status, data: data.data || data };
}

async function updateSchema() {
    console.log('🏗️ Actualizando modelo de datos para Especificaciones Técnicas...');

    const fieldsToAdd = [
        { field: 'camera', type: 'string', meta: { interface: 'input', width: 'half', note: 'Cámara usada' } },
        { field: 'lens', type: 'string', meta: { interface: 'input', width: 'half', note: 'Lente/Objetivo' } },
        { field: 'shutter', type: 'string', meta: { interface: 'input', width: 'third', note: 'Velocidad' } },
        { field: 'iso', type: 'integer', meta: { interface: 'input', width: 'third', note: 'ISO' } },
        { field: 'aperture', type: 'string', meta: { interface: 'input', width: 'third', note: 'Apertura (f/)' } },
        { field: 'dimensions', type: 'string', meta: { interface: 'input', width: 'half', note: 'Dimensiones físicas' } },
        { field: 'material', type: 'string', meta: { interface: 'input', width: 'half', note: 'Papel/Material' } },
        { field: 'date_shot', type: 'string', meta: { interface: 'datetime', width: 'full', note: 'Fecha de captura' } }
    ];

    for (const f of fieldsToAdd) {
        console.log(`  ➕ Agregando campo: ${f.field}...`);
        const res = await api('/fields/artworks', 'POST', f);
        if (!res.ok) console.log(`    (Ya existe o error: ${res.data.errors?.[0]?.message})`);
    }

    console.log('✅ Esquema listo.');
}

updateSchema().catch(console.error);
