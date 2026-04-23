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
    - **Razón del Upgrade**: Resolución del error de módulos virtuales `astro:preact:opts` y mejor soporte para hidratación de componentes reactivos.
    - **Variable Crítica**: `HOST=0.0.0.0` (para que el contenedor sea visible desde fuera).
- **Control de Estado**: **Nano Stores** (`atom`, `persistentMap`).
- **E-commerce**: Integración con **Mercado Pago SDK V2** (Checkout Pro).
- **CMS**: Directus (Imagen Docker oficial).
- **Base de Datos**: PostgreSQL 16 (JavierMix) / PostgreSQL 15 (Alvarez Placas).
- **Cache**: Redis 7 containerizado.
- **Proxy Maestro**: **caddy_router** (Caddy v2). Único dueño de los puertos 80 y 443.
- **SSL**: Gestión automática en modo Full Strict con Cloudflare.

---

## 📡 Conectividad y Redes Docker

Todos los sitios que necesitan salida a internet están conectados a una red compartida de Docker llamada **`javiermix_network`**.

- **Frontend -> Directus**: `http://javiermix_directus:8055`
- **Directus -> DB**: `javiermix_db:5432` (PostgreSQL 16)
- **Directus -> Redis**: `javiermix_redis:6379`

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

### 🛠️ Sincronización de Datos

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
2. **Proxy Aware**: Directus debe tener la variable `EXTENSIONS_CHECK_PROXY_HEADERS: "true"` para reconocer el protocolo del Proxy (Caddy).
3. **Middleware de Redirección**: Usa `src/middleware.ts` en Astro para detectar `x-forwarded-proto: http` y redirigir permanentemente (301) a la versión segura.
4. **Blindaje de URLs**: La función `getAssetUrl` debe forzar el protocolo `https://` en la cadena de retorno si el servidor devuelve por error un enlace inseguro.

---

## ⚡ Lecciones de Guerra: El "Ghost Bug" y Blindaje (04/04/2026)

Tras la restauración del Motor V8.5, hemos identificado errores estructurales que **NUNCA** deben repetirse:

### 1. El Fenómeno "Ghost Bug" (Fallo Silencioso)

- **Error**: Importar librerías de servidor (`ioredis`, `fs`, `dotenv`) dentro de un bloque `<script>` de Astro que se ejecuta en el navegador.
- **Consecuencia**: El Javascript del navegador colapsa al intentar resolver módulos de Node. El formulario "parece" funcionar (refresca), pero no envía datos a Directus y revierte los valores.
- **Solución**: Crear un cliente API ligero (`src/conexion/directus-client.ts`) que use `fetch` estándar y no tenga dependencias de Node.

### 2. Regla de Oro de Atributos HTML (Data Capture)

- **Error**: Inputs sin atributo `id` único.
- **Consecuencia**: El script de guardado no puede "mapear" el valor del input al objeto JSON que se envía a Directus.
- **Mandamiento**: Todo input de precio o medida (`precio_small`, `size_small`, etc.) **DEBE** tener un `id` coincidente con su nombre para ser capturado por `FormData` o `getElementById`.

### 3. Arquitectura de Alias Maestro (`@`)

- **Error**: Rutas relativas infinitas como `../../../../conexion/directus`.
- **Consecuencia**: Si mueves un archivo de carpeta, el sistema se rompe. Es ilegible.
- **Solución**: Usar siempre los alias definidos en `tsconfig.json`:
    - `@conexion/`: Para lógica de API.
    - `@components/`: Para UI.
    - `@layouts/`: Para estructuras base.

### 4. Blindaje de Archivos Privados (Seguridad Operativa)

Para mantener el sitio liviano y seguro, las siguientes carpetas y archivos **están prohibidos en la imagen de producción** (vía `.dockerignore`):

- `docs/`: (Contiene esta inteligencia, planos y manuales).
- `scripts/`: (Scripts de mantenimiento, siembra de datos y sincronización XMP).
- `*.md`: (Todos los archivos Markdown de registro y tareas).
- `backups/` y `*.sql`: (Volcados de base de datos).

---

---

## 🌐 Infraestructura Golden Master 2.0 (ACTIVO / ESTABLE)

Desde Abril 2026, la infraestructura ha sido migrada existosamente al estándar Golden Master 2.0.

### 1. Orquestación y Enrutamiento (Caddy)

- **Caddy como Proxy Maestro**: Reemplaza definitivamente a Nginx Proxy Manager (NPM).
    - **HTTP/3 (QUIC)**: Soporte nativo para una carga ultrarrápida de assets pesados (AVIF/MP4).
    - **SSL Full Strict**: Integración automática con Cloudflare en los puertos 80/443 del host.
- **CrowdSec (Escudo perimetral)**: Bouncer activo en Caddy para bloqueo de IPs maliciosas.

### 2. Ecosistema de Datos (PostgreSQL 16 + Redis 7)

- **PostgreSQL 16**: Motor principal para JavierMix. Escalabilidad y seguridad garantizadas.
- **Redis 7+**: Activo para consultas de Directus, Live Collections y tracking de likes.

### 3. Gestión de Multimedia (MinIO S3 Internal)

- **MinIO**: Actúa como servidor S3 privado en el contenedor `javiermix_minio`. Servidor de assets en `s3.javiermix.ar`.
- **Beneficio**: Desacoplamiento total del disco del VPS, optimizando el rendimiento de Directus.

### 4. Directivas de Continuidad Operativa

- **PROHIBIDO**: Instalar servicios web (Nginx, Apache) directamente en el host (fuera de Docker).
- **PROHIBIDO**: Alterar puertos en el Caddyfile sin verificar el puerto interno con `docker ps`.
- **FOCO 100%**: El desarrollo de infraestructura está **CONGELADO**. Todo el esfuerzo de código se dirige a la pasarela de **Mercado Pago** y validación de webhooks.

---

*Última actualización: 2026-04-05 by Antigravity (IA Agent)*
*Misión: Operación en Infraestructura Golden Master 2.0.*

--- 

---
