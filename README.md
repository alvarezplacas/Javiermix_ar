# 🏛️ Javier Mix Website V2

Migration and refactor of the Javier Mix Fine Art platform.

## 🚀 High-Level Structure
```text
/
├── backend/            # DB, Schema, API
├── frontend/           # Astro Components & Pages
│   ├── galeria/        # Artwork Portfolio
│   ├── revista/        # Digital Magazine
│   ├── herramientas/   # Framing & Checkout
│   └── dashboard/      # Admin Panel
├── public/             # Static Assets (Synced from V1)
└── doc/               # Documentation & Plans
```

## 🛠️ Tech Stack
- **Framework**: Astro 5 (Node.js SSR)
- **Database**: MariaDB via Drizzle ORM
- **CMS**: Directus
- **Design**: Vanilla CSS (HSL System)
- **State**: Nanostores

## 📝 Discovery Notes
1. **Image Sources**: Directus is used as the primary CMS, but many assets are legacy uploads in `/public/uploads`. The V2 system unifies these.
2. **Metadata**: Artwork metadata is hybrid (CSV for legacy, DB for new entries).
3. **Admin**: The admin panel uses a simple PIN-based auth for dashboards and Directus for content management.

## ⚙️ Setup
1. `npm install`
2. Update `.env` (see `backend/.env.example`)
3. `npm run dev`
