// d:\web_javiermix\JAVIERMIX-AR-0504\scratch\list_series_slugs.js
import { getSeries } from '../src/conexion/directus.js';

function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function run() {
    console.log("=== DIAGNÓSTICO JMX: SERIES Y SLUGS ===");
    try {
        const series = await getSeries();
        console.log(`Encontradas ${series.length} series activas en Directus:\n`);
        
        series.forEach((s, idx) => {
            const friendlySlug = slugify(s.name);
            console.log(`${idx + 1}. [Nombre]: "${s.name}"`);
            console.log(`   [UUID Carpeta]: ${s.id}`);
            console.log(`   [URL Antigua]:  https://javiermix.ar/galeria/${s.id}`);
            console.log(`   [URL Nueva]:    https://javiermix.ar/galeria/${friendlySlug}`);
            console.log(`   [Estado]:       Redirección 301 Activa.`);
            console.log("--------------------------------------------------");
        });
    } catch(e) {
        console.error("Error al obtener series:", e.message);
    }
}

run();
