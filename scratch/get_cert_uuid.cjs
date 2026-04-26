const { createDirectus, rest, staticToken, readItems } = require('@directus/sdk');

const DIRECTUS_URL = 'https://admin.javiermix.ar';
const DIRECTUS_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function getSampleCert() {
    try {
        const client = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(DIRECTUS_TOKEN));
        const certs = await client.request(readItems('certificates', { limit: 1 }));
        if (certs.length > 0) {
            console.log('UUID_FOUND:', certs[0].id);
        } else {
            console.log('NO_CERTS_FOUND');
        }
    } catch (e) {
        console.error(e);
    }
}

getSampleCert();
