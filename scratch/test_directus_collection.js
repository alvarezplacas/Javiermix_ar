import { DirectusManager } from './src/conexion/directus.js';
import { readItems } from '@directus/sdk';

async function testFetch() {
    try {
        const client = await DirectusManager.getClient();
        const items = await client.request(readItems('laboratorio_entornos'));
        console.log('SUCCESS: Found items:', items);
    } catch (e) {
        console.error('FAILED: Could not fetch laboratorio_entornos. Error:', e.message);
    }
}

testFetch();
