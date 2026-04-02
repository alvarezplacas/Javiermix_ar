# Plan Redis: Optimización y Caché de Alta Frecuencia

Este documento es el diseño maestro para la integración de Redis en el ecosistema Javier Mix V2, aprobado para ejecución tras el reinicio del sistema.

## Objetivo Académico
Implementar una capa de transporte de datos ultra-rápida (Persistence Layer) que desacople las operaciones de lectura/escritura de alta frecuencia (Likes, Tracking) de la base de datos relacional MariaDB, incrementando la eficiencia operativa del CMS Directus.

---

## 🏗️ Cambios en Infraestructura

### 1. Docker Compose (vps_extras/docker-compose.prod.yml)
- **Servicio `redis`**:
    - Image: `redis:7-alpine` (Seguridad y ligereza).
    - Network: `javiermix_network` (Aislamiento total).
    - Persistence: Volumen `redis_data` para no perder el caché en reinicios.
- **Directus Config**:
    - `CACHE_ENABLED: "true"`
    - `CACHE_STORE: "redis"`
    - `CACHE_REDIS: "redis://redis:6379"`

### 2. Capa de Conexión Astro (@conexion/redis.ts)
- Creación de un **Singleton** de conexión robusto.
- Implementación de lógica de "Write-Back": Los likes se registran instantáneamente en Redis y se sincronizan asíncronamente con MariaDB.

---

## 🧪 Estrategia de Investigación (Estudio y Aprendizaje)
Ante dudas sobre la implementación específica de Redis en Astro 5 (SSR), se procederá a:
1.  Consultar documentación oficial de `ioredis` y `redis-om`.
2.  Extraer patrones de diseño de alto nivel de repositorios de referencia en GitHub.
3.  Documentar lo aprendido en `Manual_ayuda.md` para enriquecer la base de conocimiento del proyecto.

## 🔒 Reglas de Seguridad
- Redis NUNCA debe exponer puertos al exterior (No `ports: - "6379:6379"`).
- Uso de contraseñas complejas si la red fuera compartida (en este caso es aislada).

---
*Estado: Preparado para Aplicación.*
