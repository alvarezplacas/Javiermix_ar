
import { DirectusManager } from './src/conexion/directus.js';

async function testFooter() {
    try {
        const client = await DirectusManager.getClient();
        const settings = await client.request(readItems('footer_settings' as any));
        console.log('Footer Settings:', JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testFooter();
