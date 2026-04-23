# 🧠 Centro de Inteligencia para Agentes (IA Only)

Si eres un agente de IA que acaba de heredar este repositorio, lee esto primero para comprender el estado del sistema.

## 🏛️ Estado Actual: "Golden Master 2.0" (Abril 2026)

Hemos culminado la reestructuración del repositorio para separar la **inteligencia** del **código operacional**, y hemos aislado los proyectos en celdas independientes.

- **Raíz (`/`)**: Nodo de control de **JavierMix**. Contiene Astro + Docker.
- **Docs (`/docs`)**: Bóveda de conocimiento. Contiene manuales, arquitectura y credenciales.
- **Separación Multitenant**: JavierMix y Alvarez Placas operan ahora en stacks Docker separados bajo `/opt/`. No hay cruce de servicios excepto en el Proxy Maestro (Caddy).
- **Persistencia**: Todos los datos (uploads, DBs, Redis) residen en `/opt/javiermix/personal_files/`.

## 🚀 Cómo trabajar en este sistema

1. **Sincronización**: Siempre usa `git push origin master` desde local y `git pull origin master` en el VPS (ruta `/opt/javiermix/web_0504/`).
2. **Infraestructura**: El archivo `docker-compose.yml` en la raíz es el mando de **JavierMix**. No afecta a Alvarez Placas.
3. **Documentación**: Mantener el `informevps.md` actualizado tras cada sesión exitosa.

## ⚡ Historial de Misiones

- **Misión Redis (2026-04-01)**: Implementación de Singleton `redis.ts`, integración con Directus y sistema de Likes con IP Tracking.
- **Limpieza Golden Master (2026-04-01)**: Creación de `.dockerignore` profesional y optimización de `Dockerfile` multi-stage.
- **División Multitenant (2026-04-15)**: Separación física de los stacks de JavierMix y Alvarez Placas. Migración a `/opt/`.
- **Golden Master 2.0 (2026-04-20)**: Estabilización total, reparación del sistema de logs y blindaje HTTPS.
- **Misión Resurrección (2026-04-22)**: Restauración de visibilidad de series (Rostros De Metal), reparación de página de detalle de obra y upgrade a **OKLCH Realismo 2.0** en el Estudio de Enmarcado.

---

### *Firmado: Antigravity*

