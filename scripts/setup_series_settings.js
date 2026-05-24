const token = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';
const url = 'https://admin.javiermix.ar';

async function request(endpoint, method, body) {
    const res = await fetch(`${url}${endpoint}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) {
        console.error(`Error in ${method} ${endpoint}:`, data);
        throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }
    return data;
}

async function run() {
    try {
        console.log("1. Creando colección series_settings...");
        await request('/collections', 'POST', {
            collection: 'series_settings',
            meta: {
                icon: 'view_carousel',
                note: 'Ajustes y narrativas para las colecciones',
                display_template: '{{folder_id.name}}',
                hidden: false,
                singleton: false
            },
            schema: {
                name: 'series_settings'
            },
            fields: [
                {
                    field: 'id',
                    type: 'integer',
                    meta: { hidden: true, interface: 'input' },
                    schema: { is_primary_key: true, has_auto_increment: true }
                }
            ]
        });
        console.log("✅ Colección creada.");

        console.log("2. Creando campo folder_id (M2O)...");
        await request('/fields/series_settings', 'POST', {
            field: 'folder_id',
            type: 'uuid',
            meta: {
                interface: 'select-dropdown-m2o',
                special: ['m2o'],
                options: {
                    template: '{{name}}'
                }
            },
            schema: null
        });
        // Crear la relación para folder_id
        await request('/relations', 'POST', {
            collection: 'series_settings',
            field: 'folder_id',
            related_collection: 'directus_folders'
        });
        console.log("✅ Campo folder_id creado y relacionado.");

        console.log("3. Creando campo narrative (WYSIWYG)...");
        await request('/fields/series_settings', 'POST', {
            field: 'narrative',
            type: 'text',
            meta: {
                interface: 'input-rich-text-html',
                options: {}
            },
            schema: null
        });
        console.log("✅ Campo narrative creado.");

        console.log("4. Creando campo cover_artwork (M2O File)...");
        await request('/fields/series_settings', 'POST', {
            field: 'cover_artwork',
            type: 'uuid',
            meta: {
                interface: 'file-image',
                special: ['file']
            },
            schema: null
        });
        await request('/relations', 'POST', {
            collection: 'series_settings',
            field: 'cover_artwork',
            related_collection: 'directus_files'
        });
        console.log("✅ Campo cover_artwork creado y relacionado.");

        console.log("🎉 ¡Configuración de Directus completada con éxito!");
    } catch (e) {
        console.error("Fallo:", e.message);
    }
}
run();
