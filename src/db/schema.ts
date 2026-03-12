import { mysqlTable, bigint, varchar, text, decimal, timestamp, int, mediumtext } from 'drizzle-orm/mysql-core';

// 1. Obras en Venta
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
    // Precios diferenciales
    size_small: varchar('size_small', { length: 50 }),
    precio_small: decimal('precio_small', { precision: 10, scale: 2 }),
    size_medium: varchar('size_medium', { length: 50 }),
    precio_medium: decimal('precio_medium', { precision: 10, scale: 2 }),
    size_large: varchar('size_large', { length: 50 }),
    precio_large: decimal('precio_large', { precision: 10, scale: 2 }),
    stock: int('stock').default(1),
    likes: int('likes').default(0),
    created_at: timestamp('created_at').defaultNow(),
});

// 2. Revista Online
export const magazine = mysqlTable('magazine', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content_html: mediumtext('content_html').notNull(),
    featured_image: varchar('featured_image', { length: 255 }),
    video_url: varchar('video_url', { length: 255 }),
    media_json: text('media_json'), // JSON string: [{type:'image'|'video', src:'...', caption:'...'}]
    tags: varchar('tags', { length: 255 }), // Comma separated tags
    rating_total: int('rating_total').default(0),
    rating_count: int('rating_count').default(0),
    created_at: timestamp('created_at').defaultNow(),
});

// 3. CRM & Clientes
export const collectors = mysqlTable('collectors', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique(),
    phone: varchar('phone', { length: 50 }),
    country: varchar('country', { length: 100 }),
    instagram: varchar('instagram', { length: 100 }),
    notes: text('notes'),
    status: varchar('status', { length: 50 }).default('lead'), // lead, collector, vip
    created_at: timestamp('created_at').defaultNow(),
});

// 4. Certificados de Autenticidad
export const certificates = mysqlTable('certificates', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    uuid: varchar('uuid', { length: 36 }).unique().notNull(), // UUID para validar vía QR
    artwork_id: bigint('artwork_id', { mode: 'number', unsigned: true }).notNull(),
    collector_id: bigint('collector_id', { mode: 'number', unsigned: true }).notNull(),
    sale_date: timestamp('sale_date').defaultNow(),
    sale_price: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
    dimensions: varchar('dimensions', { length: 100 }).notNull(), // El tamaño específico vendido
    edition_number: varchar('edition_number', { length: 20 }),
    is_verified: int('is_verified').default(1),
});

// 5. Tracking de Likes (Votos Certeros)
export const artworkLikesTracking = mysqlTable('artwork_likes_tracking', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    artwork_filename: varchar('artwork_filename', { length: 255 }).notNull(),
    user_ip: varchar('user_ip', { length: 100 }).notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

// 6. Tracking de Ratings (Sistema de Estrellas)
export const magazineRatingsTracking = mysqlTable('magazine_ratings_tracking', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    article_slug: varchar('article_slug', { length: 255 }).notNull(),
    user_ip: varchar('user_ip', { length: 100 }).notNull(),
    score: int('score').notNull(), // 1 a 5
    created_at: timestamp('created_at').defaultNow(),
});

// 7. Estrategias de Marketing
export const marketingStrategies = mysqlTable('marketing_strategies', {
    id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(), // social, seo, editorial, local
    description: text('description'),
    status: varchar('status', { length: 20 }).default('pending'), // pending, active, completed
    priority: varchar('priority', { length: 20 }).default('medium'), // high, medium, low
    created_at: timestamp('created_at').defaultNow(),
});
