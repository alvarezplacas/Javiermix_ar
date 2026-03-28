import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    console.log("Applying manual migration: adding order_id to certificates...");
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE, // javiermix_db based on .env
        port: Number(process.env.DB_PORT) || 3306
    });

    try {
        // 1. Verificar si la columna existe
        const [cols]: any = await connection.query("DESCRIBE certificates");
        const hasOrderId = cols.some((c: any) => c.Field === 'order_id');

        if (!hasOrderId) {
            console.log("Adding order_id column...");
            await connection.query("ALTER TABLE certificates ADD COLUMN order_id BIGINT UNSIGNED NULL AFTER collector_id");
            console.log("Column added successfully.");
        } else {
            console.log("Column order_id already exists.");
        }

        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
