# ⚙️ Javier Mix V2: Backend Infrastructure

This folder contains the core logic for database connectivity and data management.

## 🗄️ Database System
- **Engine**: MariaDB (hosted on VPS via Docker).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) with `mysql2` driver.
- **CMS**: **Directus**. All metadata and content are managed through Directus and stored in the `javiermix_db` table.

## 🌐 VPS Connectivity (Production)

To connect the backend to the live server, use the following details in your `.env` file:

- **IP Host**: `144.217.163.13`
- **Port**: `3306`
- **User**: `root`
- **Database**: `javiermix_db` (or the one currenty in use by Directus)
- **Password**: `JavierMix2026!` (As of March 2026)

### 🔑 Security Secrets
- **Admin PIN**: `2025` (Legacy fallback for local dashboard).
- **Admin Password**: `Tecno121212` (Used for Directus and legacy admin).

## 📂 Folder Structure
- `/conexion`: Database client (`db.ts`) and metadata loaders (`metadata.ts`).
- `/api`: Server-side endpoints (e.g., `submit-order.ts`).

## 🚀 How to continue
1. Ensure `mysql2` is installed.
2. Configure `.env` based on `.env.example`.
3. Use the `loadArtworkMetadata` function in `metadata.ts` to fetch combined data from CSV and DB.
