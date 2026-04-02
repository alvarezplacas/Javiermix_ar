# 🏛️ Arquitectura Directus - Javier Mix

Este documento detalla la configuración técnica de la instancia de Directus para `javiermix.ar`. **Cualquier cambio en la base de datos o contenedores DEBE ser registrado aquí para que futuros agentes IA y desarrolladores mantengan la integridad del sistema.**

## 1. Infraestructura (Docker)

La instancia está aislada de otros proyectos para garantizar rendimiento y estabilidad absoluta.

- **Contenedor Directus:** `javiermix_directus`
  - **Puerto Externo (Host):** `8056`
  - **Puerto Interno (Docker):** `8055`
  - **URL Pública:** `https://admin.javiermix.ar`
  - **Red:** `javiermix_network` (Externa)
- **Base de Datos:** `mariadb:latest` (`javiermix_db`)
  - **Almacenamiento:** Volumen persistente `javiermix_db_data`.
  - **Conexión:** Interna dentro de la red Docker.

## 2. Capa de Conexión (Frontend)

Ubicación del archivo: `/home/ubuntu/prod/javiermix_web/frontend/conexion/directus.ts`.

### Redundancia de Red (Internal Fallback)
El sistema utiliza una lógica de conexión dual para máxima eficiencia:
1. **URL Interna:** El frontend intenta conectar PRIMERO a `http://javiermix_directus:8055`. Esto ocurre dentro de la red de Docker, eliminando la latencia de internet y posibles fallos de certificados SSL internos.
2. **URL Pública Fallback:** Si la conexión interna falla (ej: durante mantenimiento), el sistema conmuta automáticamente a `https://admin.javiermix.ar`.

### Autenticación y Seguridad
- **Token de Acceso Estático:** `-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg` (Utilizado para todas las consultas de servidor y SSR).
- **Rol Público (Slug: `public`):**
  - **Policy ID:** `abf8a154-5b1c-4a46-ac9c-7300570f4f17`.
  - **Permisos Otorgados:** 
    - `directus_files`: Lectura (Todos los accesos).
    - `directus_folders`: Lectura (Todos los accesos).
    - `artworks`: Lectura (Todos los campos).
    - `magazine`: Lectura (Filtrado por `status = published`).
    - `collector_join`: Creación (Permite registros públicos).

## 3. Modelo de Datos (Colecciones Críticas)

### `artworks`
Funciona como el "Command Center" de metadatos de las obras fotográficas.
- **`filename`**: Debe coincidir EXACTAMENTE con el `filename_download` del archivo en Directus.
- **`likes`**: Contador numérico de favoritos.
- **`serie_id`**: Identificador de la serie artística.

### `magazine`
Estructura para la revista digital y blog.
- **`content_html`**: Almacena el contenido rico del artículo.
- **`featured_image`**: UUID del archivo de portada.
- **`status`**: Controla la visibilidad pública.

### `certificates`
Sistema de autenticidad para obras físicas.
- **`uuid`**: Identificador único (Primary Key lógica).
- **`artwork_id`**: Relación con la obra correspondiente.
- **`collector_id`**: Relación con el dueño de la pieza.

## 4. Gestión de Archivos y Assets

El frontend de Javier Mix depende de una estructura de carpetas estricta:
- **Carpeta `home`**: Se escanea automáticamente para el Hero Slider de la página de inicio.
- **Carpeta `Catalogo`**: Contiene subcarpetas nombradas por Serie (ej: "Serie_1"). El sistema usa el nombre de la carpeta para categorizar las obras.

## 🛡️ Guía para Futuros Agentes
- **Regla de Oro:** Siempre que modifiques el archivo de conexión `directus.ts` en el servidor, DEBES ejecutar `docker compose up -d --build frontend` para que los cambios surtan efecto en el contenedor.
- **Nuevos Campos:** Si agregas campos a Directus, asegúrate de actualizar la política pública `abf8a154-5b1c-4a46-ac9c-7300570f4f17` para que el frontend pueda verlos.
