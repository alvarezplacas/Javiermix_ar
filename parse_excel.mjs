import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const excelPath = path.resolve('biblioteca/Placas.xlsx');
const imagesBaseDir = path.resolve('public/images/catalog/Placas');
const outputJsonPath = path.resolve('src/data/placas.json');

const workbook = xlsx.readFile(excelPath);
const excelDataFaplac = xlsx.utils.sheet_to_json(workbook.Sheets['FAPLAC'] || workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
const excelDataEgger = workbook.Sheets['EGGER'] ? xlsx.utils.sheet_to_json(workbook.Sheets['EGGER'], { defval: "" }) : [];

const faplacMapByCode = new Map();
const eggerMapByCode = new Map();
let logs = [];

excelDataFaplac.forEach(row => {
    let codigo = String(row.CODIGO || "").trim();
    if (codigo) {
        let padCode = codigo.padStart(3, '0');
        if (!faplacMapByCode.has(padCode)) {
            faplacMapByCode.set(padCode, []);
        }
        faplacMapByCode.get(padCode).push({
            marca: String(row.MARCA || "Faplac").trim(),
            nombre: String(row.NOMBRE || "").trim(),
            linea: String(row.LINEA || "").trim(),
            textura: String(row.TEXTURA || "").trim(),
            color: String(row.COLOR || "").trim(),
            medida: String(row.MEDIDA || "2.75 x 1.83 mts").trim(),
            calidad: String(row.CALIDAD || "").trim()
        });
    }
});

excelDataEgger.forEach(row => {
    let codigo = String(row.CODIGO || "").trim().toUpperCase();
    if (codigo) {
        if (!eggerMapByCode.has(codigo)) {
            eggerMapByCode.set(codigo, []);
        }
        eggerMapByCode.get(codigo).push({
            marca: String(row.MARCA || "Egger").trim(),
            nombre: String(row.NOMBRE || "").trim(),
            grupo: String(row.GRUPO || "").trim(),
            medida: String(row.MEDIDA || "2.80 x 2.07 mts").trim(),
            color: String(row.COLOR || "").trim(),
            acabado: String(row.ACABADO || "Standard").trim()
        });
    }
});

function walkDir(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const allImageFiles = walkDir(imagesBaseDir);
const finalPlacasList = [];
let idCounter = 1;

let matchedCount = 0;
let discardedCount = 0;

allImageFiles.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|webp|avif)$/i)) return;

    let publicPath = '/images/catalog/Placas/' + path.relative(imagesBaseDir, file).replace(/\\/g, '/');
    let folderParts = path.relative(imagesBaseDir, file).split(path.sep);
    let marcaFolder = folderParts[0].trim();
    let lineaFolder = folderParts.length > 2 ? folderParts[1].trim() : "General";

    if (lineaFolder.toLowerCase().includes('webp') || lineaFolder.toLowerCase().includes('avif') || lineaFolder.toLowerCase().includes('completo')) {
        lineaFolder = "General";
    }

    let filename = path.basename(file);
    let originalNameRaw = path.parse(filename).name;

    let placaEntry = {
        id: idCounter.toString(),
        marca: marcaFolder,
        linea: lineaFolder,
        nombre: originalNameRaw.replace(/-/g, ' '),
        codigo: "",
        imagen: publicPath,
        tags: [marcaFolder],
        acabado: "Consultar",
        medida: "2.75 x 1.83 mts",
        color: "Consultar",
        tono: "Neutro"
    };

    let isMatch = false;

    if (marcaFolder.toUpperCase() === 'FAPLAC' || publicPath.includes('Faplac/')) {
        placaEntry.marca = "Faplac";
        const match = filename.match(/AR-(\d{3})/i) || filename.match(/^(\d{3})/i);
        if (match) {
            const codeStr = match[1];
            if (faplacMapByCode.has(codeStr)) {
                const matchesList = faplacMapByCode.get(codeStr);
                let bestMatch = matchesList[0];
                const lowerFilename = filename.toLowerCase();
                if (matchesList.length > 1) {
                    if (lowerFilename.includes('hil')) bestMatch = matchesList.find(m => m.linea.toLowerCase().includes('hilado')) || bestMatch;
                    if (lowerFilename.includes('nat')) bestMatch = matchesList.find(m => m.linea.toLowerCase().includes('nat')) || bestMatch;
                }
                placaEntry.codigo = codeStr;
                placaEntry.nombre = bestMatch.nombre;
                placaEntry.linea = bestMatch.linea;
                placaEntry.categoria = inferirCategoria(bestMatch.linea, bestMatch.nombre);
                placaEntry.acabado = bestMatch.textura || bestMatch.calidad || "Consultar";
                placaEntry.medida = bestMatch.medida || "2.75 x 1.83 mts";
                placaEntry.color = inferirColor(bestMatch.color, bestMatch.nombre);
                placaEntry.tono = getTono(placaEntry.color);

                placaEntry.tags = ["Faplac", placaEntry.linea, placaEntry.categoria, placaEntry.color, placaEntry.tono].filter(Boolean);
                isMatch = true;
            }
        }
    } else if (marcaFolder.toUpperCase() === 'EGGER' || publicPath.includes('Egger/')) {
        placaEntry.marca = "Egger";
        const match = filename.match(/^([A-Za-z]\d{3,4})\s|([A-Za-z]\d{3,4})/i);
        if (match) {
            const codeStr = (match[1] || match[0]).toUpperCase().trim();
            if (eggerMapByCode.has(codeStr)) {
                let bestMatch = eggerMapByCode.get(codeStr)[0];
                placaEntry.codigo = codeStr;
                placaEntry.nombre = bestMatch.nombre;
                placaEntry.linea = bestMatch.grupo ? `Grupo ${bestMatch.grupo}` : lineaFolder;
                placaEntry.categoria = inferirCategoria(placaEntry.linea, bestMatch.nombre);
                placaEntry.medida = bestMatch.medida || "2.80 x 2.07 mts";
                placaEntry.color = inferirColor(bestMatch.color, bestMatch.nombre);
                placaEntry.acabado = bestMatch.acabado || "Standard";
                placaEntry.tono = getTono(placaEntry.color);

                placaEntry.tags = ["Egger", placaEntry.linea, codeStr, placaEntry.categoria, placaEntry.color, placaEntry.tono].filter(Boolean);
                isMatch = true;
            }
        }
    }

    if (isMatch) {
        finalPlacasList.push(placaEntry);
        idCounter++;
        matchedCount++;
    } else {
        discardedCount++;
    }
});

function inferirCategoria(linea, nombre) {
    let l = (linea || "").toLowerCase();
    let n = (nombre || "").toLowerCase();

    if (n.includes('marmol') || n.includes('mármol') || n.includes('piedra') || n.includes('concreto') || n.includes('cemento') || l.includes('urban')) return "Piedra";
    if (n.includes('lino') || n.includes('hilado') || n.includes('seda') || l.includes('hilado') || l.includes('lino')) return "Textil";
    if (n.includes('roble') || n.includes('nogal') || n.includes('haya') || n.includes('madera') || n.includes('cedro') || n.includes('wengue') || n.includes('báltico') || n.includes('baltico') || l.includes('madera') || l.includes('nórdica') || l.includes('natur') || l.includes('étnica')) return "Madera";

    // Si no es ninguno de los anteriores y la linea es Lisos o no tiene patron de veta
    if (l.includes('lisos') || l.includes('colores') || l.includes('grupo 1')) return "Liso";

    return "Madera"; // Default para melaminas
}

function inferirColor(colorExcel, nombre) {
    if (colorExcel && colorExcel !== "Consultar" && colorExcel.trim() !== "") return colorExcel;

    let n = nombre.toLowerCase();

    // Diccionario de detección inteligente
    if (n.includes('blanco') || n.includes('tundra') || n.includes('nieve')) return "Blanco";
    if (n.includes('negro') || n.includes('carbón') || n.includes('ebano')) return "Negro";
    if (n.includes('gris') || n.includes('humo') || n.includes('ceniza') || n.includes('antracita') || n.includes('bruma')) return "Gris";
    if (n.includes('roble') || n.includes('nogal') || n.includes('haya') || n.includes('madera') || n.includes('cedro') || n.includes('wengue') || n.includes('baltico') || n.includes('báltico') || n.includes('carvalho')) return "Marrón (Madera)";
    if (n.includes('arena') || n.includes('beige') || n.includes('crema') || n.includes('linosa') || n.includes('seda')) return "Beige / Crema";
    if (n.includes('azul') || n.includes('oceano') || n.includes('marino')) return "Azul";
    if (n.includes('verde') || n.includes('musgo') || n.includes('bosque')) return "Verde";
    if (n.includes('rojo') || n.includes('terracota') || n.includes('amaranto')) return "Rojo";
    if (n.includes('marmol') || n.includes('piedra') || n.includes('concreto') || n.includes('cemento') || n.includes('urban')) return "Piedra / Mármol";

    return "Marrón (Madera)"; // Por defecto para melaminas si no se detecta nada obvio
}

function getTono(colorStr) {
    if (!colorStr || colorStr === "Consultar") return "Neutro";
    let c = colorStr.toLowerCase();
    const calidos = ['madera', 'roble', 'nogal', 'castaño', 'amarillo', 'rojo', 'naranja', 'beige', 'arena', 'marrón', 'marron', 'habano', 'cedro', 'caju'];
    const frios = ['gris', 'azul', 'negro', 'blanco', 'ceniza', 'litio', 'aluminio', 'plata', 'grafito', 'antracita'];
    if (calidos.some(w => c.includes(w))) return "Cálido";
    if (frios.some(w => c.includes(w))) return "Frío";
    return "Neutro";
}

finalPlacasList.sort((a, b) => {
    if (a.marca < b.marca) return -1;
    if (a.marca > b.marca) return 1;
    if (a.nombre < b.nombre) return -1;
    if (a.nombre > b.nombre) return 1;
    return 0;
});

fs.writeFileSync(outputJsonPath, JSON.stringify(finalPlacasList, null, 2), 'utf8');

console.log(`Filtro estricto aplicado. Registros en JSON: ${matchedCount}. Imágenes descartadas (sin match en Excel): ${discardedCount}.`);
