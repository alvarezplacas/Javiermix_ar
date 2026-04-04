# 📓 Manual de Ayuda y Mejores Prácticas (V2)

Este documento es una guía viva para que los agentes de IA y desarrolladores mantengan la integridad y escalabilidad del ecosistema Javier Mix + Directus.

## 🏗️ Arquitectura Recomendada (V2)

Basado en las tendencias de 2024-2026, la estructura óptima para este VPS es la **Contenedorización Total**.

### 1. Organización del Sistema de Archivos (Golden Master)
La raíz del proyecto está reservada exclusivamente para el código operacional. Toda la inteligencia reside en `/docs`:
- `docs/`: Manuales, planos de arquitectura, diseño y la carpeta histórica `vps_extras/`.
- `src/`: Código fuente de Astro (Frontend).
- `public/`: Assets estáticos.
- `docker-compose.yml`: Archivo maestro de orquestación (en la raíz).
- `.dockerignore`: Filtro crítico para mantener imágenes ligeras en producción.

### 2. Stack Tecnológico Estándar (VANGUARDIA)
- **Frontend**: **Astro 6.1+** con motor **Vite 8.0**. 
    - **Razón del Upgrade**: Resolución del error de módulos virtuales `astro:preact:opts` y mejor soporte para hidratación de componentes reactivos (carrito).
    - **Variable Crítica**: `HOST=0.0.0.0` (para que el contenedor sea visible desde fuera).
- **Control de Estado**: **Nano Stores** (`atom`, `persistentMap`) con integración nativa `@nanostores/preact`.
- **E-commerce**: Integración con **Mercado Pago SDK V2** (Checkout Pro).
- **CMS**: Directus (Imagen Docker oficial).
- **Cache**: Redis containerizado (mejora rendimiento un 40%).
- **Proxy**: Nginx Proxy Manager (NPM).

---

## 📡 Conectividad y Redes Docker

Todos los contenedores deben compartir una red común (ej: `web_network`) para comunicarse por nombre de contenedor en lugar de IPs.
- **Frontend -> Directus**: `http://directus:8055`
- **Directus -> DB**: `db:3306`

---

## 🖼️ Gestión de Assets (El "Wow Factor")

- **AVIF es el Rey**: Para fotografía de arte, el formato `.avif` es obligatorio.
- **Lógica de Nombres (Hover)**: 
    - `JMX_XXXX.avif` -> Imagen principal.
    - `JMX_XXXX 2.avif` o `JMX_XXXX_2.avif` -> Imagen de hover.
    - **IMPORTANTE**: El filtro de la galería debe ignorar ambos patrones (`[ _]2\.`) para evitar duplicados.
- **Parámetros de Directus**: Usa siempre los parámetros de transformación en la URL:
    - `?width=1200&format=avif&quality=80`
- **Fallback de Imagen**: Implementar siempre una imagen de baja resolución o un esqueleto (Skeleton) mientras el AVIF carga.

---

## 📸 Ficha Técnica y Metadatos (XMP)

El sitio utiliza un diseño **50/50** en la página de detalle (`obra/[id].astro`):
- **Izquierda**: Imagen principal.
- **Derecha**: Solapas (FICHA TÉCNICA, HISTORIA, ENVÍOS).

### 🛠️ Sincronización de Datos:
1. **Origen de Verdad**: Los archivos `.xmp` que el usuario sube junto a las fotos.
2. **Procesamiento**: El script `scripts/sync_xmp_artworks_v3.mjs` extrae los datos de los XMP (Cámara, Lente, ISO, etc.) y los inyecta en Directus.
3. **Campos en Directus**: La colección `artworks` debe tener los campos: `camera`, `lens`, `shutter`, `iso`, `aperture`, `dimensions`, `material`, `date`. Estos nombres coinciden exactamente con lo que el frontend espera en el objeto `meta`.

---

## 🛒 Motor V8: El Sistema de Ecommerce

El sitio ahora cuenta con una arquitectura de ventas robusta:

### 1. Gestión de Carrito (Sync Global)
- **Store**: `src/store/cartStore.ts`. Utiliza `persistentMap` para que el usuario no pierda su selección al recargar.
- **Preact Integration**: Los componentes reactivos (`AddToCartButton`, `CartWidget`) deben usar `client:only="preact"` para evitar conflictos de resolución en el servidor de Astro 6.
- **Importante**: En bloques `<script>` de Astro, siempre importa el store con la extensión completa: `import { ... } from '../../store/cartStore.ts';`.

### 2. Content Layer (Arquitectura Astro 6)
- La configuración de contenido se movió a la raíz de `src/`: **`src/content.config.ts`**. 
- Utiliza `loader: glob()` para mayor velocidad de construcción.

### 3. Pago Seguro (Mercado Pago)
- **ARS**: El sistema está configurado para pesos argentinos.
- **Endpoint**: `/api/checkout.js` gestiona la creación de la preferencia de pago de forma segura (Server-side).
- **Webhooks**: El sistema espera notificaciones en `/api/webhooks/mercadopago` para actualizar el stock en Directus.

---

## 🔒 Seguridad para el Próximo Agente

1. **UFW (Firewall)**: Solo deben estar abiertos los puertos `80`, `443` y `22`. Los puertos de las DB (`3306`) o Admin de Directus (`8055`) deben ser internos de Docker.
2. **Secrets**: NUNCA subas archivos `.env` a GitHub. Usa los Secrets de GitHub Actions para inyectar variables en el despliegue.
3. **Backup de DB**: Antes de cualquier cambio estructural, corre:
   ```bash
   docker exec [db_container] mysqldump -u root -p[password] [db_name] > backup.sql
   ```

---

## 💡 Consejos de Diseño (Premium Dark)
- Mantén el ratio de contraste bajo pero legible.
- Usa `backdrop-filter: blur(10px)` en elementos flotantes para sensación premium.
- Las animaciones de entrada deben ser sutiles (`0.6s` con `cubic-bezier`).

---
## ⚡ Optimización de Rendimiento (Misión Redis)
- **Caché en Directus**: Habilitado nativamente para reducir consultas a MariaDB.
- **Lógica de Likes**: Implementa un flujo Redis-Primario -> Directus-Sincrónico. 
- **Spam Prevention**: Usa el prefijo `track:filename:ip` en Redis para bloquear votos duplicados por 1 semana.

---
## 🛡️ Protocolo Verde (Seguridad HTTPS Total)

Para garantizar el "Candado Verde" y evitar avisos de "No seguro" (Mixed Content):

1. **CSP Mastery**: Incluye siempre `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">` en el Layout principal. Esto obliga al navegador a intentar cargar cualquier asset HTTP por HTTPS automáticamente.
2. **Proxy Aware**: Directus debe tener la variable `EXTENSIONS_CHECK_PROXY_HEADERS: "true"` para reconocer el protocolo del Proxy (Nginx).
3. **Middleware de Redirección**: Usa `src/middleware.ts` en Astro para detectar `x-forwarded-proto: http` y redirigir permanentemente (301) a la versión segura.
4. **Blindaje de URLs**: La función `getAssetUrl` debe forzar el protocolo `https://` en la cadena de retorno si el servidor devuelve por error un enlace inseguro.

---
*Ultima actualización: 2026-04-03 by Antigravity*
*Lección aprendida: Los nombres de archivos manuales pueden variar (espacios vs guiones); el matching debe ser insensible a símbolos para evitar "obras fantasma" o duplicados.*

---

## 🚀 Resumen de Avances y Aprendizajes (V8.5 - 04/04/2026)

Hoy hemos elevado la experiencia de usuario y la seguridad operativa del ecosistema JavierMix.

### 1. Motor de Búsqueda Global (V8)
- **Concepto**: Búsqueda en tiempo real que indexa toda la colección de Directus sin recargas de página.
- **Estética "Tetris"**: Sistema de animación escalonada (`staggered entry`) donde las obras "aterrizan" rítmicamente en la cuadrícula al buscar.
- **Glass Overlay**: Los títulos se integran ahora dentro de las fotos con un efecto de desenfoque (*glassmorphism*), manteniendo la pureza visual de la galería.

### 2. Blindaje de la Bóveda (Acceso Admin)
- **Corrección de Fugas**: Se detectó que el formulario de login enviaba los datos por `GET` por defecto. Se bloqueó con **`method="POST"`** para asegurar que el PIN nunca aparezca en la barra de direcciones.
- **Auto-Login via URL**: Se habilitó una función de conveniencia que rellena y procesa el PIN **2025** si se pasa por parámetro, limpiando la URL inmediatamente después por privacidad.

### 3. Aprendizajes del Servidor (Internal Insights)
- **Astro SSR & Forms**: Nunca asumas el método por defecto. En entornos SSR complejos como este, el blindaje explícito (`method="POST" + e.preventDefault()`) es crítico para evitar colisiones entre el navegador y el script de hidratación.
- **ClientRouter Persistence**: Para que los buscadores y animaciones funcionen entre navegaciones, la escucha de eventos debe estar atada exclusivamente a `astro:page-load`.
- **Media Management**: La revista (`revista/index.astro`) requiere un manejo dual de assets (internal vs public) debido a la configuración de red del VPS, lo cual ya está estandarizado en `conexion/directus.ts`.

---
*Documentado por Antigravity tras el backup exitoso en H:/*
