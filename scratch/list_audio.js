import { createDirectus, rest, staticToken, readFiles } from '@directus/sdk';

const PUBLIC_URL = 'https://admin.javiermix.ar';
const STATIC_TOKEN = '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

async function listAudioFiles() {
    const client = createDirectus(PUBLIC_URL).with(rest()).with(staticToken(STATIC_TOKEN));
    try {
        const files = await client.request(readFiles({
            filter: {
                type: {
                    _starts_with: 'audio/'
                }
            }
        }));
        console.log(JSON.stringify(files, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listAudioFiles();
