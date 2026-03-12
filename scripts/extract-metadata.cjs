const { exiftool } = require('exiftool-vendored');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Excel in Spanish/Europe often expects semicolon. We also add UTF-8 BOM.
const CSV_OPTIONS = {
    header: true,
    delimiter: ';',
    quoted: true
};

const SERIES_ROOT = path.join(process.cwd(), 'public', 'img', 'Series');
const OBRAS_CSV = path.join(process.cwd(), 'biblioteca', 'obras.csv');

async function extractMetadata() {
    console.log("Starting metadata extraction v4 (Title Improvements)...");

    // 1. Load existing data
    let existingData = [];
    if (fs.existsSync(OBRAS_CSV)) {
        const content = fs.readFileSync(OBRAS_CSV, 'utf-8').replace(/^\uFEFF/, '');
        existingData = parse(content, {
            columns: true,
            skip_empty_lines: true,
            delimiter: [';', ','] // Handle both for migration
        });
    }

    const dataMap = new Map(existingData.map(item => [item.filename, item]));

    // 2. Scan folders
    const seriesFolders = fs.readdirSync(SERIES_ROOT).filter(f => fs.statSync(path.join(SERIES_ROOT, f)).isDirectory());

    for (const folder of seriesFolders) {
        const folderPath = path.join(SERIES_ROOT, folder);
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.avif') || f.endsWith('.jpg') || f.endsWith('.png'));

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            let meta;
            try {
                meta = await exiftool.read(filePath);
            } catch (err) {
                console.error(`Error reading ${file}:`, err);
                continue;
            }

            const existing = dataMap.get(file) || {};
            const baseFilename = file.split('.')[0];
            const prettifiedName = baseFilename.replace(/_/g, ' ').replace(/-/g, ' ').trim();

            // 1. Title logic: find artistic title or prettify filename
            let foundTitle = null;
            const titleTags = ['Title', 'Headline', 'ObjectName', 'ImageDescription'];
            for (const tag of titleTags) {
                if (meta[tag] && typeof meta[tag] === 'string' && meta[tag].length > 3) {
                    foundTitle = meta[tag].trim();
                    break;
                }
            }

            // Priority: Existing (if it's not just the filename) > Meta Title > Prettified Name
            let finalTitle = existing.title;

            // If existing is null, same as filename, or just "Unknown", update it
            if (!finalTitle || finalTitle === file || finalTitle === baseFilename || finalTitle.toLowerCase() === 'unknown') {
                finalTitle = foundTitle || prettifiedName;
            }

            // 2. Date logic
            let foundDate = null;
            const dateTags = ['DateTimeOriginal', 'CreateDate', 'DateCreated', 'MetadataDate', 'ModifyDate', 'FileModifyDate', 'FileCreateDate'];
            for (const tag of dateTags) {
                const val = meta[tag];
                if (val) {
                    let d = (typeof val.toDate === 'function') ? val.toDate() : new Date(val.rawValue || val);
                    if (d && !isNaN(d.getTime())) {
                        foundDate = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        break;
                    }
                }
            }

            // Technical details
            const camera = (meta.Model || meta.CreatorTool || existing.camera || 'Unknown').trim();
            const lens = (meta.LensID || meta.Lens || meta.LensModel || existing.lens || 'Unknown').trim();

            dataMap.set(file, {
                filename: file,
                serie_id: folder.toLowerCase(),
                title: finalTitle,
                camera: camera,
                lens: lens,
                paper: existing.paper || 'Fine Art Standard',
                dimensions: existing.dimensions || 'N/A',
                date: foundDate || existing.date || existing.year || new Date().getFullYear().toString(),
                description: existing.description || ''
            });
        }
    }

    // 3. Save to CSV with UTF-8 BOM for Excel
    const results = Array.from(dataMap.values());
    const output = stringify(results, CSV_OPTIONS);
    fs.writeFileSync(OBRAS_CSV, '\uFEFF' + output);

    console.log(`Metadata extraction complete. ${results.length} entries written to ${OBRAS_CSV}`);
    await exiftool.end();
}

extractMetadata().catch(err => {
    console.error("Extraction failed:", err);
    exiftool.end();
});
