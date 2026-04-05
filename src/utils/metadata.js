import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

/**
 * Shared utility to load artwork metadata from the central CSV library.
 * Handles different delimiters and UTF-8 BOM automatically.
 */
export function loadArtworkMetadata() {
    const bibliotecaPath = path.join(process.cwd(), 'biblioteca', 'obras.csv');
    const metadataMap = new Map();

    if (fs.existsSync(bibliotecaPath)) {
        try {
            const csvContent = fs.readFileSync(bibliotecaPath, 'utf8').replace(/^\uFEFF/, '');
            const records = parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                delimiter: [';', ',']
            });

            records.forEach(record => {
                const filename = record.filename?.trim();
                if (filename) {
                    metadataMap.set(filename, {
                        ...record,
                        // Pre-process some common fields for easier access
                        title: record.title?.trim(),
                        serie_id: record.serie_id?.trim(),
                        camera: record.camera?.trim(),
                        lens: record.lens?.trim(),
                        paper: record.paper?.trim(),
                        dimensions: record.dimensions?.trim(),
                        date: record.date?.trim(),
                        description: record.description?.trim(),
                        // Size-based pricing
                        size_small: record.size_small?.trim() || '',
                        precio_small: record.precio_small?.trim() || '',
                        size_medium: record.size_medium?.trim() || '',
                        precio_medium: record.precio_medium?.trim() || '',
                        size_large: record.size_large?.trim() || '',
                        precio_large: record.precio_large?.trim() || '',
                    });
                }
            });
        } catch (err) {
            console.error("Error loading shared metadata library:", err);
        }
    }

    return metadataMap;
}
