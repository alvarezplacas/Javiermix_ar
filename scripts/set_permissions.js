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
    return await res.json();
}

async function run() {
    try {
        console.log("Buscando el rol Public...");
        const roles = await request('/roles', 'GET');
        // El rol público suele no existir en la colección de roles, su ID se representa con el rol "null" en la tabla permissions.
        
        console.log("Creando permiso de lectura público para series_settings...");
        const permResult = await request('/permissions', 'POST', {
            collection: 'series_settings',
            action: 'read',
            fields: ['*'],
            role: null
        });
        console.log("Permiso creado:", permResult);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
