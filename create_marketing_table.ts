
import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

async function createMarketingTable() {
    try {
        console.log('Creating marketing_strategies table...');
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS marketing_strategies (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                priority VARCHAR(20) DEFAULT 'medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table created successfully.');
    } catch (e) {
        console.error('Error creating table:', e);
    }
}

createMarketingTable().then(() => process.exit(0));
