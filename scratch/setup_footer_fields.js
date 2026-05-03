
const URL = 'https://admin.javiermix.ar';
const TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function createField(fieldName, type, uiInterface) {
    console.log(`Creando campo: ${fieldName}...`);
    const res = await fetch(`${URL}/fields/footer_settings`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: fieldName,
            type: type,
            meta: {
                interface: uiInterface,
                width: 'half'
            }
        })
    });
    const json = await res.json();
    if (json.errors) {
        console.error(`Error en ${fieldName}:`, JSON.stringify(json.errors));
    } else {
        console.log(`✅ ${fieldName} creado.`);
    }
}

async function configure() {
    for (let i = 1; i <= 5; i++) {
        await createField(`footer_${i}_title`, 'string', 'input');
        await createField(`footer_${i}_content`, 'text', 'wysiwyg');
    }
}

configure();
