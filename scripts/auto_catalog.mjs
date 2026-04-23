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

async function autoCatalog() {
    console.log('🚀 Iniciando Auto-Catalogación de Obras...');

    // 1. Obtener carpetas (Series)
    const foldersRes = await api('/folders');
    const folders = foldersRes.data || [];
    
    // 2. Obtener obras existentes (para no duplicar)
    const artworksRes = await api('/items/artworks?limit=-1');
    const existingArtworks = artworksRes.data || [];
    const usedImages = new Set(existingArtworks.map(a => a.image).filter(val => val !== null));

    console.log(`📊 Obras encontradas: ${existingArtworks.length}`);

    for (const folder of folders) {
        if (['Home', 'home', 'HOME'].includes(folder.name)) continue;

        console.log(`📁 Procesando serie: ${folder.name}...`);

        // 3. Obtener archivos en esta carpeta que sean imágenes
        const filesRes = await api(`/files?filter[folder][_eq]=${folder.id}&filter[type][_contains]=image`);
        const files = filesRes.data || [];

        for (const file of files) {
            // Saltamos si ya tiene una obra o si es una variante (ej: _2.avif)
            if (usedImages.has(file.id)) {
                // console.log(`   ⏭️ Imagen ya vinculada: ${file.filename_download}`);
                continue;
            }

            if (file.filename_download.toLowerCase().match(/[ _]2\./)) {
                // console.log(`   ⏭️ Ignorando variante: ${file.filename_download}`);
                continue;
            }

            // 4. Crear la obra automáticamente
            // El título se deriva del nombre del archivo (ej: JMX_9140 -> JMX 9140)
            const title = file.filename_download.split('.')[0].replace(/[_-]/g, ' ').toUpperCase();
            
            const newArtwork = {
                title: title,
                image: file.id,
                serie_id: folder.name, // Usamos el nombre de la carpeta como identificador de serie
                status: 'published',
                price: 0,
                stock: 1
            };

            const createRes = await api('/items/artworks', 'POST', newArtwork);
            if (createRes.data) {
                console.log(`   ✅ Creada obra: "${title}" en serie "${folder.name}"`);
                usedImages.add(file.id);
            } else {
                console.error(`   ❌ Error al crear obra para ${file.filename_download}:`, createRes);
            }
        }
    }

    console.log('✨ Auto-Catalogación Finalizada.');
}

autoCatalog().catch(console.error);
