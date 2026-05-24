import { getSerieSettings } from './src/conexion/directus.js';

async function run() {
    // ID de la carpeta "Lineas de paso" (conocido de pasos anteriores)
    const folderId = '0a589169-e948-448f-b009-3f07f9327d50';
    console.log(`Buscando settings para la carpeta: ${folderId}`);
    try {
        const settings = await getSerieSettings(folderId);
        console.log("Resultado de settings:", settings);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
