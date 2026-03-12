
import { db } from './src/db/client';
import { marketingStrategies } from './src/db/schema';

const initialStrategies = [
    {
        title: 'Dominio de Video Corto (Reels/TikTok)',
        category: 'social',
        priority: 'high',
        status: 'pending',
        description: 'Crear 3 videos semanales mostrando procesos de obra, montaje en sala y detalles de papel. Priorizar autenticidad sobre perfección.'
    },
    {
        title: 'Optimización SEO de Imágenes',
        category: 'seo',
        priority: 'high',
        status: 'in_progress',
        description: 'Renombrar todos los archivos de imagen con palabras clave y añadir Alt Text descriptivo para búsqueda orgánica en Google.'
    },
    {
        title: 'Networking y Alianzas Locales',
        category: 'local',
        priority: 'medium',
        status: 'pending',
        description: 'Contactar con estudios de interiorismo en Buenos Aires para proponer las obras como piezas centrales de proyectos.'
    },
    {
        title: 'Comunidad y Respuesta Activa',
        category: 'social',
        priority: 'high',
        status: 'active',
        description: 'Responder a todos los comentarios y mensajes en menos de 4 horas para fomentar el algoritmo de compromiso.'
    },
    {
        title: 'Programa de Referidos para Coleccionistas',
        category: 'editorial',
        priority: 'medium',
        status: 'pending',
        description: 'Ofrecer beneficios exclusivos a coleccionistas existentes que refieran nuevos compradores de obras.'
    },
    {
        title: 'Optimización para Motores de Respuesta (AI)',
        category: 'seo',
        priority: 'low',
        status: 'pending',
        description: 'Estructurar el contenido de la revista con preguntas frecuentes para aparecer en resúmenes de IA (Google AI Overviews).'
    }
];

async function seedMarketing() {
    try {
        console.log('Seeding initial marketing strategies...');
        for (const strategy of initialStrategies) {
            await db.insert(marketingStrategies).values(strategy);
        }
        console.log('Marketing strategies seeded successfully.');
    } catch (e) {
        console.error('Error seeding strategies:', e);
    }
}

seedMarketing().then(() => process.exit(0));
