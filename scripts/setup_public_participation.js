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
        console.log("1. Añadiendo nuevos campos a series_settings...");
        
        const fields = [
            {
                field: 'invitation_title',
                type: 'string',
                meta: {
                    interface: 'input',
                    options: { placeholder: 'Sube tu imagen.' },
                    note: 'Título del disparador / botón de invitación'
                }
            },
            {
                field: 'invitation_text',
                type: 'text',
                meta: {
                    interface: 'textarea',
                    options: { placeholder: 'Deja tus rastros con los signos que te habitan.' },
                    note: 'Texto explicativo del disparador / invitación'
                }
            },
            {
                field: 'confirmation_text',
                type: 'text',
                meta: {
                    interface: 'textarea',
                    options: { placeholder: 'Ahora un nuevo signo habita nuestro espacio.' },
                    note: 'Mensaje de confirmación (El Eco) después del envío'
                }
            }
        ];

        for (const field of fields) {
            console.log(`Creando campo ${field.field} en series_settings...`);
            const res = await request('/fields/series_settings', 'POST', field);
            if (res.error) {
                console.log(`⚠️ Campo ${field.field} posiblemente ya existe o error.`);
            } else {
                console.log(`✅ Campo ${field.field} creado.`);
            }
        }

        console.log("\n2. Creando colección public_submissions...");
        const submissionCollectionRes = await request('/collections', 'POST', {
            collection: 'public_submissions',
            meta: {
                icon: 'people',
                note: 'Fotos participativas del público pendientes de curaduría',
                display_template: '{{name}} - {{status}}',
                hidden: false,
                singleton: false
            },
            schema: {
                name: 'public_submissions'
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

        if (submissionCollectionRes.error) {
            console.log("⚠️ Colección public_submissions posiblemente ya existe.");
        } else {
            console.log("✅ Colección public_submissions creada con éxito.");
        }

        console.log("\n3. Creando campos en public_submissions...");
        const subFields = [
            {
                field: 'name',
                type: 'string',
                meta: { interface: 'input', note: 'Nombre del participante' },
                schema: {}
            },
            {
                field: 'email',
                type: 'string',
                meta: { interface: 'input', note: 'Email del participante' },
                schema: {}
            },
            {
                field: 'social_link',
                type: 'string',
                meta: { interface: 'input', note: 'Instagram, Facebook o Web (opcional)' },
                schema: {}
            },
            {
                field: 'status',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'Pendiente', value: 'pending' },
                            { text: 'Aprobado', value: 'approved' },
                            { text: 'Rechazado', value: 'rejected' }
                        ]
                    },
                    note: 'Estado de la curaduría'
                },
                schema: { default_value: 'pending' }
            },
            {
                field: 'date_created',
                type: 'timestamp',
                meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half' },
                schema: {}
            }
        ];

        for (const field of subFields) {
            console.log(`Creando campo ${field.field} en public_submissions...`);
            const res = await request('/fields/public_submissions', 'POST', field);
            if (res.error) {
                console.log(`⚠️ Campo ${field.field} en public_submissions ya existe o error.`);
            } else {
                console.log(`✅ Campo ${field.field} en public_submissions creado.`);
            }
        }

        console.log("\n4. Creando campo folder_id (M2O a directus_folders) en public_submissions...");
        const folderFieldRes = await request('/fields/public_submissions', 'POST', {
            field: 'folder_id',
            type: 'uuid',
            meta: {
                interface: 'select-dropdown-m2o',
                special: ['m2o'],
                options: { template: '{{name}}' }
            },
            schema: null
        });
        if (!folderFieldRes.error) {
            await request('/relations', 'POST', {
                collection: 'public_submissions',
                field: 'folder_id',
                related_collection: 'directus_folders'
            });
            console.log("✅ Campo folder_id creado y relacionado.");
        } else {
            console.log("⚠️ Campo folder_id ya existe en public_submissions.");
        }

        console.log("\n5. Creando campo image (M2O a directus_files) en public_submissions...");
        const imageFieldRes = await request('/fields/public_submissions', 'POST', {
            field: 'image',
            type: 'uuid',
            meta: {
                interface: 'file-image',
                special: ['file']
            },
            schema: null
        });
        if (!imageFieldRes.error) {
            await request('/relations', 'POST', {
                collection: 'public_submissions',
                field: 'image',
                related_collection: 'directus_files'
            });
            console.log("✅ Campo image creado y relacionado.");
        } else {
            console.log("⚠️ Campo image ya existe en public_submissions.");
        }

        console.log("\n🎉 ¡Proceso de configuración de Directus finalizado!");
    } catch (e) {
        console.error("Fallo inesperado:", e.message);
    }
}

run();
