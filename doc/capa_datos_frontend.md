# Guía de Acceso a Datos - Javier Mix V2 (Frontend Agent)

Esta guía explica cómo el agente de frontend debe interactuar con la capa de datos en la arquitectura **Astro 5 SSR**.

## 1. El Alias `@conexion`

Para evitar rutas relativas complejas (`../../../../`), se ha configurado un **Alias de Vite**. Este alias apunta directamente a la carpeta de lógica de datos.

- **Uso Estándar**: `import { ... } from '@conexion/[archivo]';`
- **Ubicación Física**: `frontend/conexion/`

## 2. Bases de Datos con Drizzle ORM

El archivo principal es `@conexion/db`. Este exporta la instancia de base de datos (`db`) y los esquemas de tablas.

### Tablas Disponibles:
- `artworks`: Catálogo de obras de arte.
- `magazine`: Artículos de la revista digital.
- `orders`: Registro de ventas y pedidos.
- `certificates`: Certificados de autenticidad emitidos.
- `collectors`: Base de datos de coleccionistas/clientes.

### Ejemplo de Uso en una Página SSR:
```astro
---
import { db, artworks } from '@conexion/db';
import { desc, eq } from 'drizzle-orm';

// Obtener las últimas 10 obras
const lastArtworks = await db.select()
  .from(artworks)
  .orderBy(desc(artworks.created_at))
  .limit(10);
---
```

## 3. Metadatos Compartidos (CSV)

Para la lógica de metadatos EXIF y biblioteca física, usamos `@conexion/metadata`.

### Ejemplo de Uso:
```astro
---
import { loadArtworkMetadata } from '@conexion/metadata';

const metadata = loadArtworkMetadata();
const infoObra = metadata.get('mi-foto.avif');
---
```

## 4. Estructura de Rutas (Pages)

Todas las rutas dinámicas y estáticas deben residir en `frontend/pages/`. La profundidad de la subcarpeta no afecta al import si usas el alias.

- **D1 (Raíz)**: `frontend/pages/*.astro` -> usa `@conexion`
- **D2 (Sub)**: `frontend/pages/galeria/*.astro` -> usa `@conexion`
- **D3 (Deep)**: `frontend/pages/user/certificados/*.astro` -> usa `@conexion`

---
**Nota para el Agente**: Esta estructura asegura que el build de producción no falle al resolver módulos y mantiene el código limpio y portable.
