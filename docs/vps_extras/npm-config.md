# [OBSOLETE - ABRIL 2026] Configuración de Nginx Proxy Manager (NG)
> [!CAUTION]
> **ESTE DOCUMENTO ES OBSOLETO.** Nginx Proxy Manager ha sido reemplazado definitivamente por **Caddy** en la arquitectura Golden Master 2.0. Las rutas de `/home/ubuntu/` ya no se utilizan.

---


Para que el servidor VPS pueda enrutar correctamente todos los sitios (AlvarezPlacas, JavierMix, Directus, FileBrowser y Analytics) a través de un único servidor Nginx Proxy Manager (NPM), sigue estos pasos:

## 1. Red Docker Compartida (OBLIGATORIO)

NPM debe estar en la misma red de Docker que los demás contenedores para poder comunicarse internamente sin exponer puertos. 

Asegúrate de haber creado la red externa primero (esto se hace una sola vez en el VPS):
```bash
docker network create javiermix_network
```

## 2. Docker Compose de Nginx Proxy Manager

Si aún no tienes NPM corriendo en el VPS, crea un archivo `docker-compose.yml` en una carpeta aparte (ej. `/home/ubuntu/npm/`):

```yaml
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'    # Tráfico HTTP
      - '443:443'  # Tráfico HTTPS (SSL)
      - '81:81'    # Panel de Administración de NPM
    environment:
      DB_MYSQL_HOST: "db"
      DB_MYSQL_PORT: 3306
      DB_MYSQL_USER: "npm"
      DB_MYSQL_PASSWORD: "npm"
      DB_MYSQL_NAME: "npm"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - javiermix_network

  db:
    image: 'jc21/mariadb-aria:latest'
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: 'npm'
      MYSQL_DATABASE: 'npm'
      MYSQL_USER: 'npm'
      MYSQL_PASSWORD: 'npm'
    volumes:
      - ./mysql:/var/lib/mysql
    networks:
      - javiermix_network

networks:
  javiermix_network:
    external: true
```
Levanta este servicio con `docker-compose up -d`. Ahora podrás entrar al panel de NPM en `http://IP_DEL_VPS:81` (Credenciales por defecto: `admin@example.com` / `changeme`).

## 3. Ruteo de Dominios en el Panel de NPM

Una vez dentro de NPM, debes crear los siguientes **Proxy Hosts** para redirigir los subdominios a los contenedores internos. En "Forward Hostname / IP" colocarás el **nombre del contenedor** (no una IP) y habilitarás Let's Encrypt para forzar el SSL.

### 🌐 JavierMix Website
* **Domain Names:** `javiermix.ar`, `www.javiermix.ar`
* **Forward Hostname / IP:** `javiermix_web`
* **Forward Port:** `4321` *(O el puerto del build de astro local, revisar Dockerfile.prod)*
* **Block Common Exploits:** Sí

### 🗄️ Directus (Base de Datos Visual)
* **Domain Names:** `admin.javiermix.ar`
* **Forward Hostname / IP:** `javiermix_directus`
* **Forward Port:** `8055`
* **Block Common Exploits:** Sí
* **Websockets Support:** Sí

### 📊 Umami (Analytics)
* **Domain Names:** `stats.javiermix.ar`
* **Forward Hostname / IP:** `javiermix_stats`
* **Forward Port:** `3000`
* **Block Common Exploits:** Sí

### 📂 FileBrowser
* **Domain Names:** `archivos.javiermix.ar`
* **Forward Hostname / IP:** `javiermix_files`
* **Forward Port:** `80`
* **Block Common Exploits:** Sí

> [!TIP]
> **Alvarez Placas:** Puedes configurar el host de `alvarezplacas.com.ar` en este mismo panel, apuntando a `alvarezplacas_web` (asegurándote de que su `docker-compose` también comparta la `javiermix_network`). Así, ambos proyectos viven en paz usando sus propios dominios y bases de datos, pero servidos por el mismo Nginx.
