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
        const data = await request('/items/series_settings');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
