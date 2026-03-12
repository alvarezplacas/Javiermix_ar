// GET /api/admin/download-csv
// Sirve el archivo obras.csv actualizado para descarga
export const prerender = false;

import fs from 'node:fs';
import path from 'node:path';

export async function GET() {
    const csvPath = path.join(process.cwd(), 'biblioteca', 'obras.csv');

    if (!fs.existsSync(csvPath)) {
        return new Response('CSV no encontrado', { status: 404 });
    }

    const content = fs.readFileSync(csvPath);
    const today = new Date().toISOString().slice(0, 10); // 2026-03-01

    return new Response(content, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="obras_${today}.csv"`,
        }
    });
}
