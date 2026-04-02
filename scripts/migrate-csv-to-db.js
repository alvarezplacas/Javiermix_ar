import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv/sync';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
    const csvPath = path.join(process.cwd(), 'biblioteca', 'obras.csv');

    if (!fs.existsSync(csvPath)) {
        console.error("CSV not found at", csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');

    // Intentar con ; primero, luego con ,
    let records;
    try {
        records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            delimiter: ';',
            relax_column_count: true,
        });
        if (records.length === 0 || Object.keys(records[0]).length <= 1) {
            records = parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                delimiter: ',',
                relax_column_count: true,
            });
        }
    } catch {
        records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            delimiter: ',',
            relax_column_count: true,
        });
    }

    console.log(`Found ${records.length} records in CSV. Migrating...`);
    if (records.length > 0) {
        console.log("Columns detected:", Object.keys(records[0]).join(', '));
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        database: process.env.DB_NAME || 'javiermix_obras',
    });

    let migrated = 0;
    let errors = 0;

    for (const record of records) {
        const filename = record.filename?.trim();
        const title = record.title?.trim();
        const serie_id = record.serie_id?.trim();

        if (!filename || !title || !serie_id) {
            console.warn(`Skipping incomplete record:`, record);
            continue;
        }

        try {
            await connection.execute(
                `INSERT INTO artworks 
                    (filename, serie_id, title, camera, lens, paper, dimensions, date, description,
                     size_small, precio_small, size_medium, precio_medium, size_large, precio_large)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE title=VALUES(title)`,
                [
                    filename,
                    serie_id,
                    title,
                    record.camera?.trim() || null,
                    record.lens?.trim() || null,
                    record.paper?.trim() || null,
                    record.dimensions?.trim() || null,
                    record.date?.trim() || null,
                    record.description?.trim() || null,
                    record.size_small?.trim() || null,
                    record.precio_small ? parseFloat(record.precio_small) : null,
                    record.size_medium?.trim() || null,
                    record.precio_medium ? parseFloat(record.precio_medium) : null,
                    record.size_large?.trim() || null,
                    record.precio_large ? parseFloat(record.precio_large) : null,
                ]
            );
            console.log(`✓ ${title}`);
            migrated++;
        } catch (err) {
            console.error(`✗ Error migrating "${title}":`, err.message);
            errors++;
        }
    }

    await connection.end();
    console.log(`\nMigration complete: ${migrated} migrated, ${errors} errors.`);
    process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
