import { db, artworks, collectors, certificates } from './frontend/conexion/db.js';
import crypto from 'crypto';

async function seed() {
    console.log("Seeding demo certificate...");
    
    try {
        // 1. Crear Obra de Prueba (si no existe)
        const insertArt = await db.insert(artworks).values({
            title: "Demo: Vórtice de Sombra",
            serie_id: "DEMO",
            filename: "demo.jpg",
            dimensions: "60x90",
            paper: "Fine Art Rag"
        });
        const artId = Number((insertArt as any)[0].insertId);
        console.log("Art ID:", artId);

        // 2. Crear Coleccionista de Prueba
        const insertCol = await db.insert(collectors).values({
            name: "Luciano Valenzuela (Prueba)",
            email: "luciano@ejemplo.com",
            phone: "+54 11 1234 5678",
            country: "Argentina"
        });
        const colId = Number((insertCol as any)[0].insertId);
        console.log("Col ID:", colId);

        // 3. Crear Certificado
        const certUuid = crypto.randomUUID();
        await db.insert(certificates).values({
            uuid: certUuid,
            artwork_id: artId,
            collector_id: colId,
            sale_price: "1500.00",
            dimensions: "60x90",
            edition_number: "1/10",
            is_verified: 1
        });
        
        console.log("Certificado de prueba creado con UUID:", certUuid);
        process.exit(0);
    } catch (e) {
        console.error("Error seeding:", e);
        process.exit(1);
    }
}

seed();
