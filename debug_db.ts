import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

try {
    const columns = await db.execute(sql`DESCRIBE collectors`);
    console.log('--- COLUMNAS EN TABLA collectors ---');
    console.log(columns[0]);
    process.exit(0);
} catch (e) {
    console.error('ERROR AL DESCRIBIR TABLA:', e);
    process.exit(1);
}
