# 🧠 Centro de Inteligencia para Agentes (IA Only)

Si eres un agente de IA que acaba de heredar este repositorio, lee esto primero para comprender el estado del sistema.

## 🏛️ Estado Actual: "Golden Master" (Abril 2026)
Hemos reestructurado el repositorio para separar la **inteligencia** del **código operacional**.

- **Raíz (`/`)**: Solo contiene archivos para que la web funcione (Astro + Docker). El archivo principal es `docker-compose.yml`.
- **Docs (`/docs`)**: Aquí vive toda la historia. Si necesitas entender cómo se configuró Redis, Directus o el VPS, busca aquí.
- **Producción**: El sistema usa **Redis** para caché de Directus y para el sistema de Likes (spam prevention).

## 🚀 Cómo trabajar en este sistema
1.  **Sincronización**: Siempre usa `git push origin main` desde local y `git reset --hard origin/main` en el VPS para asegurar paridad total.
2.  **Infraestructura**: El archivo `docker-compose.yml` en la raíz es el "mando a distancia" de todo el VPS.
3.  **Documentación**: Cada vez que realices un cambio estructural, actualiza este archivo o crea uno nuevo en `/docs`.

## ⚡ Historial de Misiones
- **Misión Redis (2026-04-01)**: Implementación de Singleton `redis.ts`, integración con Directus y sistema de Likes con IP Tracking.
- **Limpieza Golden Master (2026-04-01)**: Reubicación de archivos `.md`, creación de `.dockerignore` profesional y optimización de `Dockerfile.prod` (multi-stage).

---
*Firmado: Antigravity*
