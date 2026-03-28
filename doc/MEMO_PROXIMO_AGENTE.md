# 🧬 Guía de Transferencia: Agente de Dashboard (Javier Mix V2)

Esta guía resume el estado técnico y los patrones establecidos para que el próximo agente continúe trabajando en el "Command Center".

## 1. Patrones de Conexión (Directus)
- **Ruta Central:** Siempre usa `@conexion/directus`.
- **Colecciones:** El nombre correcto es **`artworks`** (todo minúsculas). Evitar `Artworks`.
- **Autenticación:** Las funciones de lectura en el dashboard (`getArtworks`, `getArticles`, etc.) ahora aceptan un parámetro opcional `token`. Siempre pásalo desde el cookie `jhm_admin_token` para ver borradores.
- **Sorting:** El campo estándar de fecha es `created_at` (para coincidir con el esquema de Drizzle).

## 2. Reglas de SSR (Astro 5)
- Todas las páginas del dashboard deben tener `export const prerender = false;` al principio de las vallas de código (`---`).
- Las redirecciones (`Astro.redirect`) deben ocurrir antes de cualquier renderizado de componente para evitar el error `ResponseSentError`.

## 3. Estado de los Módulos
- **Obras:** Listado y "Vincular" (Nueva Obra) estabilizados.
- **Revista:** CRUD completo funcionando (Index -> Nueva -> Editar).
- **Ventas:** Estructura de Drizzle lista, falta integrar el listado premium.

## 4. Próximos Pasos Recomendados
1. **Refinar Listado de Ventas:** Crear la página `dashboard/ventas/index.astro` usando `@conexion/db` para mostrar las órdenes registradas.
2. **Smart Stacking UI:** Mejorar la visualización de series agrupadas en el catálogo de obras.
3. **Optimización de Media:** Implementar el "Transformador de Imágenes" centralizado para servir webp/avif dinámicos desde la galería.

---
*Documento generado automáticamente el 24 de marzo de 2026.*
