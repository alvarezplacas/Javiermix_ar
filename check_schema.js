import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306
    });

    try {
        const [tables] = await connection.query("SHOW TABLES");
        console.log("Tables in database:", JSON.stringify(tables));

        const required = ['artworks', 'certificates', 'collectors', 'orders'];
        for (const table of required) {
            try {
                const [cols] = await connection.query(`DESCRIBE ${table}`);
                console.log(`Schema for ${table}:`, JSON.stringify(cols));
            } catch (e) {
                console.error(`Table ${table} is MISSING or inaccessible`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error("Connection failed:", e);
        process.exit(1);
    }
}

check();
