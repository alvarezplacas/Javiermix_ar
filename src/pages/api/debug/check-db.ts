import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

export const prerender = false;

export async function GET() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT) || 3306
        });

        const [tables] = await connection.query("SHOW TABLES");
        const results: any = { tables };

        const checkTables = ['artworks', 'certificates', 'collectors', 'orders'];
        for (const t of checkTables) {
            try {
                const [cols] = await connection.query(`DESCRIBE ${t}`);
                results[t] = cols;
            } catch (e: any) {
                results[t] = `ERROR: ${e.message}`;
            }
        }

        return new Response(JSON.stringify(results, null, 2), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
