# Manual de Mejores Prácticas Web 2026 (Astro + HTML5 + CSS Moderno)

Este documento centraliza las directrices arquitectónicas más avanzadas para asegurar el rendimiento, el SEO y el modernismo visual de Javiermix.

## 1. Arquitectura Astro 🚀
Astro lidera el rendimiento en 2026 gracias a su "Islands Architecture" y el "Zero JS by default".
*   **Hidratación Estratégica**: Todo componente debe ser estático por defecto. Usar `client:load`, `client:visible` o `client:idle` SÓLO cuando la interactividad sea estrictamente necesaria (ej: botones de "Me Gusta", Menús móviles).
*   **Transiciones de Vista Nativas**: Utilizar el `<ClientRouter />` u optimizaciones de View Transitions para que la navegación entre páginas se sienta como una App (Single Page Application) sin la sobrecarga pesada.
*   **Optimización Activa de Medios**: Prohibido usar `<img>` estándar para fotos pesadas. Siempre usar el componente `<Image />` nativo de Astro para forzar WebP/AVIF y `loading="lazy"`.
*   **Prefetching**: Precargar enlaces importantes con `data-astro-prefetch`.

## 2. HTML5 Semántico y Accesibilidad ♿
*   **Estructura Jerárquica**: Siempre tener un único `<h1>` por página. Respetar el flujo natural `<h2>` -> `<h3>` sin saltos.
*   **Bloques de Significado**: Reemplazar `<div>` genéricos por `<main>` (para el contenido principal único), `<article>` (posts o recuadros redistribuibles), `<section>`, y `<aside>` (contenido secundario).
*   **Aria Roles**: Botones interactivos deben usar la semántica correcta (`<button>` vs `<a>`) y llevar `aria-label` descriptivos en caso de botones con sólo íconos.

## 3. CSS Moderno 2026 🎨
El CSS de Javiermix aprovechará los últimos superpoderes nativos para evitar el uso excesivo de frameworks o JavaScript.
*   **Nesting Nativo**: Organizar el código usando anidamiento nativo. Limitar a 3 niveles de profundidad para evitar especificidad excesiva.
*   **Container Queries (`@container`)**: Los componentes deben adaptarse a su contenedor (`cqw`), no a la pantalla completa (`vw`). Reemplazar *Media Queries* tradicionales de componentes aislados por Container Queries.
*   **Color Dinámico (`color-mix()` y `oklch()`)**: Evitar declarar 10 tonalidades oscuras. Usar variables lógicas y `color-mix()` para derivar automáticamente paletas claras/oscuras de acento.
*   **Pseudo-clase `:has()`**: Cambiar estilos de un contenedor principal basándose en lo que ocurre dentro (ej. *si una tarjeta tiene una imagen activa, oscurecer el fondo*).
*   **Unidades de Altura Modernas**: Reemplazar `100vh` en dispositivos móviles por unidades dinámicas (`dvh`) o pequeñas (`svh`) para evitar conflictos con la barra del navegador de iOS/Android.
