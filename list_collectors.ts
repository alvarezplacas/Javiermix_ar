import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

try {
    const res = await db.execute(sql`SELECT id, name, email FROM collectors`);
    console.log('--- LISTADO DE COLECCIONISTAS ---');
    console.log(JSON.stringify(res[0], null, 2));
    process.exit(0);
} catch (e) {
    console.error('ERROR:', e);
    process.exit(1);
}
