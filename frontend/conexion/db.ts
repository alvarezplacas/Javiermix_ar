import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { mysqlTable, bigint, varchar, text, decimal, timestamp, int, mediumtext } from 'drizzle-orm/mysql-core';

dotenv.config();

// --- 1. SCHEMA DEFINITION ---

export const artworks = mysqlTable('artworks', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    serie_id: varchar('serie_id', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    camera: varchar('camera', { length: 100 }),
    lens: varchar('lens', { length: 100 }),
    paper: varchar('paper', { length: 100 }),
    dimensions: varchar('dimensions', { length: 100 }),
    date: varchar('date', { length: 100 }),
    description: text('description'),
    size_small: varchar('size_small', { length: 50 }),
    precio_small: decimal('precio_small', { precision: 10, scale: 2 }),
    size_medium: varchar('size_medium', { length: 50 }),
    precio_medium: decimal('precio_medium', { precision: 10, scale: 2 }),
    size_large: varchar('size_large', { length: 50 }),
    precio_large: decimal('precio_large', { precision: 10, scale: 2 }),
    stock: int('stock').default(1),
    is_limited_edition: int('is_limited_edition').default(0),
    edition_total: int('edition_total').default(0),
    certificate_included: int('certificate_included').default(1),
    frame_options: varchar('frame_options', { length: 255 }).default('none'),
    is_featured: int('is_featured').default(0),
    status: varchar('status', { length: 50 }).default('published'),
    likes: int('likes').default(0),
    created_at: timestamp('created_at').defaultNow(),
});

export const magazine = mysqlTable('magazine', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content_html: mediumtext('content_html').notNull(),
    featured_image: varchar('featured_image', { length: 255 }),
    video_url: varchar('video_url', { length: 255 }),
    media_json: text('media_json'),
    tags: varchar('tags', { length: 255 }),
    author: varchar('author', { length: 150 }).default('Javier Mix'),
    is_premium: int('is_premium').default(0),
    status: varchar('status', { length: 50 }).default('published'),
    seo_title: varchar('seo_title', { length: 255 }),
    seo_description: varchar('seo_description', { length: 255 }),
    rating_total: int('rating_total').default(0),
    rating_count: int('rating_count').default(0),
    created_at: timestamp('created_at').defaultNow(),
});

export const orders = mysqlTable('orders', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    order_number: varchar('order_number', { length: 50 }).unique().notNull(),
    collector_id: bigint('collector_id', { mode: 'number', unsigned: true }),
    collector_name: varchar('collector_name', { length: 255 }).notNull(),
    collector_email: varchar('collector_email', { length: 255 }).notNull(),
    collector_phone: varchar('collector_phone', { length: 50 }),
    shipping_address: text('shipping_address'),
    total_price: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    payment_method: varchar('payment_method', { length: 50 }).default('transferencia'),
    payment_status: varchar('payment_status', { length: 50 }).default('pending'),
    items_json: text('items_json').notNull(),
    notes: text('notes'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const certificates = mysqlTable('certificates', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    uuid: varchar('uuid', { length: 36 }).unique().notNull(),
    artwork_id: bigint('artwork_id', { mode: 'number', unsigned: true }).notNull(),
    collector_id: bigint('collector_id', { mode: 'number', unsigned: true }).notNull(),
    order_id: bigint('order_id', { mode: 'number', unsigned: true }),
    sale_date: timestamp('sale_date').defaultNow(),
    sale_price: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
    dimensions: varchar('dimensions', { length: 100 }).notNull(),
    edition_number: varchar('edition_number', { length: 20 }),
    is_verified: int('is_verified').default(1),
});

export const collectors = mysqlTable('collectors', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique(),
    phone: varchar('phone', { length: 50 }),
    country: varchar('country', { length: 100 }),
    instagram: varchar('instagram', { length: 100 }),
    notes: text('notes'),
    status: varchar('status', { length: 50 }).default('lead'),
    created_at: timestamp('created_at').defaultNow(),
});

export const directus_files = mysqlTable('directus_files', {
    id: varchar('id', { length: 36 }).primaryKey(),
    storage: varchar('storage', { length: 255 }).notNull(),
    filename_disk: varchar('filename_disk', { length: 255 }),
    filename_download: varchar('filename_download', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    type: varchar('type', { length: 255 }),
    folder: varchar('folder', { length: 36 }),
    filesize: bigint('filesize', { mode: 'number' }),
    width: int('width'),
    height: int('height'),
});

export const directus_folders = mysqlTable('directus_folders', {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    parent: varchar('parent', { length: 36 }),
});

// --- 2. CONNECTION POOL ---

const poolConnection = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // V1 used DB_PASS, Directus uses DB_PASSWORD
    database: process.env.DB_DATABASE, // V1 used DB_NAME, Directus uses DB_DATABASE
});

export const db = drizzle(poolConnection, { 
    schema: { artworks, magazine, orders, certificates, collectors, directus_files, directus_folders }, 
    mode: 'default' 
});
