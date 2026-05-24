const token = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';
const url = 'https://admin.javiermix.ar';

async function request(endpoint) {
    const res = await fetch(`${url}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
}

async function run() {
    try {
        const query = '/items/series_settings?filter[folder_id][_eq]=0a589169-e948-448f-b009-3f07f9327d50';
        console.log("Querying:", query);
        const data = await request(query);
        console.log("Result:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
