# Guía de Conexión: Frontend Javier Mix V2 + Directus API

Esta guía está destinada al **Agente de Frontend** para continuar las mejoras de UI/UX sin romper la sincronización con el CMS.

## 🧱 Arquitectura Actual

El frontend está desarrollado en **Astro 5 (SSR)**. Hemos desacoplado totalmente el sitio de consultas directas a la base de datos (Drizzle ORM) para evitar errores de conexión local (`ECONNREFUSED`). Todas las peticiones ahora pasan por la **API REST de Directus**.

**Variable de Entorno Crítica:** `DIRECTUS_URL` (Ej: `https://admin.javiermix.ar`)

---

## 📡 Cómo Obtener Datos (Fetch API)

Para mantener la compatibilidad y simplicidad, usamos `fetch` nativo directamente en los componentes de Astro.

### Ejemplo: Listar Archivos de una Carpeta (Galería)

```javascript
const FOLDER_ID = "tu-id-de-carpeta";
const res = await fetch(`${DIRECTUS_URL}/files?filter[folder][_eq]=${FOLDER_ID}&sort=filename_download`);
const data = await res.json();
const files = data.data;
```

---

## 🖼️ Lógica de Obras y Efecto Hover `_2`

El usuario utiliza la nomenclatura `JMX_xxxx.avif` para la obra principal y `JMX_xxxx_2.avif` para la versión de ambiente o variante.

### Implementación Recomendada

1. Filtramos las imágenes principales (las que **no** contienen `_2`).
2. Para cada una, buscamos en el mismo set una que empiece por `filename_base + "_2"`.
3. Pasamos ambos URLs al componente: `mainUrl` y `hoverUrl`.

**CSS Sugerido para el Hover**

```css
.hover-img {
    position: absolute;
    top: 0; left: 0;
    opacity: 0;
    transition: opacity 0.6s ease;
}
.card:hover .hover-img {
    opacity: 1;
}
```

---

## ⏱️ Transiciones y Animaciones

- **Home Hero**: Se implementó un fade-out de la imagen de carga a los **2 segundos** para mostrar los videos de fondo.
- **Series Header**: El fondo rota entre las obras de la colección cada **3 segundos** (intervalo configurado en el script del cliente).

## 🧪 Notas para el Agente de Frontend

- **Alt Text**: Por petición del usuario, se han dejado textos `alt` genéricos ("Obra Fine Art") para evitar que se vean nombres de archivo técnicos si una imagen falla al cargar.
- **SSR**: Las páginas están configuradas con `export const prerender = false` para asegurar que el contenido esté siempre actualizado desde Directus.
- **Estilo**: El usuario busca una estética premium, minimalista y con micro-animaciones fluidas.

---
*Cualquier cambio estructural en las conexiones debe ser consultado luego con el agente de Backend/Infraestructura.*
