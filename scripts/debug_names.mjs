import 'dotenv/config';

const DIRECTUS_URL = 'https://admin.javiermix.ar';
const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function api(path) {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
        headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
    });
    return await res.json();
}

async function debugNames() {
    const artworksRes = await api('/items/artworks?limit=10');
    const filesRes = await api('/files?limit=10');

    console.log('🖼️ Nombres en ARTWORKS:');
    artworksRes.data.forEach(a => console.log(`  - [${a.id}] filename: "${a.filename}" | title: "${a.title}"`));

    console.log('\n📁 Nombres en FILES:');
    filesRes.data.forEach(f => console.log(`  - [${f.id}] filename_download: "${f.filename_download}" | title: "${f.title}"`));
}

debugNames().catch(console.error);
