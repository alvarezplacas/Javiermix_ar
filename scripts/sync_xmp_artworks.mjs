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
    return await res.json();
}

/**
 * Extrae metadatos técnicos de un archivo XMP usando Regex para evitar dependencias pesadas.
 */
function parseXMP(content) {
    const meta = {};
    const extract = (regex) => {
        const match = content.match(regex);
        return match ? match[1] : null;
    };

    meta.camera = extract(/tiff:Model="([^"]+)"/) || extract(/tiff:Model>([^<]+)</);
    meta.lens = extract(/aux:Lens="([^"]+)"/) || extract(/aux:Lens>([^<]+)</) || extract(/exif:LensModel="([^"]+)"/);
    meta.shutter = extract(/exif:ExposureTime="([^"]+)"/) || extract(/exif:ExposureTime>([^<]+)</);
    meta.aperture = extract(/exif:FNumber="([^"]+)"/) || extract(/exif:FNumber>([^<]+)</);
    meta.iso = extract(/exif:ISOSpeedRatings>[\s\S]*?<rdf:li>([^<]+)<\/rdf:li>/) || extract(/exif:ISOSpeedRatings="([^"]+)"/);
    meta.date_shot = extract(/xmp:CreateDate="([^"]+)"/) || extract(/xmp:CreateDate>([^<]+)</);

    return meta;
}

async function syncAll() {
    console.log('🔄 Iniciando Sincronización Maestra (Imágenes + XMP)...');

    // 1. Obtener todos los archivos de la biblioteca
    const filesRes = await api('/files?limit=-1');
    const files = filesRes.data || [];
    
    // 2. Obtener todas las obras
    const artworksRes = await api('/items/artworks?limit=-1');
    const artworks = artworksRes.data || [];

    console.log(`📊 Detectados ${files.length} archivos y ${artworks.length} obras.`);

    for (const artwork of artworks) {
        // Normalizar nombre de archivo (ej: JMX_9177.avif -> jmx_9177)
        const baseName = artwork.filename?.split('.')[0]?.toLowerCase();
        if (!baseName) continue;

        console.log(`\n🖼️ Procesando Obra: ${artwork.title} (${baseName})`);

        // A. Buscar Imagen Principal
        const mainImage = files.find(f => 
            f.type.startsWith('image/') && 
            f.filename_download.toLowerCase().startsWith(baseName) &&
            !f.filename_download.toLowerCase().includes('_2.') &&
            !f.filename_download.toLowerCase().includes(' 2.')
        );

        // B. Buscar Archivo XMP
        const xmpFile = files.find(f => 
            f.filename_download.toLowerCase().startsWith(baseName) && 
            f.filename_download.toLowerCase().endsWith('.xmp')
        );

        const updateData = {};

        if (mainImage) {
            console.log(`   ✅ Encontrada Imagen: ${mainImage.filename_download} (ID: ${mainImage.id})`);
            updateData.image = mainImage.id;
        }

        if (xmpFile) {
            console.log(`   📄 Encontrado XMP: ${xmpFile.filename_download}`);
            try {
                const xmpContentRes = await fetch(`${DIRECTUS_URL}/assets/${xmpFile.id}`);
                const xmpText = await xmpContentRes.text();
                const meta = parseXMP(xmpText);
                
                if (meta.camera) updateData.camera = meta.camera;
                if (meta.lens) updateData.lens = meta.lens;
                if (meta.shutter) updateData.shutter = meta.shutter;
                if (meta.iso) updateData.iso = parseInt(meta.iso);
                if (meta.aperture) updateData.aperture = `f/${meta.aperture}`;
                if (meta.date_shot) updateData.date_shot = meta.date_shot;

                console.log(`   🛠️ Metadata extraída: ${meta.camera} | ${meta.lens}`);
            } catch (err) {
                console.error(`   ❌ Error analizando XMP: ${err.message}`);
            }
        }

        if (Object.keys(updateData).length > 0) {
            await api(`/items/artworks/${artwork.id}`, 'PATCH', updateData);
            console.log(`   💾 Registro actualizado en Directus.`);
        } else {
            console.log(`   🟡 Sin cambios para esta obra.`);
        }
    }

    console.log('\n✨ Sincronización Finalizada con Éxito.');
}

syncAll().catch(console.error);
