import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionConfig = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL 
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    };

const poolConnection = mysql.createPool(connectionConfig as any);

export const db = drizzle(poolConnection, { schema, mode: 'default' });
