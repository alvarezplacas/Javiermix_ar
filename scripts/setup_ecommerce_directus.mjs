// No import needed for fetch in Node 18+

const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';
const DIRECTUS_URL = 'https://admin.javiermix.ar';

async function setup() {
    console.log('🚀 Iniciando configuración de Directus para Ecommerce V8...');

    const headers = {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json'
    };

    // 1. Añadir campo 'price' a artworks
    console.log('📦 Añadiendo campo "price" a artworks...');
    const priceRes = await fetch(`${DIRECTUS_URL}/fields/artworks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            field: 'price',
            type: 'float',
            meta: {
                interface: 'input',
                display: 'formatted-value',
                note: 'Precio de venta en USD',
                width: 'half'
            }
        })
    });
    console.log('   Status:', priceRes.status);

    // 2. Añadir campo 'currency' a artworks
    console.log('📦 Añadiendo campo "currency" a artworks...');
    const curRes = await fetch(`${DIRECTUS_URL}/fields/artworks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            field: 'currency',
            type: 'string',
            schema: { default_value: 'USD' },
            meta: {
                interface: 'input',
                note: 'Moneda de venta',
                width: 'half'
            }
        })
    });
    console.log('   Status:', curRes.status);

    // 3. Crear colección 'orders'
    console.log('📦 Creando colección "orders"...');
    const orderRes = await fetch(`${DIRECTUS_URL}/collections`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            collection: 'orders',
            schema: {},
            meta: {
                icon: 'shopping_cart',
                note: 'Registro de ventas del Motor V8'
            }
        })
    });
    console.log('   Status:', orderRes.status);

    // 4. Añadir campos a 'orders'
    const orderFields = [
        { field: 'status', type: 'string', schema: { default_value: 'pending' }, meta: { interface: 'select', options: { choices: [{text: 'Pending', value: 'pending'}, {text: 'Paid', value: 'paid'}, {text: 'Error', value: 'error'}] } } },
        { field: 'total', type: 'float', meta: { interface: 'input' } },
        { field: 'items', type: 'json', meta: { interface: 'code' } },
        { field: 'mercadopago_id', type: 'string', meta: { interface: 'input' } },
        { field: 'customer_email', type: 'string', meta: { interface: 'input' } }
    ];

    for (const f of orderFields) {
        console.log(`📦 Añadiendo campo "${f.field}" a orders...`);
        const fRes = await fetch(`${DIRECTUS_URL}/fields/orders`, {
            method: 'POST', headers, body: JSON.stringify(f)
        });
        console.log(`   Status [${f.field}]:`, fRes.status);
    }

    console.log('✅ Configuración completada.');
}

setup().catch(console.error);
