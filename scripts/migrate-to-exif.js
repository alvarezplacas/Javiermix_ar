import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exiftool } from 'exiftool-vendored';
import { loadArtworkMetadata } from '../src_v2026/utils/metadata.js'; // Ajusta la ruta si es necesario

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log("Iniciando migración masiva de metadata hacia EXIF/IPTC...");
    
    // 1. Cargar el mapa desde tu archivo estático
    const metadataMap = loadArtworkMetadata();
    console.log(`Se encontraron ${metadataMap.size} registros en metadata.js.`);

    // 2. Rutear las carpetas reales
    const seriesPath = path.join(__dirname, '..', 'public', 'img', 'Series');
    if (!fs.existsSync(seriesPath)) {
        console.error("No se encontró public/img/Series");
        return;
    }

    const folders = fs.readdirSync(seriesPath).filter(f => fs.statSync(path.join(seriesPath, f)).isDirectory());
    
    let processedFiles = 0;
    let failedFiles = 0;

    // 3. Iterar por cada carpeta de la Serie y buscar los archivos físicos
    for (const folder of folders) {
        console.log(`\nEscaneando serie: ${folder}...`);
        const folderPath = path.join(seriesPath, folder);
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.avif') || f.endsWith('.jpg') || f.endsWith('.webp'));

        for (const file of files) {
            // Buscamos si existe metadata para este archivo
            const isMain = file.toLowerCase().startsWith('jmx_') || file.toLowerCase().startsWith('jmix_');
            if (!isMain) continue; // Por ahora, la información completa sólo estaba en los "mainUrl"

            const data = metadataMap.get(file);
            if (!data) {
                console.log(`[ OMITIDO ] ${file} no tiene metadata mapeada. Se aplicará título base.`);
                await exiftool.write(path.join(folderPath, file), {
                    Title: file.split('.')[0]
                });
                continue;
            }

            console.log(`[ GRABANDO ] ${file} -> "${data.title}"...`);
            const filePath = path.join(folderPath, file);

            // Parsing the f/number (e.g., "f/2.8" -> 2.8)
            let fNumber = undefined;
            if (data.fiche?.aperture) {
                const match = data.fiche.aperture.match(/[\d.]+/);
                if (match) fNumber = parseFloat(match[0]);
            }

            // Mapeando las tags recomendadas
            const tags = {
                Title: data.title,
                ObjectName: data.title, // Backup en IPTC
                Description: data.fiche?.story || '',
                CaptionAbstract: data.fiche?.story || '', // Backup en IPTC
                Model: data.fiche?.camera || '',
                LensModel: data.fiche?.lens || '',
                ISO: data.fiche?.iso ? parseInt(data.fiche.iso, 10) : undefined,
                ExposureTime: data.fiche?.shutterspeed || undefined,
                FNumber: fNumber,
                // Agregando año y location en tags genéricos IPTC
                City: data.fiche?.location || undefined,
                DateCreated: data.fiche?.year ? `${data.fiche.year}-01-01` : undefined
            };

            // Filtrar tags undefined
            const cleanTags = Object.fromEntries(Object.entries(tags).filter(([_, v]) => v != null && v !== ''));

            try {
                await exiftool.write(filePath, cleanTags);
                console.log(`  ✓ Éxito`);
                processedFiles++;
            } catch (err) {
                console.error(`  X Fallo al escribir ${file}:`, err.message);
                failedFiles++;
            }
        }
    }

    console.log(`\n--- RESUMEN ---`);
    console.log(`Archivos con EXIF grabados: ${processedFiles}`);
    console.log(`Archivos con fallo: ${failedFiles}`);
    
    // Shutdown exiftool properly
    await exiftool.end();
}

run().catch(err => {
    console.error("Error crítico:", err);
    exiftool.end();
});
