const PUBLIC_URL = 'https://admin.javiermix.ar';
const STATIC_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function testFooter() {
    const url = `${PUBLIC_URL}/items/footer_settings`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${STATIC_TOKEN}`
            }
        });
        const data = await response.json();
        console.log("FOOTER SETTINGS DATA:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("ERROR FETCHING FOOTER:", e.message);
    }
}

testFooter();
