import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import 'dotenv/config';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.javiermix.ar';
const token = process.env.DIRECTUS_ADMIN_TOKEN || '';

async function test() {
    console.log(`Testing Directus at ${DIRECTUS_URL} with token: ${token ? 'PROVIDED' : 'MISSING'}`);
    const client = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(token));
    
    try {
        const items = await client.request(readItems('artworks', { limit: 5 }));
        console.log(`SUCCESS: Found ${items.length} artworks.`);
        console.log(JSON.stringify(items, null, 2));
    } catch (e: any) {
        console.error(`ERROR fetching artworks: ${e.message}`);
        if (e.response) {
            console.error(`Response code: ${e.response.status}`);
        }
    }
}

test();
