CREATE TABLE IF NOT EXISTS orders (
    id bigint unsigned AUTO_INCREMENT PRIMARY KEY,
    order_number varchar(50) NOT NULL UNIQUE,
    collector_id bigint unsigned,
    collector_name varchar(255) NOT NULL,
    collector_email varchar(255) NOT NULL,
    collector_phone varchar(50),
    shipping_address text,
    total_price decimal(10,2) NOT NULL,
    payment_method varchar(50) DEFAULT 'transferencia',
    payment_status varchar(50) DEFAULT 'pending',
    shipping_status varchar(50) DEFAULT 'unshipped',
    items_json text NOT NULL,
    notes text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS magazine_ratings_tracking (
    id bigint unsigned AUTO_INCREMENT PRIMARY KEY,
    article_slug varchar(255) NOT NULL,
    user_ip varchar(100) NOT NULL,
    score int NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
