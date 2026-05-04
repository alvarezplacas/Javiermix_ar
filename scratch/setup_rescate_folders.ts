import { DirectusManager } from '../src/conexion/directus';
import { readFolders, createFolder } from '@directus/sdk';

async function setupFolders() {
    try {
        const client = await DirectusManager.getClient();
        
        console.log("🔍 Buscando carpeta 'Rescate de Fotos'...");
        const folders = await client.request(readFolders({
            filter: { name: { _eq: 'Rescate de Fotos' } }
        }));

        if (folders.length > 0) {
            console.log("✅ La carpeta ya existe con ID:", folders[0].id);
            return;
        }

        console.log("🚀 Creando carpeta 'Rescate de Fotos'...");
        const newFolder = await client.request(createFolder({
            name: 'Rescate de Fotos'
        }));

        console.log("✅ Carpeta creada con ID:", newFolder.id);

        // Opcional: Crear subcarpetas de ejemplo
        console.log("📁 Creando subcarpetas de ejemplo...");
        await client.request(createFolder({
            name: 'Serie 1920-1940',
            parent: newFolder.id
        }));
        await client.request(createFolder({
            name: 'Retratos Familiares',
            parent: newFolder.id
        }));

        console.log("✨ Estructura completada.");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

setupFolders();
