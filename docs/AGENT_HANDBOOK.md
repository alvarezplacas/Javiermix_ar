# 🤖 Javier Mix - Agent Handbook (v1.0)

Este documento es una guía técnica para agentes de IA que trabajen en este repositorio. Ayuda a entender la arquitectura desacoplada y el flujo de datos sin necesidad de investigación previa.

## 🏗️ Arquitectura

El sitio es una aplicación **Astro 5 (SSR)** integrada con **Directus CMS** y una base de datos **MySQL** residual.

- **Frontend**: Carpeta `src/`. Usa Astro con soporte SSR para contenido dinámico.
- **CMS**: Directus Cloud (`https://admin.javiermix.ar`).
- **DB**: MySQL local (Drizzle ORM) para el sistema de Likes y Tracking de IP.

## 📁 Estructura de Datos (Directus)

- **Series**: Se mapean directamente desde las **Folders** dentro de la carpeta raíz "Catalogo".
- **Obras**: Se mapean desde los **Files** dentro de cada carpeta de serie.
- **Detalle Extendido (Artworks)**: Carpeta `obra/[id].astro`. Diseño **50/50**.
    - La colección `artworks` en Directus contiene los metadatos técnicos vinculados por el campo `filename`.
    - **Metadatos Técnicos**: `camera`, `lens`, `shutter`, `iso`, `aperture`, `dimensions`, `material`, `date`.
    - **Sincronización**: Usa `scripts/sync_xmp_artworks_v3.mjs`. El matching es **insensible a caracteres especiales** (normaliza `JMX_123` y `JMX 123` al mismo valor).

## 🖼️ Lógica de Variantes (Madre vs Hover)

El fotógrafo usa un sistema de sufijos para el efecto de hover:
- `JMX_XXXX.avif` (Principal)
- `JMX_XXXX 2.avif` o `JMX_XXXX_2.avif` (Variante de Hover)

**Regla Crítica**: Al listar la galería, SIEMPRE filtrar con `!filename.match(/[ _]2\./)` para evitar que el usuario vea la misma foto dos veces.

## 🔌 Capa de Conexión (`src/conexion/directus.ts`)

Toda la comunicación con Directus DEBE pasar por la función `fetchFromDirectus`.

- Implementa una lógica de **Redundancia (Fallback)**: Intenta conectar primero por la red interna de Docker (`http://javiermix_directus:8055`) y si falla, usa la URL pública.
- Requiere el **Static Token** configurado en el archivo.

## 💡 Reglas de Oro para Intervenir

1. **Rutas @**: Usa siempre los alias configurados (`@components`, `@conexion`, `@layouts`).
2. **Estética**: El sitio sigue una estética de "Galería Premium Dark". No uses Tailwind ni colores genéricos.
3. **Optimización**: Las imágenes se sirven a través del endpoint de assets de Directus con parámetros de optimización (`?width=...&format=avif`).

---
*Ultima actualización: 2026-04-03 by Antigravity*

## 🚀 Roadmap: Pendientes para el próximo Agente

Para llevar el sitio al siguiente nivel de "Golden Master", aún falta:
1. **Gestión de Historia**: El campo "Historia" en las solapas 50/50 debería ser un campo `WYSIWYG` en la colección `artworks` de Directus. Actualmente está estático o vacío.
2. **Procesador AVIF Automático**: Implementar un Hook en Directus o una Action en el servidor que, al detectar una subida `.jpg` o `.png`, dispare la conversión a `.avif` de forma nativa.
3. **Panel de Control de Sincronización**: Crear una ruta protegida (ej: `/admin/sync`) donde Javier pueda disparar el script de XMP apretando un botón, en lugar de usar la terminal.
4. **Optimización de XMP**: El parser actual usa Regex; si los archivos XMP se vuelven muy complejos, considerar migrar a `fast-xml-parser`.

> [!IMPORTANT]
> **Consistencia de Nombres**: Los campos en Directus DEBEN coincidir con los nombres en el frontend para no romper el objeto `meta` en `[id].astro`.
