
import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

async function fixMagazineSchema() {
    try {
        console.log('Updating Magazine schema for ratings...');

        // 1. Add rating columns to magazine
        try {
            await db.execute(sql`ALTER TABLE magazine ADD COLUMN rating_total INT DEFAULT 0`);
            await db.execute(sql`ALTER TABLE magazine ADD COLUMN rating_count INT DEFAULT 0`);
            console.log('Added rating columns to "magazine"');
        } catch (e) {
            console.log('Rating columns might already exist:', e.message);
        }

        // 2. Create tracking table for magazine ratings
        try {
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS magazine_ratings_tracking (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    article_slug VARCHAR(255) NOT NULL,
                    user_ip VARCHAR(100) NOT NULL,
                    score INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Created "magazine_ratings_tracking" table');
        } catch (e) {
            console.log('Error creating tracking table:', e.message);
        }

        console.log('Magazine Database schema updated successfully.');
    } catch (e) {
        console.error('Master fix error:', e);
    }
}

fixMagazineSchema().then(() => process.exit(0));
