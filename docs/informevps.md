# 🛰️ Informe de Estado VPS - Golden Master 2.0 (Actualizado)

Este informe refleja el estado real y operativo tras la separación total de los ecosistemas **JavierMix** y **Alvarez Placas**.

## 📊 Salud del Sistema
- **CPU**: Estable (Cargas < 15%)
- **RAM**: 8GiB Total (~3.5GiB en uso por todos los stacks)
- **Disco**: 72GiB (~22GiB ocupados)
- **Status General**: ✅ Todos los servicios críticos en ejecución (Up).

## 🏛️ Estructura Multitenant (Celdas /opt/)

### 📸 Nodo 1: JavierMix (Comando Central)
Ubicación: `/opt/javiermix/web_0504/`

| Contenedor | Imagen | Estado | Puertos / Notas |
| :--- | :--- | :--- | :--- |
| `javiermix_web` | `web_javiermix:latest` | **Up** | Puerto 4321 (interno) |
| `javiermix_directus` | `directus:11.17.2` | **Up** | Puerto 8055 (interno) |
| `javiermix_db` | `postgres:16-alpine` | **Up** | Puerto 5432 (interno) |
| `javiermix_redis` | `redis:7-alpine` | **Up** | Puerto 6379 (interno) |
| `javiermix_stats` | `umami:postgresql` | **Up** | Puerto 3000 (interno) |
| `javiermix_files` | `filebrowser:latest` | **Up** | Puerto 8082 (público) |

### 🏢 Nodo 2: Alvarez Placas (Aislado)
Ubicación: `/opt/alvarezplacas/` (Gestionado de forma independiente)

| Contenedor | Imagen | Estado | Función |
| :--- | :--- | :--- | :--- |
| `alvarezplacas_web` | `node:22-alpine` | **Up** | Frontend Astro |
| `alvarezplacas_v16` | `directus:11.1.0` | **Up** | Backend Directus |
| `alvarezplacas_db_v16` | `postgres:16-alpine` | **Up** | Base de Datos |
| `alvarezplacas_files` | `filebrowser:latest` | **Up** | Gestión de archivos (4326) |

### 🛡️ Infraestructura Global
- **Caddy Proxy**: Centralizado. Gestiona SSL (`admin.javiermix.ar`, `alvarezplacas.com.ar`).
- **Mail Stack**: `docker-mailserver` + `snappymail` (Operativos en puerto 8080).
- **Redes**: Redes Docker aisladas (`javiermix_internal`, `alvarezplacas_internal`).

## 🌐 Puertos Críticos Escuchando
- **80/443**: Caddy (Entrada Maestra)
- **8080**: Snappymail (Webmail)
- **8082**: JavierMix Filebrowser
- **4326**: Alvarez Placas Filebrowser
- **22**: SSH (Seguro)

---
**Nota para Agentes**: No intentar modificar la configuración de un nodo desde el otro. La separación es física y lógica para evitar colisiones de dependencias.

*Actualizado por Antigravity - 2026-05-02*
