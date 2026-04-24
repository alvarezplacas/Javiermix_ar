# 🏛️ Arquitectura Directus - Javier Mix

Este documento detalla la configuración técnica de la instancia de Directus para `javiermix.ar`. **Cualquier cambio en la base de datos o contenedores DEBE ser registrado aquí para que futuros agentes IA y desarrolladores mantengan la integridad del sistema.**

## 1. Infraestructura (Docker)

La instancia está aislada de otros proyectos para garantizar rendimiento y estabilidad absoluta.

- **Contenedor Directus:** `javiermix_directus`
  - **Puerto Externo (Host):** `8056`
  - **Puerto Interno (Docker):** `8055`
  - **URL Pública:** `https://admin.javiermix.ar`
  - **Red:** `javiermix_network` (Externa)
- **Base de Datos:** `postgres:16-alpine` (`javiermix_db`)
  - **Almacenamiento:** Volumen persistente `postgres_data`.
  - **Conexión:** Interna dentro de la red Docker (`DB_CLIENT: pg`).
- **Capa de Cache:** `redis:7-alpine` (`javiermix_redis`)
  - **Propósito:** Caché de Directus y sistema de Likes con IP Tracking.

## 2. Capa de Conexión (Frontend)

Ubicación del archivo (ACTUAL): `/opt/javiermix/web_0504/src/conexion/directus.ts`.
Ubicación del archivo (OBSOLETA): `/home/ubuntu/prod/javiermix_web/frontend/conexion/directus.ts`.

### Redundancia de Red (Universal Client)
El sistema utiliza el `@directus/sdk` v11 con una lógica de autodetección:
1. **Detección de Entorno:** El cliente identifica si está en SSR. 
2. **Intento Interno:** Intenta conectar a `http://javiermix_directus:8055` (Red Docker).
3. **Fallback Automático:** Si la red interna es inaccesible (ej: desarrollo local fuera de Docker), el sistema conmuta automáticamente a `https://admin.javiermix.ar`, evitando el bloqueo de SSR que ocurría anteriormente.

### Capa de Conexión (Astro + SDK v11)
La lógica reside en `/src/conexion/directus.ts` y utiliza un **Singleton Manager**:

- **Singleton Client**: Centraliza la instancia del SDK para evitar múltiples reconexiones.
- **Detección Automática**: El sistema prueba la URL interna (`javiermix_directus`) y conmuta a la pública (`admin.javiermix.ar`) si falla en tiempo de ejecución (SSR Fallback).
- **Shim de Compatibilidad**: Se mantiene la función `fetchFromDirectus` como un puente (shim) hacia el SDK para que las páginas antiguas sigan operativas mientras se realiza la migración completa.
- **Tipado Intregrado**: Todas las llamadas al SDK utilizan las interfaces definidas en `src/types/directus.ts`.

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
- **Carpeta `Coleccion`**: (Sincronizada con Directus) Contiene subcarpetas nombradas por Serie. El sistema usa el nombre de la carpeta para categorizar las obras.
- **Regla de Mockups (_2)**: Los archivos con sufijo `_2` se filtran automáticamente de los resultados principales y se utilizan para el efecto de hover "Vista de Ambiente".

## 🛡️ Guía para Futuros Agentes
- **Regla de Oro:** Siempre que modifiques el archivo de conexión `directus.ts` en el servidor, DEBES ejecutar `docker compose up -d --build frontend` para que los cambios surtan efecto en el contenedor.
- **Nuevos Campos:** Si agregas campos a Directus, asegúrate de actualizar la política pública `abf8a154-5b1c-4a46-ac9c-7300570f4f17` para que el frontend pueda verlos.
