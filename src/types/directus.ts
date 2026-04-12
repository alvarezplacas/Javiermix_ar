/**
 * 🏛️ Types for Directus Collections
 * Based on the Golden Master 2.0 Schema
 */

export interface Artwork {
    id: number;
    filename: string;
    serie_id: string;
    title: string;
    camera?: string;
    lens?: string;
    paper?: string;
    dimensions?: string;
    date?: string;
    description?: string;
    size_small?: string;
    precio_small?: string | number;
    size_medium?: string;
    precio_medium?: string | number;
    size_large?: string;
    precio_large?: string | number;
    stock?: number;
    is_limited_edition?: number;
    edition_total?: number;
    certificate_included?: number;
    frame_options?: string;
    is_featured?: number;
    status: 'published' | 'draft' | 'archived';
    likes: number;
    created_at?: string;
}

export interface Article {
    id: number;
    slug: string;
    title: string;
    content_html: string;
    featured_image?: string;
    video_url?: string;
    media_json?: string;
    tags?: string;
    author?: string;
    is_premium?: number;
    status: 'published' | 'draft' | 'archived';
    seo_title?: string;
    seo_description?: string;
    rating_total?: number;
    rating_count?: number;
    created_at?: string;
    user_created?: any;
}

export interface Order {
    id: number;
    order_number: string;
    collector_id?: number;
    collector_name: string;
    collector_email: string;
    collector_phone?: string;
    shipping_address?: string;
    total_price: string | number;
    payment_method?: string;
    payment_status?: string;
    items_json: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Sale {
    id: number;
    uuid: string;
    artwork_id: number | Artwork;
    collector_id: number;
    order_id?: number;
    sale_date?: string;
    sale_price: string | number;
    dimensions: string;
    edition_number?: string;
    is_verified?: number;
}

export interface Collector {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    country?: string;
    instagram?: string;
    notes?: string;
    status?: string;
    created_at?: string;
}

/**
 * Directus Schema definition for the SDK
 */
export interface Schema {
    artworks: Artwork[];
    magazine: Article[];
    orders: Order[];
    sales: Sale[];
    collectors: Collector[];
}
