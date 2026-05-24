const token = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';
const url = 'https://admin.javiermix.ar/collections/directus_folders';

async function run() {
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meta: { hidden: false } })
    });
    const data = await res.json();
    console.log("Unhide Result:", JSON.stringify(data, null, 2));
}
run();
