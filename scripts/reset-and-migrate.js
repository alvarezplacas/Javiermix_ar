// reset-and-migrate.js
// Vacía la tabla artworks y la re-puebla desde el CSV limpio
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv/sync';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        database: process.env.DB_NAME || 'javiermix_obras',
    });

    // Limpiar tabla
    await conn.execute('TRUNCATE TABLE artworks');
    console.log('🗑  Tabla artworks limpiada.');

    // Leer CSV
    const csvPath = path.join(process.cwd(), 'biblioteca', 'obras.csv');
    const raw = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
    let records;
    try {
        records = parse(raw, { columns: true, skip_empty_lines: true, delimiter: ';', relax_column_count: true });
    } catch {
        records = parse(raw, { columns: true, skip_empty_lines: true, delimiter: ',', relax_column_count: true });
    }

    console.log(`📋 ${records.length} filas en el CSV. Migrando...`);

    let migrated = 0, errors = 0;
    for (const r of records) {
        const filename = r.filename?.trim();
        const title = r.title?.trim();
        const serie_id = r.serie_id?.trim();
        if (!filename || !title || !serie_id) { errors++; continue; }
        try {
            await conn.execute(
                `INSERT INTO artworks (filename, serie_id, title, camera, lens, paper, dimensions, date, description,
                 size_small, precio_small, size_medium, precio_medium, size_large, precio_large)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    filename, serie_id, title,
                    r.camera?.trim() || null, r.lens?.trim() || null, r.paper?.trim() || null,
                    r.dimensions?.trim() || null, r.date?.trim() || null, r.description?.trim() || null,
                    r.size_small?.trim() || null, r.precio_small ? parseFloat(r.precio_small) : null,
                    r.size_medium?.trim() || null, r.precio_medium ? parseFloat(r.precio_medium) : null,
                    r.size_large?.trim() || null, r.precio_large ? parseFloat(r.precio_large) : null,
                ]
            );
            console.log(`  ✓ ${title}`);
            migrated++;
        } catch (e) {
            console.error(`  ✗ ${title}: ${e.message}`);
            errors++;
        }
    }

    await conn.end();
    console.log(`\n✅ Migración completa: ${migrated} obras insertadas, ${errors} errores.`);
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
