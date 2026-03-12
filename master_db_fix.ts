
import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

async function fixDatabase() {
    try {
        console.log('Running SQL Fix...');

        // 1. Add likes column if not exists
        try {
            await db.execute(sql`ALTER TABLE artworks ADD COLUMN likes INT DEFAULT 0`);
            console.log('Added "likes" column to "artworks"');
        } catch (e) {
            console.log('"likes" column might already exist:', e.message);
        }

        // 2. Create tracking table
        try {
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS artwork_likes_tracking (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    artwork_filename VARCHAR(255) NOT NULL,
                    user_ip VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Created "artwork_likes_tracking" table');
        } catch (e) {
            console.log('Error creating tracking table:', e.message);
        }

        console.log('Database fixed successfully.');
    } catch (e) {
        console.error('Master fix error:', e);
    }
}

fixDatabase().then(() => process.exit(0));
