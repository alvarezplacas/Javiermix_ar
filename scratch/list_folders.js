import { createDirectus, rest, staticToken, readFolders } from '@directus/sdk';

const PUBLIC_URL = 'https://admin.javiermix.ar';
const STATIC_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function listFolders() {
    const client = createDirectus(PUBLIC_URL).with(rest()).with(staticToken(STATIC_TOKEN));
    try {
        const folders = await client.request(readFolders());
        console.log(JSON.stringify(folders, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listFolders();
