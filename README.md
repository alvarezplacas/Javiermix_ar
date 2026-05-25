# Javiermix Art Experience - Mayo 2026

Este repositorio contiene la plataforma digital de autor de **Javier Mix**, un portal fine-art de alta gama desarrollado en **Astro** y conectado dinámicamente con **Directus CMS** y **PostgreSQL** con Drizzle ORM.

---

## 🚀 Estado Actual y Novedades del Proyecto (Última Actualización)

Hemos consolidado el proyecto bajo el **Estándar de Oro JMX**, logrando fidelidad estética, blindaje técnico y máxima indexación SEO:

### 🎞️ 1. Rescate Fotográfico y Restauración (`src/pages/rescate.astro`)
El sector superior ha sido completamente rediseñado bajo un concepto de **inspección de archivos analógicos de alta gama**:
* **Lupa de Grano Glassmorphic Fija (`.scanner-loupe`)**: En el centro de la tarjeta de lienzo decorativa, una lupa física de bronce con cruz de mira central posee un cristal con filtro de contraste, brillo y saturación masivo (`backdrop-filter`).
* **Negativo en Movimiento (`.panning-scan-img`)**: Una fotografía real del catálogo digitalizado de Directus se desplaza y panea de forma aleatoria y lenta en un bucle continuo de 32 segundos por detrás de la lupa. Al pasar por el centro, la imagen se ilumina y adquiere un contraste cristalino inmediato, emulando la inspección física de motas de polvo y grano de negativos.
* **Luz de Barrido del Escáner (`.scanner-light-beam`)**: Un haz de luz brillante blanco-dorado se desplaza horizontalmente barriendo la cabecera por detrás de todas las tipografías y botones, simulando la lámpara de un escáner plano de negativos.
* **Stacking Context Blindado**: Elementos interactivos y de lectura elevados de manera estricta a `z-index: 2` sobre `position: relative`, manteniendo la luz de fondo en `z-index: 1` para impedir que eclipse los botones o dificulte la legibilidad al moverse.
* **Filtros de Vidrio Esmerilado con Máscara Apple-Style**:
  * Eliminamos el select nativo de navegador por una botonera horizontal de pestañas fluidas con contadores dinámicos exactos (`.tab-count`).
  * **Fading Edge Mask**: Aplicamos una máscara lineal de desvanecimiento gradual en los extremos del contenedor (`mask-image: linear-gradient`) para difuminar elegantemente las categorías que desbordan la pantalla en caso de tener muchas series cargadas.
  * **Colchón de Padding**: Agregamos un relleno lateral al contenedor (`padding: 0.2rem 2.5rem 0.2rem 1.5rem`) para evitar que la máscara recorte los textos del primer y último botón cuando el scroll está en su posición inicial.
* **Semántica HTML5**: El selector de filtros está envuelto en una etiqueta de navegación `<nav aria-label="...">` y la meta-información técnica se estructuró semánticamente mediante listas no ordenadas `<ul>` y `<li>` para SEO limpio.

### 🔗 2. URLs Amigables y Sitemap Dinámico (SEO Élite)
* **Friendly URLs**: Migración de todos los accesos de carpetas/colecciones basados en UUIDs complejos (`/galeria/66bdb1f9-...`) a URLs semánticas limpias con slugs en minúsculas y sin acentos (`/galeria/rostros-de-metal`).
* **Redirección SEO 301 en Tiempo Real**: Si un bot de Google o usuario accede a una ruta antigua con UUID de 36 caracteres en `[serie].astro`, el servidor ejecuta una redirección permanente `301` instantánea hacia el slug amigable limpio para transferir el 100% de la autoridad del enlace (link juice) y erradicar el contenido duplicado.
* **Sitemap XML Autogenerado (`sitemap.xml.astro`)**: Conectado directamente a Directus API en vivo utilizando el dominio activo `https://javiermix.ar`. Autocompila e indexa en tiempo real las series de galería y los artículos reales de la revista digital con su correspondiente formato dinámico `/revista/${article.id}-${article.slug}` y fechas de creación.
* **Saneamiento de Footer**: `Footer.astro` procesa ahora los slugs amigables correctos mediante la utilidad `slugify`.

### 💖 3. Sistema de Likes Persistente y Anti-Spam (Instagram-Style)
* **Persistencia SSR**: La página de inicio y los detalles de obras recuperan la dirección IP del visitante (`Astro.clientAddress`) y consultan la base de datos antes del renderizado en servidor. El botón de corazón se inyecta con la clase `.liked` (rojo carmesí) desde el primer milisegundo de carga si ya fue valorado.
* **Blindaje Anti-Spam**: Tabla `artworkLikesTracking` en PostgreSQL de Drizzle que registra y restringe votos duplicados por IP de usuario. Sincronización híbrida inmediata con caché de lectura en Redis.

### 🖼️ 4. Experiencia Inmersiva Royal Gallery (`royal-gallery.astro`)
* **Portal de Entrada y Auto-Fullscreen (F11)**: Spinner inicial de sincronización con Directus y portal con logotipo de museo y gran botón premium `"INICIAR EXPERIENCIA"`. Al clicar, se ejecuta `requestFullscreen` nativo sobre todo el documento.
* **Fichas Técnicas en Hover y Contraste Adaptativo**: Las fichas permanecen ocultas en opacidad cero y se revelan suavemente mediante curvas Bézier solo en hover de obra.
* **Contraste Inteligente**: Variables CSS en `:root` que conmutan de forma instantánea el contraste de las letras (crema/tiza sobre Velvet Red o Borgoña; carbón sobre Mármol o Yeso) y adaptan dinámicamente el botón de adquisición wireframe.

---

## 🛠️ Comandos de Despliegue (JMX Deploy Master)
El sistema de despliegue se realiza mediante el script automatizado local:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\DESPLEGAR.ps1
```
Este script:
1. Añade cambios a Git y crea un commit no bloqueante con cuenta atrás.
2. Sube cambios a la rama `master` en GitHub.
3. Detecta el canal de red activo (red privada segura **Tailscale** `100.127.6.20` vs IP Pública).
4. Ejecuta por SSH seguro la recreación y compilación dinámica de Astro dentro del contenedor Docker del VPS de forma instantánea y sin caída de servicio.