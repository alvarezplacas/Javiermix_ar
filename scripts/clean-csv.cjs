/**
 * clean-csv.cjs
 * 
 * 1. Escanea todas las imágenes reales en public/img/Series/
 * 2. Lee obras.csv
 * 3. Filtra solo las filas cuyo archivo existe en disco
 * 4. Sobreescribe obras.csv con las que coinciden
 * 5. Imprime un reporte de qué se mantuvo y qué se eliminó
 */

const fs = require('fs');
const path = require('path');

// ── 1. Leer todos los archivos físicos ─────────────────────────────────────
const seriesRoot = path.join(__dirname, '..', 'public', 'img', 'Series');

const physicalFiles = new Set(); // "rostros_de_metal/JMX_9177.avif"

function scanDir(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            scanDir(path.join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
        } else {
            // Guardamos: serie/filename — todo en minúsculas para comparación insensible
            const key = (prefix + '/' + entry.name).toLowerCase();
            physicalFiles.add(key);

            // También guardamos solo el filename en minúsculas para coincidencia rápida
            physicalFiles.add(entry.name.toLowerCase());
        }
    }
}

scanDir(seriesRoot, '');
console.log(`\n📂 Imágenes físicas encontradas: ${physicalFiles.size / 2} archivos únicos`);

// ── 2. Leer CSV ──────────────────────────────────────────────────────────────
const csvPath = path.join(__dirname, '..', 'biblioteca', 'obras.csv');
const raw = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Parsear CSV con soporte de campos entre comillas (multilinea)
function parseCsvLines(text) {
    const rows = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
            current += ch;
        } else if (ch === '\n' && !inQuotes) {
            rows.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) rows.push(current);
    return rows;
}

const allLines = parseCsvLines(lines);
const header = allLines[0];
const dataLines = allLines.slice(1).filter(l => l.trim());

// ── 3. Filtrar ────────────────────────────────────────────────────────────────
const kept = [];
const removed = [];

for (const line of dataLines) {
    // Extraer primer campo (filename) — antes del primer ;
    const firstField = line.split(';')[0].trim().replace(/^"/, '').replace(/"$/, '');
    const exists = physicalFiles.has(firstField.toLowerCase());

    if (exists) {
        kept.push(line);
    } else {
        removed.push(firstField);
    }
}

// ── 4. Reporte ────────────────────────────────────────────────────────────────
console.log(`\n✅ Obras con imagen encontrada:  ${kept.length}`);
console.log(`❌ Obras sin imagen (eliminadas): ${removed.length}`);
if (removed.length > 0) {
    console.log('\nEliminadas:');
    removed.forEach(f => console.log(`  - ${f}`));
}

// ── 5. Guardar CSV limpio ─────────────────────────────────────────────────────
const cleanCsv = [header, ...kept].join('\r\n') + '\r\n';
fs.writeFileSync(csvPath, cleanCsv, 'utf8');
console.log(`\n💾 obras.csv actualizado con ${kept.length} filas válidas.`);
