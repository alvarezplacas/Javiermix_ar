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
 * Normalización extrema para matching infalible:
 * "JMX_9177.avif" -> "jmx9177"
 * "Jmx 9177" -> "jmx9177"
 */
function normalize(str) {
    if (!str) return '';
    return str.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extrae metadatos técnicos de un archivo XMP
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
    meta.date = extract(/xmp:CreateDate="([^"]+)"/) || extract(/xmp:CreateDate>([^<]+)</);

    return meta;
}

async function syncAll() {
    console.log('🔄 Iniciando Sincronización Inteligente...');

    const [filesRes, artworksRes] = await Promise.all([
        api('/files?limit=-1'),
        api('/items/artworks?limit=-1')
    ]);

    const files = filesRes.data || [];
    const artworks = artworksRes.data || [];

    console.log(`📊 Obras: ${artworks.length} | Archivos: ${files.length}`);

    for (const artwork of artworks) {
        const artCode = normalize(artwork.filename);
        if (!artCode) continue;

        const updateData = {};

        // 1. Vincular Imagen Madre
        const mainImage = files.find(f => {
            const fCode = normalize(f.title) || normalize(f.filename_download);
            return f.type.startsWith('image/') && 
                   fCode === artCode && 
                   !f.filename_download.toLowerCase().match(/[ _]2\./);
        });

        if (mainImage) {
            updateData.image = mainImage.id;
        }

        // 2. Vincular y Parsear XMP
        const xmpFile = files.find(f => {
            const fCode = normalize(f.title) || normalize(f.filename_download);
            return f.filename_download.toLowerCase().endsWith('.xmp') && fCode === artCode;
        });

        if (xmpFile) {
            try {
                const xmpContentRes = await fetch(`${DIRECTUS_URL}/assets/${xmpFile.id}`);
                const xmpText = await xmpContentRes.text();
                const meta = parseXMP(xmpText);
                
                if (meta.camera) updateData.camera = meta.camera;
                if (meta.lens) updateData.lens = meta.lens;
                if (meta.shutter) updateData.shutter = meta.shutter;
                if (meta.iso) updateData.iso = parseInt(meta.iso);
                if (meta.aperture) updateData.aperture = `f/${meta.aperture}`;
                if (meta.date) updateData.date = meta.date.split('T')[0];

                console.log(`   ✅ Metadatos vinculados para: ${artwork.title}`);
            } catch (err) {
                console.warn(`   ⚠️ Error en XMP de ${artwork.title}`);
            }
        }

        if (Object.keys(updateData).length > 0) {
            await api(`/items/artworks/${artwork.id}`, 'PATCH', updateData);
        }
    }

    console.log('\n✨ Sincronización Finalizada.');
}

syncAll().catch(console.error);
