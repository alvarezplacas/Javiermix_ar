
import { db } from './src/db/client';
import { sql } from 'drizzle-orm';

async function fixMagazineTable() {
    try {
        console.log('🔍 Validando tabla "magazine"...');

        // 1. Crear la tabla si no existe
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS magazine (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(255) NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                content_html MEDIUMTEXT NOT NULL,
                featured_image VARCHAR(255),
                video_url VARCHAR(255),
                media_json TEXT,
                tags VARCHAR(255),
                rating_total INT DEFAULT 0,
                rating_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla "magazine" verificada/creada.');

        // 2. Verificar columnas faltantes (por si la tabla ya existía pero está incompleta)
        const columnsToFix = [
            { name: 'rating_total', type: 'INT DEFAULT 0' },
            { name: 'rating_count', type: 'INT DEFAULT 0' },
            { name: 'media_json', type: 'TEXT' },
            { name: 'video_url', type: 'VARCHAR(255)' },
            { name: 'tags', type: 'VARCHAR(255)' }
        ];

        for (const col of columnsToFix) {
            try {
                await db.execute(sql.raw(`ALTER TABLE magazine ADD COLUMN ${col.name} ${col.type}`));
                console.log(`+ Columna "${col.name}" añadida.`);
            } catch (e: any) {
                if (e.message.includes('Duplicate column name')) {
                    // Ignorar si ya existe
                } else {
                    console.log(`ℹ️ Columna "${col.name}" ya existe o no pudo añadirse.`);
                }
            }
        }

        console.log('🚀 Base de datos sincronizada con el código.');
    } catch (e) {
        console.error('❌ Error al reparar la base de datos:', e);
    }
}

fixMagazineTable().then(() => process.exit(0));
