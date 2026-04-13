import { db, artworks, collectors, certificates } from '@conexion/db';
import { randomUUID } from 'node:crypto';

export const prerender = false;

export async function GET() {
    try {
        const timestamp = Date.now();
        // 1. Crear Obra de Prueba
        const insertArt = await db.insert(artworks).values({
            title: `Demo: Vórtice de Sombra #${timestamp}`,
            serie_id: "DEMO",
            filename: `demo-${timestamp}.jpg`,
            dimensions: "60x90",
            paper: "Fine Art Rag"
        });
        
        let artId: number;
        if (Array.isArray(insertArt) && insertArt[0] && (insertArt[0] as any).insertId) {
            artId = Number((insertArt[0] as any).insertId);
        } else {
            // Fallback: buscar la última insertada si falló el retorno
            const lastArt = await db.select().from(artworks).orderBy(artworks.id).limit(1);
            artId = lastArt[0].id;
        }

        // 2. Crear Coleccionista de Prueba
        const insertCol = await db.insert(collectors).values({
            name: "Luciano Valenzuela (Prueba)",
            email: `demo-${timestamp}@ejemplo.com`,
            phone: "+54 11 1234 5678",
            country: "Argentina"
        });
        
        let colId: number;
        if (Array.isArray(insertCol) && insertCol[0] && (insertCol[0] as any).insertId) {
            colId = Number((insertCol[0] as any).insertId);
        } else {
            const lastCol = await db.select().from(collectors).orderBy(collectors.id).limit(1);
            colId = lastCol[0].id;
        }

        // 3. Crear Certificado
        const certUuid = randomUUID();
        await db.insert(certificates).values({
            uuid: certUuid,
            artwork_id: artId,
            collector_id: colId,
            sale_price: "1500.00",
            dimensions: "60x90",
            edition_number: "1/10",
            is_verified: 1
        });

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Certificado de prueba creado con éxito",
            uuid: certUuid 
        }), { status: 200 });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
