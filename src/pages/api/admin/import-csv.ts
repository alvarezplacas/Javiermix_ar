// API Endpoint: POST /api/admin/import-csv
// Acepta un archivo CSV o Excel y lo importa a la tabla artworks
export const prerender = false;

import { parse } from 'csv/sync';
import mysql from 'mysql2/promise';

export async function POST({ request }: { request: Request }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || typeof file === 'string') {
            return new Response(JSON.stringify({ ok: false, error: 'No se recibió ningún archivo.' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        const filename = file.name.toLowerCase();
        const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls');
        const isCsv = filename.endsWith('.csv');

        if (!isCsv && !isExcel) {
            return new Response(JSON.stringify({ ok: false, error: 'Solo se aceptan archivos .csv o .xlsx' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        let records: Record<string, string>[] = [];
        const arrayBuffer = await file.arrayBuffer();

        if (isExcel) {
            try {
                const XLSX = await import('xlsx');
                const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                records = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, string>[];
            } catch (_e) {
                return new Response(JSON.stringify({
                    ok: false,
                    error: 'Para importar Excel instalá la dependencia: npm install xlsx'
                }), { status: 500, headers: { 'Content-Type': 'application/json' } });
            }
        } else {
            const text = Buffer.from(arrayBuffer).toString('utf8').replace(/^\uFEFF/, '');
            try {
                records = parse(text, { columns: true, skip_empty_lines: true, delimiter: ';', relax_column_count: true });
                if (records.length === 0 || Object.keys(records[0]).length <= 1) {
                    records = parse(text, { columns: true, skip_empty_lines: true, delimiter: ',', relax_column_count: true });
                }
            } catch (_e) {
                records = parse(text, { columns: true, skip_empty_lines: true, delimiter: ',', relax_column_count: true });
            }
        }

        if (records.length === 0) {
            return new Response(JSON.stringify({ ok: false, error: 'El archivo está vacío o no tiene el formato esperado.' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        const connection = await mysql.createConnection({
            host: import.meta.env.DB_HOST || 'localhost',
            port: parseInt(import.meta.env.DB_PORT || '3306'),
            user: import.meta.env.DB_USER || 'root',
            password: import.meta.env.DB_PASS || 'root',
            database: import.meta.env.DB_NAME || 'javiermix_obras',
        });

        let migrated = 0;
        let errors = 0;
        const errorDetails: string[] = [];

        for (const record of records) {
            const filename_val = (record.filename || record.Filename || '').toString().trim();
            const title_val = (record.title || record.Titulo || record.título || '').toString().trim();
            const serie_val = (record.serie_id || record.serie || record.Serie || '').toString().trim();

            if (!filename_val || !title_val || !serie_val) {
                errors++;
                errorDetails.push(`Fila incompleta: ${JSON.stringify(record)}`);
                continue;
            }

            try {
                await connection.execute(
                    `INSERT INTO artworks 
                        (filename, serie_id, title, camera, lens, paper, dimensions, date, description,
                         size_small, precio_small, size_medium, precio_medium, size_large, precio_large)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE 
                        title=VALUES(title), camera=VALUES(camera), lens=VALUES(lens),
                        paper=VALUES(paper), dimensions=VALUES(dimensions),
                        size_small=VALUES(size_small), precio_small=VALUES(precio_small),
                        size_medium=VALUES(size_medium), precio_medium=VALUES(precio_medium),
                        size_large=VALUES(size_large), precio_large=VALUES(precio_large)`,
                    [
                        filename_val, serie_val, title_val,
                        (record.camera || '').trim() || null,
                        (record.lens || '').trim() || null,
                        (record.paper || '').trim() || null,
                        (record.dimensions || '').trim() || null,
                        (record.date || '').trim() || null,
                        (record.description || '').trim() || null,
                        (record.size_small || '').trim() || null,
                        record.precio_small ? parseFloat(record.precio_small) : null,
                        (record.size_medium || '').trim() || null,
                        record.precio_medium ? parseFloat(record.precio_medium) : null,
                        (record.size_large || '').trim() || null,
                        record.precio_large ? parseFloat(record.precio_large) : null,
                    ]
                );
                migrated++;
            } catch (err: unknown) {
                errors++;
                errorDetails.push(`"${title_val}": ${(err as Error).message}`);
            }
        }

        await connection.end();

        return new Response(JSON.stringify({
            ok: true, migrated, errors,
            total: records.length,
            errorDetails: errorDetails.slice(0, 10),
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (err: unknown) {
        console.error('Import error:', err);
        return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}
