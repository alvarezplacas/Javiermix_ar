# 🎨 Guía para el Frontend: Proyección de Datos V2

Esta guía explica cómo el frontend debe interactuar con la capa de datos unificada de Javier Mix V2.

## 1. Conexión Única (The "Source of Truth")

Toda interacción con la base de datos **DEBE** pasar por el concentrador del backend. No se deben crear conexiones manuales en las páginas de Astro.

**Importación recomendada:**
```typescript
import { db, artworks, magazine, orders } from '../../backend/conexion/db';
import { desc, eq, and } from 'drizzle-orm';
```

## 2. Obtención de Datos (Querying)

### Ejemplo: Listar Obras de una Serie
```typescript
const seriesArtworks = await db.select()
  .from(artworks)
  .where(eq(artworks.serie_id, 'Monumentos'))
  .orderBy(desc(artworks.created_at));
```

### Ejemplo: Obtener Artículo de Revista por Slug
```typescript
const article = await db.select()
  .from(magazine)
  .where(eq(magazine.slug, slug))
  .limit(1);
```

## 3. Resolución de Imágenes y Medios

Dado que las imágenes pueden venir de la carpeta local (`/public/img/`) o de Directus, utiliza siempre una lógica centralizada de resolución de URL.

**Función de Utilidad Sugerida:**
```typescript
function resolveMediaURL(url: string | null): string {
  if (!url) return '/img/placeholder.jpg';
  // Si es un UUID de Directus (36 caracteres)
  if (url.length === 36 && url.includes('-')) {
    return `${import.meta.env.PUBLIC_DIRECTUS_URL}/assets/${url}`;
  }
  // Si es una ruta local
  return url.startsWith('/') ? url : `/img/obras/${url}`;
}
```

## 4. Estilos y Diseño (HSL System)

Utiliza las variables CSS definidas en `global.css` para mantener la consistencia estética "Premium Dark":

- `var(--color-onyx-deep)`: Fondo principal (#050505).
- `var(--color-accent)`: Dorado/Bronce para acentos.
- `var(--color-burgundy)`: Identidad de marca.
- `var(--font-primary)`: Serif para títulos (Memoria).
- `var(--font-secondary)`: Sans para lectura (Potencia).

## 5. Estructura de Páginas

- **/frontend/index.astro**: Home imersivo.
- **/frontend/galeria/**: Portfolio y detalle de obras.
- **/frontend/revista/**: Artículos y blog.
- **/frontend/dashboard/**: Panel administrativo privado.

---
**Nota:** Para cualquier cambio en el esquema de datos, modifica primero `backend/conexion/db.ts` y sincroniza con el VPS.
