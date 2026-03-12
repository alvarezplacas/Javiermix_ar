import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

try {
    console.log('--- AÑADIENDO COLUMNAS FALTANTES ---');

    await db.execute(sql`ALTER TABLE collectors ADD COLUMN instagram VARCHAR(100) AFTER country`);
    console.log('✅ Columna instagram añadida.');

    await db.execute(sql`ALTER TABLE collectors ADD COLUMN notes TEXT AFTER instagram`);
    console.log('✅ Columna notes añadida.');

    await db.execute(sql`ALTER TABLE collectors ADD COLUMN status VARCHAR(50) DEFAULT "lead" AFTER notes`);
    console.log('✅ Columna status añadida.');

    console.log('--- REPARACIÓN COMPLETADA ---');
    process.exit(0);
} catch (e) {
    console.error('ERROR EN REPARACIÓN:', e);
    process.exit(1);
}
