# 📘 Manual de Operaciones: Golden Master 2.0

Este manual define los protocolos de actuación para Agentes de IA en la infraestructura **JavierMix Ar**.

## 🏗️ La Estructura de Celdas
El servidor ha sido segmentado en celdas aisladas dentro de `/opt/`. 
- **Celda JMX**: `/opt/javiermix/web_0504/` (Este repositorio).
- **Celda AP**: `/opt/alvarezplacas/` (Independiente).

### 🚨 Protocolo de Emergencia
Si un servicio cae (ej. Directus o Redis):
1. **Acceder** a `/opt/javiermix/web_0504/`.
2. **Ejecutar** `docker compose logs -f [servicio]` para identificar el error.
3. **Reiniciar** con `docker compose up -d [servicio]`.
4. **No intervenir** en la celda `/opt/alvarezplacas/` a menos que se solicite explícitamente.

## 📊 Monitoreo y Salud
- **Dashboard**: `admin.javiermix.ar/dashboard` (Requiere Token).
- **Logs**: Revisar periódicamente el archivo `informevps.md`.
- **Base de Datos**: PostgreSQL 16 aislada. No hay conexión directa entre los esquemas de JMX y AP.

## 🛡️ Seguridad de Datos
- **Backups**: Los volúmenes persistentes residen en `/opt/javiermix/personal_files/`.
- **Redis**: Sistema de likes protegido por IP Tracking en `directus.ts`.

---
*Manual versión 2.0 - 2026-04-21*
