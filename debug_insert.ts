import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

try {
    const data = {
        name: "Test User",
        email: "test_" + Date.now() + "@example.com",
        instagram: "@test",
        notes: "Test notes",
        status: "lead"
    };

    console.log('--- INTENTANDO INSERCIÓN MANUAL ---');
    const res = await db.execute(sql`
        INSERT INTO collectors (name, email, instagram, notes, status) 
        VALUES (${data.name}, ${data.email}, ${data.instagram}, ${data.notes}, ${data.status})
    `);
    console.log('✅ ÉXITO:', res);
    process.exit(0);
} catch (e) {
    console.error('❌ ERROR CRUDO:', e);
    process.exit(1);
}
