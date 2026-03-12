
import { db } from './src/db/client';
import { artworks } from './src/db/schema';

async function checkArtworks() {
    try {
        const all = await db.select().from(artworks).limit(5);
        console.log('Sample Artworks in DB:', JSON.stringify(all, null, 2));
    } catch (e) {
        console.log('Error or table empty:', e.message);
    }
}

checkArtworks().catch(console.error);
