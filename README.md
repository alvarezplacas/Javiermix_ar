# Javiermix Art Experience - Abril 2026

## 🚀 Situación Actual del Proyecto

Estamos en la fase final de refinamiento del **Gabinete de Experimentación**. La infraestructura en el VPS es estable y estamos centrados en la fidelidad visual de las experiencias inmersivas.

### 🏛️ Gabinete de Experimentación (Portal)
- **Estado**: ACTIVO.
- **Estética**: Interfaz técnica con rejillas de coordenadas y metadatos de specs.
- **Navegación**: Enlace de "VOLVER A LA CENTRAL" operativo.

### 🌌 Infinity Gallery 3D (Experimento 01)
- **Estado**: ESTABLE.
- **Mejoras**: Efecto de flotación orgánica, Auto-Play con sonido ambiente y transición inteligente de scroll.

### 🖼️ Royal Museum (Experimento 02)
- **Estado**: EN RECONSTRUCCIÓN (Iluminación y Texturas).
- **Objetivo**: Máximo realismo en la presentación de obras sobre paredes de mármol, cemento y colores premium (Borgoña).
- **Iluminación**: Implementando focos de galería "Spotlight" para eliminar efectos de resplandor artificial y lograr una estética digna de museo.

### 🔗 Integración Directus
- Los fondos de los ambientes se cargan dinámicamente desde Directus, permitiendo al artista cambiar la "piel" de la galería sin tocar código.

---

## 🛠️ Comandos de Despliegue (VPS)
```bash
cd /opt/javiermix/web_0504
git pull origin master
docker compose up -d --build web_javiermix
```