# 🧠 Ayuda Memoria 01: Estado de Migración Javier Mix V2
---

**Fecha: 24/03/2026**

Este documento sirve como resumen ejecutivo de lo realizado y el estado actual para retomar el trabajo sin fricciones.

## 📍 Estado del Proyecto

Hemos migrado exitosamente el sitio de V1 (`src_v2026`) a **V2** (`h:\Javiermix_web_v2`) con una arquitectura modular y **totalmente desacoplada de la base de datos local para la parte pública**.

### 🏗️ Estructura Lograda

- **/backend**: Lógica de base de datos (Drizzle ORM), schemas (Artworks, Orders, Collectors) y API de órdenes.
- **/frontend**: Astro 5 SSR. Ahora utiliza **exclusivamente la API REST de Directus** para Galería, Home y Revista (Evita errores `ECONNREFUSED` en local).
- **/public**: Assets sincronizados y videos en carpeta `home` de Directus.
- **/doc**: Repositorio de planes, guías (Handover, Automatización) y este ayuda memoria.

## 🔐 Infraestructura (VPS & CMS)

- **Directus URL**: `https://admin.javiermix.ar`
- **Sincronización**: Flujo de metadatos automático configurado en Directus para extraer datos EXIF de las fotos (`Artworks`).
- **Assets**: Uso intensivo de `/assets/ID` de Directus para imágenes y videos.

## 🎨 Lógica Visual "Extreme Order"

1. **Home Hero (2s)**: La imagen de portada se desvanece a los 2 segundos para dar paso a los videos de fondo.
2. **Slideshow Series (3s)**: Fondos de cabecera en colecciones rotan cada 3 segundos.
3. **Efecto Hover `_2`**: Sistema inteligente que empareja `JMX_xxxx.avif` con `JMX_xxxx_2.avif` para vistas de ambiente/variantes.
4. **Handover**: Guía específica creada en `/frontend/DIRECTUS_FRONTEND_GUIDE.md` para el agente de frontend.

## 🛠️ Temas Pendientes / Próximos Pasos
- **Estética Final**: El agente de frontend se encargará de pulir la UI/UX sobre la base de API estable que he dejado.
- **Despliegue**: Una vez finalizada la UI, se debe subir el código al VPS y reiniciar los servicios con `docker-compose up -d --build`.
- **Interacciones**: Pendiente implementar el sistema de "Likes" persistente (si se requiere funcional).

---
> "Todo está ordenado de manera extrema para la correcta comprensión y escalabilidad."
