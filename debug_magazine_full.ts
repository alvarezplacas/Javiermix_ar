import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    console.log('Fetching all magazine fields...');
    const [rows] = await connection.execute('SELECT * FROM magazine');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}

run().catch(console.error);
