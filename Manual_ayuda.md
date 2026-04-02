# 📓 Manual de Ayuda y Mejores Prácticas (V2)

Este documento es una guía viva para que los agentes de IA y desarrolladores mantengan la integridad y escalabilidad del ecosistema Javier Mix + Directus.

## 🏗️ Arquitectura Recomendada (V2)

Basado en las tendencias de 2024-2026, la estructura óptima para este VPS es la **Contenedorización Total**.

### 1. Organización del Sistema de Archivos
Evita colocar proyectos sueltos en `/home/ubuntu`. Usa una jerarquía clara:
- `/home/ubuntu/prod/`: Aplicaciones de cara al público (Astro).
- `/home/ubuntu/infra/`: Servicios de soporte (Nginx Proxy Manager, Directus, Redis).
- `/home/ubuntu/backups/`: Volúmenes y dumps de base de datos.

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
*Ultima actualización: 2026-03-29 by Antigravity*
*Mensaje para el próximo agente: Respeta el alias @conexion y no modifiques alvarezplacas.*
