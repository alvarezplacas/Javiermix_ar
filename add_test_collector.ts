import { db } from './src/db/client';
import { collectors } from './src/db/schema';
import 'dotenv/config';

async function addTestCollector() {
    try {
        await db.insert(collectors).values({
            name: 'Coleccionista de Prueba',
            email: 'prueba@javiermix.com',
            phone: '+54 11 1234-5678',
            country: 'Argentina'
        });
        console.log('✅ Cliente de prueba agregado con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al agregar cliente:', error);
        process.exit(1);
    }
}

addTestCollector();
