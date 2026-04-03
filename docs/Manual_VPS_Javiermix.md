# 📜 MANUAL MAESTRO: Estándares de Infraestructura VPS (2026)

Este manual documenta el "Estado del Arte" alcanzado en este servidor. Sigue estas directrices para mantener la estabilidad, velocidad y seguridad en todos los proyectos alojados.

---

## 🏗️ 1. Arquitectura "JavierMix Standard"
Cada sitio web debe seguir el modelo **Decoupled Architecture** (Arquitectura Desacoplada):
- **Frontend**: Astro 5 (SSR mode) montado en Docker.
- **Backend/CMS**: Directus (Headless) coordinando bases de datos y assets.
- **Cache**: Redis independiente por proyecto.
- **Proxy**: Nginx Proxy Manager (NPM) manejando el tráfico entrante.

---

## 📂 2. Estándar de Carpetas y Producción (El Orden es Ley)
El orden es la clave de la estabilidad. Evita el caos de carpetas desordenadas.

### Ruta en el VPS (Ubuntu)
Cada sitio vive en: `/home/ubuntu/prod/[nombre_del_sitio]/`
- **📂 `/public/uploads`**: Carpeta física en el host vinculada a Directus (Binding).
- **📂 `/docs`**: Manuales, planos de arquitectura, diseño y la carpeta histórica `vps_extras/`.
- **📂 `/src`**: Código fuente de Astro.

### Ruta Local (Workspace)
Mantener sincronía total con GitHub. El proyecto local es el "Espejo" del servidor.

---

## 📡 3. El Protocolo de Conectividad `@conexion`
Para que el Frontend y el CMS se hablen sin errores:
1.  **Capa de Servicio**: Centralizar toda la lógica en `src/conexion/directus.ts`.
2.  **Variables Internas**: Astro habla con Directus por la red interna de Docker (`http://javiermix_directus:8055`).
3.  **Variables Públicas**: Las imágenes deben forzarse por el Proxy SSL (`https://admin.javiermix.ar`).

---

## 🛡️ 4. Protocolo Verde: Seguridad HTTPS Total
Para evitar el aviso de **"No seguro"** y errores **502 Bad Gateway**:

### Nginx Proxy Manager (NPM) Settings
- **Scheme**: `http` (Interno entre NPM y el contenedor).
- **Forward Hostname**: Usar el nombre del contenedor (ej: `javiermix_web`).
- **Forward Port**: **4321** (Estándar de Astro).
- **Force SSL**: **ACTIVADO**.

### Blindaje de Código (CSP)
Inyectar siempre en el `<head>` de `Layout.astro`:
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```
Esto soluciona el "Mixed Content" de AVIF y MP4 de forma automática.

### Middleware de Astro
Implementar un `middleware.ts` que redirija cualquier tráfico `http` detectado en el proxy a `https`.

---

## 🖼️ 5. Gestión de Medios (AVIF & MP4)
- **Directus Asset Transformer**: Implementar siempre la función `getAssetUrl` que limpie y fuerce HTTPS.
- **Permisos Linux**: Carpeta `/uploads` debe pertenecer a `chown 1000:1000` para que los contenedores puedan escribir.

---

## 💾 6. Persistencia de Datos
- **Base de Datos**: Usar volúmenes externos (`external: true` en Docker Compose) para que al borrar un contenedor NO se pierdan los datos.
- **MariaDB root**: Usar el usuario `root` para conexiones entre contenedores si es necesario, garantizando permisos plenos para Umami y Directus.

---
*Documentado por Antigravity - Abril 2026*
*Mensaje para IAs futuras: Respeta el orden de carpetas y no modifiques alvarezplacas.*
