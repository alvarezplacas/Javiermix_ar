
import { db } from './src/db/client';
import { artworks, artworkLikesTracking } from './src/db/schema';

async function diagnose() {
    try {
        const works = await db.select().from(artworks);
        const tracking = await db.select().from(artworkLikesTracking);

        console.log('--- ARTWORKS ---');
        console.table(works);
        console.log('--- TRACKING ---');
        console.table(tracking);
    } catch (e) {
        console.error('Diagnosis error:', e);
    }
}

diagnose().then(() => process.exit(0));
