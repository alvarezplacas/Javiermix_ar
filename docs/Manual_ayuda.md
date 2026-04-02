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

### 2. Stack Tecnológico Estándar
- **Frontend**: Astro 5 con adaptador `@astrojs/node` en modo `standalone`.
    - **Variable Crítica**: `HOST=0.0.0.0` (para que el contenedor sea visible desde fuera).
- **CMS**: Directus (Imagen Docker oficial).
- **Cache**: Redis containerizado (mejora el rendimiento de las consultas de Directus un 40%).
- **Proxy**: Nginx Proxy Manager (NPM) para gestión visual de SSL.

---

## 📡 Conectividad y Redes Docker

Todos los contenedores deben compartir una red común (ej: `web_network`) para comunicarse por nombre de contenedor en lugar de IPs.
- **Frontend -> Directus**: `http://directus:8055`
- **Directus -> DB**: `db:3306`

---

## 🖼️ Gestión de Assets (El "Wow Factor")

- **AVIF es el Rey**: Para fotografía de arte, el formato `.avif` es obligatorio.
- **Parámetros de Directus**: Usa siempre los parámetros de transformación en la URL:
    - `?width=1200&format=avif&quality=80`
- **Fallback de Imagen**: Implementar siempre una imagen de baja resolución o un esqueleto (Skeleton) mientras el AVIF carga.

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
*Ultima actualización: 2026-04-02 by Antigravity*
*Lección aprendida: El contenido mixto (AVIF/MP4 por HTTP) rompe la confianza del usuario.*
