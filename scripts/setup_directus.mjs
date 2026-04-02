/**
 * Script de Configuración Maestra para Directus 11 - Javier Mix V2
 * Ejecutar con: node scripts/setup_directus.mjs
 */

const DIRECTUS_URL = 'https://admin.javiermix.ar';
const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';
const PUBLIC_POLICY_ID = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

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
        if (res.status === 401) console.error('❌ Error: Token inválido o expirado.');
        return { error: true, status: res.status, data };
    }
    return { error: false, data: data.data || data };
}

async function setup() {
    console.log('🚀 Iniciando configuración de Directus (Modo Robusto)...');

    // 1. Crear Carpetas (si no existen)
    console.log('📂 Verificando carpetas...');
    const foldersRes = await api('/folders');
    const existingFolders = foldersRes.data || [];
    
    if (!existingFolders.find(f => f.name === 'home')) {
        console.log('  + Creando carpeta: home');
        await api('/folders', 'POST', { name: 'home' });
    }
    if (!existingFolders.find(f => f.name === 'Catalogo')) {
        console.log('  + Creando carpeta: Catalogo');
        await api('/folders', 'POST', { name: 'Catalogo' });
    }

    // 2. Crear Colecciones
    const collectionsRes = await api('/collections');
    const existingCollections = collectionsRes.data || [];

    const collectionsToCreate = [
        {
            collection: 'artworks',
            meta: { icon: 'palette' },
            fields: [
                { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true } },
                { field: 'filename', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
                { field: 'title', type: 'string', meta: { interface: 'input' } },
                { field: 'likes', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } }
            ]
        },
        {
            collection: 'magazine',
            meta: { icon: 'article' },
            fields: [
                { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true } },
                { field: 'status', type: 'string', meta: { interface: 'select-dropdown' }, schema: { default_value: 'draft' } },
                { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
                { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
                { field: 'content_html', type: 'text', meta: { interface: 'input-rich-text-html' } },
                { field: 'featured_image', type: 'uuid', meta: { interface: 'file' } }
            ]
        },
        {
            collection: 'collector_join',
            meta: { icon: 'person_add' },
            fields: [
                { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true } },
                { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
                { field: 'email', type: 'string', meta: { interface: 'input', required: true } },
                { field: 'instagram', type: 'string', meta: { interface: 'input' } }
            ]
        }
    ];

    for (const c of collectionsToCreate) {
        if (!existingCollections.find(ex => ex.collection === c.collection)) {
            console.log(`🗂️ Creando colección: ${c.collection}...`);
            await api('/collections', 'POST', c);
        } else {
            console.log(`⏩ Saltando colección existente: ${c.collection}`);
        }
    }

    // 3. Configurar Permisos (Vía Políticas en Directus 11)
    console.log('🛡️ Configurando permisos públicos...');
    const permissionsToApply = [
        { collection: 'directus_files', action: 'read', fields: ['*'] },
        { collection: 'artworks', action: 'read', fields: ['*'] },
        { collection: 'magazine', action: 'read', fields: ['*'], permissions: { status: { _eq: 'published' } } },
        { collection: 'collector_join', action: 'create', fields: ['*'] }
    ];

    for (const p of permissionsToApply) {
        console.log(`  + Permiso: ${p.action} en ${p.collection}`);
        await api('/permissions', 'POST', {
            policy: PUBLIC_POLICY_ID,
            ...p
        });
    }

    console.log('✨ Configuración completada.');
}

setup().catch(console.error);

setup().catch(console.error);
