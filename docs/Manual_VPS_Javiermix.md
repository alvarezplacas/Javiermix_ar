# 📜 MANUAL MAESTRO: Estándares de Infraestructura VPS (2026) - Golden Master 2.0

Este manual documenta el estado operativo "Golden Master 2.0" alcanzado en Abril 2026. Estas directrices son de cumplimiento obligatorio para garantizar la estabilidad y seguridad del servidor.

---

## 🏗️ 1. Arquitectura de Celdas (Aislamiento Total)

El servidor opera bajo un modelo de **Segmentación por Celdas** en el directorio `/opt/`:

- **Celda JavierMix**: `/opt/javiermix/web_0504/`
- **Celda Alvarez Placas**: `/opt/alvarezplacas/`
- **Stack Global**: Caddy (Proxy Maestro) y MailServer.

### Componentes de la Celda JavierMix:
- **Frontend**: Astro 6 (SSR mode) en Docker (`javiermix_web`).
- **Backend/CMS**: Directus v11.17.2 (`javiermix_directus`).
- **Base de Datos**: PostgreSQL 16 (`javiermix_db`).
- **Caché/Likes**: Redis 7 (`javiermix_redis`).
- **Analíticas**: Umami (`javiermix_stats`).
- **Archivos**: Filebrowser (`javiermix_files`).

---

## 📂 2. Estándar de Carpetas y Persistencia

### Ubicación de Datos
- **Código**: Todo el código de JavierMix reside en `/opt/javiermix/web_0504/`.
- **Datos Persistentes**: `/opt/javiermix/personal_files/`. Aquí viven las bases de datos, uploads de Directus y configuraciones de Redis.
- **Backups**: Los dumps de DB deben guardarse en `/opt/javiermix/personal_files/backups/`.

### Redes Docker
- **Red Interna**: `javiermix_internal` (Red aislada para la celda).
- **Red Externa**: `caddy_net` (Puente hacia el Proxy Maestro).

---

## 📡 3. Protocolo de Conectividad y SSL

### Gestión SSL (Caddy Maestra)
- **SSL Mode**: Automatizado por Caddy vía Let's Encrypt.
- **Proxy Maestro**: Ubicado en `/opt/caddy/`. Gestiona los dominios `javiermix.ar`, `admin.javiermix.ar` y `alvarezplacas.com.ar`.

### Comunicación Directus Smart Fallback
El sistema utiliza una lógica inteligente para conectar con el backend:
1. Intenta `http://javiermix_directus:8055` (Velocidad máxima, red interna).
2. Si falla, conmuta a `https://admin.javiermix.ar` (Resiliencia).

---

## 🛡️ 4. Seguridad y Directivas Críticas

1. **PROHIBIDO**: Instalar servicios web (Nginx, Apache) directamente en el host. Todo debe ir en Docker.
2. **Puertos**: Solo los puertos 80, 443 y 22 deben estar abiertos al mundo. Puertos como 8055, 5432 o 6379 deben ser estrictamente internos.
3. **Mantenimiento**: Cada vez que se actualice el código, realizar `docker compose up -d --build` para asegurar que las imágenes estén frescas.
4. **Limpieza**: Ejecutar `docker system prune -f` mensualmente para evitar saturación de disco (72GB disponibles).

---

## 🚀 5. Operación y Despliegue

### Flujo de Actualización
1. **Local**: Testear cambios -> `git push origin master`.
2. **VPS**: Acceder a `/opt/javiermix/web_0504/` -> `git pull`.
3. **Reinicio**: `docker compose up -d`.

---
*Actualizado por Antigravity - Abril 2026*
*Estado: OPERATIVO / ESTABLE / SEGMENTADO*
