CREATE TABLE `artwork_likes_tracking` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`artwork_filename` varchar(255) NOT NULL,
	`user_ip` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `artwork_likes_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artworks` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`serie_id` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`camera` varchar(100),
	`lens` varchar(100),
	`paper` varchar(100),
	`dimensions` varchar(100),
	`date` varchar(100),
	`description` text,
	`size_small` varchar(50),
	`precio_small` decimal(10,2),
	`size_medium` varchar(50),
	`precio_medium` decimal(10,2),
	`size_large` varchar(50),
	`precio_large` decimal(10,2),
	`stock` int DEFAULT 1,
	`is_limited_edition` int DEFAULT 0,
	`edition_total` int DEFAULT 0,
	`certificate_included` int DEFAULT 1,
	`frame_options` varchar(255) DEFAULT 'none',
	`is_featured` int DEFAULT 0,
	`status` varchar(50) DEFAULT 'published',
	`likes` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `artworks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`uuid` varchar(36) NOT NULL,
	`artwork_id` bigint unsigned NOT NULL,
	`collector_id` bigint unsigned NOT NULL,
	`sale_date` timestamp DEFAULT (now()),
	`sale_price` decimal(10,2) NOT NULL,
	`dimensions` varchar(100) NOT NULL,
	`edition_number` varchar(20),
	`is_verified` int DEFAULT 1,
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_uuid_unique` UNIQUE(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `collectors` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50),
	`country` varchar(100),
	`instagram` varchar(100),
	`notes` text,
	`status` varchar(50) DEFAULT 'lead',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `collectors_id` PRIMARY KEY(`id`),
	CONSTRAINT `collectors_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `magazine` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content_html` mediumtext NOT NULL,
	`featured_image` varchar(255),
	`video_url` varchar(255),
	`media_json` text,
	`tags` varchar(255),
	`author` varchar(150) DEFAULT 'Javier Mix',
	`is_premium` int DEFAULT 0,
	`status` varchar(50) DEFAULT 'published',
	`seo_title` varchar(255),
	`seo_description` varchar(255),
	`rating_total` int DEFAULT 0,
	`rating_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `magazine_id` PRIMARY KEY(`id`),
	CONSTRAINT `magazine_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `magazine_ratings_tracking` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`article_slug` varchar(255) NOT NULL,
	`user_ip` varchar(100) NOT NULL,
	`score` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `magazine_ratings_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_strategies` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(50) NOT NULL,
	`description` text,
	`status` varchar(20) DEFAULT 'pending',
	`priority` varchar(20) DEFAULT 'medium',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `marketing_strategies_id` PRIMARY KEY(`id`)
);
