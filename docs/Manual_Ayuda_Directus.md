# 📘 Manual de Referencia de Excelencia: Directus CMS (Golden Master 2.0)

Este manual ha sido compilado siguiendo las mejores prácticas oficiales de Directus para entornos de alto rendimiento y estabilidad. Está diseñado para servir como guía definitiva en la administración del ecosistema **JavierMix**.

---

## 🚀 Arquitectura y Despliegue (Docker)

Directus debe tratarse como un servicio efímero. Toda la persistencia debe residir en el host para garantizar actualizaciones sin pérdida de datos.

### 1. Pinning de Versiones
**NUNCA** uses la etiqueta `:latest` en producción. 
- **Correcto**: `image: directus/directus:11.17.0`
- **Razón**: Evita cambios disruptivos automáticos que puedan romper la compatibilidad con la base de datos o extensiones.

### 2. Mapeo de Volúmenes Críticos
Para que el servidor sea "Golden Master", estas rutas deben estar en el host:
- `/directus/uploads`: Almacenamiento local de archivos (si no se usa S3).
- `/directus/extensions`: Carpeta para lógica personalizada y hooks.
- `/directus/database`: Solo si usas SQLite (no recomendado para producción).

---

## 🔐 Seguridad y Credenciales

### 1. Variables de Inicialización (Bootstrap)
Variables como `ADMIN_EMAIL` y `ADMIN_PASSWORD` **solo funcionan la primera vez** que se crea la base de datos. Una vez inicializada, los cambios en el `docker-compose.yml` no afectarán al usuario admin existente.

### 2. Reinicio de Contraseña Manual (Urgencias)
Si pierdes el acceso, usa este comando desde la terminal del VPS:
```bash
docker exec -it javiermix_directus npx directus users passwd --email admin@javiermix.ar --password NuevaPassword123
```

### 3. Llaves Maestras (`KEY` y `SECRET`)
- `KEY`: Identificador único de la instancia.
- `SECRET`: Usado para firmar tokens JWT. 
> [!IMPORTANT]
> Si cambias el `SECRET`, todas las sesiones de usuario activas se cerrarán inmediatamente.

---

## ⚡ Optimización de Rendimiento

### 1. Caching con Redis
Para un sitio premium, la caché de memoria no es suficiente. Usamos Redis para desacoplar la carga de la base de datos:
- `CACHE_ENABLED: "true"`
- `CACHE_STORE: "redis"`
- `CACHE_REDIS: "redis://javiermix_redis:6379"`

### 2. Almacenamiento S3 (MinIO)
Delegar archivos a un bucket S3 compatible:
- `STORAGE_LOCATIONS: "s3"`
- `STORAGE_S3_DRIVER: "s3"`
- `STORAGE_S3_ENDPOINT: "https://s3.javiermix.ar"`
- `STORAGE_S3_S3_FORCE_PATH_STYLE: "true"` (Requerido para MinIO).

---

## 🌐 Convivencia de Múltiples Instancias

Para evitar interferencias con otros proyectos (como `alvarezplacas.com.ar`):

1. **Nombres de Contenedores Únicos**: Usar prefijos como `javiermix_directus` y `javiermix_db`.
2. **Redes Aisladas**: Definir redes específicas en Docker Compose:
   ```yaml
   networks:
     javiermix_network:
       external: true
   ```
3. **Proxy Inverso (Caddy)**: Usar nombres de contenedores en lugar de IPs para que Caddy resuelva dinámicamente:
   ```caddy
   admin.javiermix.ar {
       reverse_proxy javiermix_directus:8055
   }
   ```

---

---

## 📸 Gestión de Multimedia Premium (AVIF & Video)

Para mantener la estética "JavierMix" con máximo rendimiento, sigue estas reglas de oro:

### 1. Fotografía de Autor (AVIF)
- **Formato Nativo**: Sube preferentemente archivos `.avif` para máxima compresión sin pérdida visual perceptible.
- **Límite**: Configurado hasta **100MB** para permitir archivos máster si es necesario.
- **Transformación Dinámica**: El frontend solicita automáticamente versiones optimizadas usando `width` y `format=avif`. No es necesario redimensionar manualmente antes de subir si la foto original es < 20MB.

### 2. Video de Fondo y Reels (MP4)
- **Códec Recomendado**: H.264 o H.265 en contenedor `.mp4`.
- **Peso Ideal**: Para el Hero de la web, intenta que los videos no superen los **10MB** para carga instantánea. Directus servirá el video original sin transformaciones.
- **Autoplay**: Asegúrate de que los videos para la web no tengan pista de audio si se usarán como fondo (autoplay mute policy).

---

## 🛠️ Comandos de Mantenimiento

| Acción | Comando |
| :--- | :--- |
| Ver Logs | `docker logs -f javiermix_directus` |
| Estado del Sistema | `npx directus bootstrap` (Verifica conexión a DB) |
| Listar Extensiones | `npx directus extensions list` |
| Forzar Migraciones | `npx directus database migrate:latest` |

---
> [!TIP]
> Mantén siempre una copia del `SECRET` y la `KEY` en un lugar seguro fuera del servidor. Son la base de la seguridad de tus datos.
