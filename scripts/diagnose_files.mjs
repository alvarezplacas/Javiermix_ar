const DIRECTUS_URL = 'https://admin.javiermix.ar';
const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function api(path) {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
        headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
    });
    return await res.json();
}

async function analyzeFiles() {
    console.log('🔍 Analizando disparidad entre archivos...');
    const res = await api('/files?limit=20&sort=-created_on');
    const files = res.data || [];

    console.log('\n--- DETALLE DE ARCHIVOS RECIENTES ---');
    files.forEach(f => {
        const status = f.type.includes('image') ? '✅' : '❌';
        console.log(`${status} [${f.id}] ${f.title}`);
        console.log(`   - Nombre en Disco: ${f.filename_disk}`);
        console.log(`   - Tipo: ${f.type}`);
        console.log(`   - Tamaño: ${(f.filesize / 1024).toFixed(2)} KB`);
        console.log(`   - ¿Tiene miniatura?: ${f.type.startsWith('image/')}`);
        console.log('   -----------------------------------');
    });
}

analyzeFiles().catch(console.error);
