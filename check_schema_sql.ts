
import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

async function checkStructure() {
    try {
        const columns = await db.execute(sql`DESCRIBE artworks`);
        console.log('--- COLUMNS IN artworks ---');
        console.table(columns[0]);

        try {
            const tracking = await db.execute(sql`DESCRIBE artwork_likes_tracking`);
            console.log('--- COLUMNS IN artwork_likes_tracking ---');
            console.table(tracking[0]);
        } catch (e) {
            console.log('artwork_likes_tracking does not exist');
        }
    } catch (e) {
        console.error('Error checking structure:', e);
    }
}

checkStructure().then(() => process.exit(0));
