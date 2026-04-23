# 🔐 ACCESOS Y CONFIGURACIÓN MAESTRA DEL VPS (Actualizado: Abril 2026)

Este documento contiene las credenciales y rutas críticas del ecosistema **Javier Mix Ar** (Golden Master 2.0).

---

## 🖥️ 1. Servidor Principal (VPS Nova 8G)
- **IP Pública**: `144.217.163.13`
- **Usuario**: `root`
- **Contraseña SSH**: `Tecno/121212` (Confirmada Abril 2026)
- **Ubicación JavierMix**: `/opt/javiermix/web_0504/`
- **Ubicación AlvarezPlacas**: `/opt/alvarezplacas/`
- **Persistencia**: `/opt/javiermix/personal_files/`

---

## 🌐 2. Servicios Activos (Puertos y URLs)

| Servicio | URL / Host | Puerto | Credenciales |
| :--- | :--- | :--- | :--- |
| **Directus (CMS)** | `admin.javiermix.ar` | 8055 | `javier@mix.ar` / `JavierMix2026!` |
| **FileBrowser** | `archivos.javiermix.ar` | 8082 | `admin` / `JavierMix2026!` |
| **Estadísticas** | `stats.javiermix.ar` | 3000 | `admin` / `umami` |
| **Webmail** | `mail.javiermix.ar` | 8080 | `javier@mix.ar` / `JavierMix2026!` |

---

## 🗄️ 3. Bases de Datos (PostgreSQL 16)
- **Motor**: PostgreSQL 16 (Aislado en contenedor `javiermix_db`).
- **Usuario**: `root`
- **Contraseña**: `JavierMix2026!` (Configurada en `.env`).
- **Backup Path**: `/opt/javiermix/personal_files/backups/`.

---

## 🐙 4. Repositorios GitHub
- **JavierMix (Este Repo)**: [alvarezplacas/Javiermix_ar](https://github.com/alvarezplacas/Javiermix_ar)
- **Alvarez Placas**: [alvarezplacas/alvarezplacas_web](https://github.com/alvarezplacas/alvarezplacas_web) (Independiente).

---

## 🛡️ 5. Seguridad y DNS
- **Cloudflare**: DNS gestionado con SSL Full Strict.
- **Proxy Maestro**: Caddy (automatizado).
- **VPN**: Netbird (Mantenimiento requerido en el management stack).

---

## 🚑 6. Rescate (Panic Mode)
Si se pierde el acceso SSH:
1. Acceder al panel de **NutHost**.
2. Usar consola VNC para login directo.
3. Ejecutar script de rescate local: `node /opt/javiermix/web_0504/vps_rescue_v3.cjs`.

---
> [!CAUTION]
> No compartas este archivo. Es la llave maestra de la infraestructura Golden Master 2.0.
