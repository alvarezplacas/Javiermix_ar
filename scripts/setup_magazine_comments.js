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
        return { error: true, data };
    }
    return { error: false, data };
}

async function run() {
    try {
        console.log("1. Creando colección magazine_comments...");
        const collectionRes = await request('/collections', 'POST', {
            collection: 'magazine_comments',
            meta: {
                icon: 'comment',
                note: 'Comentarios y valoraciones de lectores de la revista digital',
                display_template: '{{name}} - {{email}} ({{rating}} estrellas)',
                hidden: false,
                singleton: false
            },
            schema: {
                name: 'magazine_comments'
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

        if (collectionRes.error) {
            console.log("⚠️ Colección magazine_comments posiblemente ya existe.");
        } else {
            console.log("✅ Colección magazine_comments creada con éxito.");
        }

        console.log("\n2. Creando campos en magazine_comments...");
        const fields = [
            {
                field: 'name',
                type: 'string',
                meta: { interface: 'input', note: 'Nombre del lector (Requerido)' },
                schema: { is_nullable: false }
            },
            {
                field: 'email',
                type: 'string',
                meta: { interface: 'input', note: 'Email del lector (Requerido)' },
                schema: { is_nullable: false }
            },
            {
                field: 'instagram',
                type: 'string',
                meta: { interface: 'input', note: 'Instagram del lector (Opcional)' },
                schema: {}
            },
            {
                field: 'comment',
                type: 'text',
                meta: { interface: 'textarea', note: 'Texto de la opinión (Requerido)' },
                schema: { is_nullable: false }
            },
            {
                field: 'rating',
                type: 'integer',
                meta: { 
                    interface: 'select-dropdown', 
                    options: {
                        choices: [
                            { text: '1 Estrella', value: 1 },
                            { text: '2 Estrellas', value: 2 },
                            { text: '3 Estrellas', value: 3 },
                            { text: '4 Estrellas', value: 4 },
                            { text: '5 Estrellas', value: 5 }
                        ]
                    },
                    note: 'Calificación dada por el lector' 
                },
                schema: {}
            },
            {
                field: 'status',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'Aprobado', value: 'approved' },
                            { text: 'Pendiente', value: 'pending' },
                            { text: 'Spam', value: 'spam' }
                        ]
                    },
                    note: 'Estado de moderación'
                },
                schema: { default_value: 'approved' }
            },
            {
                field: 'date_created',
                type: 'timestamp',
                meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half' },
                schema: {}
            }
        ];

        for (const field of fields) {
            console.log(`Creando campo ${field.field} en magazine_comments...`);
            const res = await request('/fields/magazine_comments', 'POST', field);
            if (res.error) {
                console.log(`⚠️ Campo ${field.field} ya existe o error.`);
            } else {
                console.log(`✅ Campo ${field.field} creado.`);
            }
        }

        console.log("\n3. Creando campo article_id (M2O a magazine) en magazine_comments...");
        const articleFieldRes = await request('/fields/magazine_comments', 'POST', {
            field: 'article_id',
            type: 'integer',
            meta: {
                interface: 'select-dropdown-m2o',
                special: ['m2o'],
                options: { template: '{{title}}' }
            },
            schema: {}
        });
        if (!articleFieldRes.error) {
            await request('/relations', 'POST', {
                collection: 'magazine_comments',
                field: 'article_id',
                related_collection: 'magazine'
            });
            console.log("✅ Relación article_id con magazine creada.");
        } else {
            console.log("⚠️ Campo article_id ya existe o error.");
        }

        console.log("\n🎉 ¡Proceso de configuración de Directus finalizado con éxito!");
    } catch (e) {
        console.error("Fallo inesperado:", e.message);
    }
}

run();
