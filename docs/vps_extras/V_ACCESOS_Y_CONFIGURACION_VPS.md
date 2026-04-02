# 🔐 ACCESOS Y CONFIGURACIÓN MAESTRA DEL VPS (Actualizado: 12/03/2026)

Este documento es confidencial y contiene todas las credenciales y configuraciones establecidas para los sitios de **Alvarez Placas** y **Javier Mix**.

---

## 🖥️ 1. Servidor Principal (VPS Nova 8G)
- **IP Pública**: `144.217.163.13`
- **Usuario**: `root`
- **Contraseña SSH**: `JavierMix2026!`
- **Ubicación de Proyectos**: `/home/ubuntu/`

---

## 🌐 2. Servicios Activos (Puertos y URLs)

| Servicio | URL Recomendada | IP Directa | Contraseña / Admin |
| :--- | :--- | :--- | :--- |
| **Nube (FileBrowser)** | `archivos.javiermix.ar` | `IP:8082` | `admin` / `JavierMix2026!` |
| **Estadísticas (Umami)** | `stats.javiermix.ar` | `IP:3000` | `admin` / `umami` (Default) |
| **Proxy (NPM)** | `-` | `IP:81` | (Panel de control de SSL/Nginx) |

---

## 🎨 3. Sitios Web y Dashboards

### 🏢 AlvarezPlacas.com.ar
- **GitHub**: [alvarezplacas/alvarezplacas_web](https://github.com/alvarezplacas/alvarezplacas_web)
- **Actualización**: Automática al hacer `push` a GitHub.

### 📸 Javiermix.ar
- **GitHub**: [alvarezplacas/javiermix_web](https://github.com/alvarezplacas/javiermix_web)
- **Dashboard Backend**: `https://javiermix.ar/admin` (o similar)
- **Contraseña Editor**: **`Tecno121212`** (Actualizada a pedido del usuario)
- **Actualización**: Automática al hacer `push` a GitHub.

---

## 🗄️ 4. Bases de Datos (Docker)
- **Umami Database**: `umami_db` (MariaDB)
- **Javiermix Database**: `javiermix_db` (MariaDB)
- **Usuario DB**: `root`
- **Contraseña DB**: `JavierMix2026!` (Configurada en archivos `.env`)

---

## 🐙 5. Configuración de GitHub (Secrets)
Para que los sitios se actualicen solos, cada repositorio en GitHub tiene estos "Secrets" configurados:
1. `SSH_HOST`: `144.217.163.13`
2. `SSH_PASSPHRASE`: `JavierMix2026!`
3. `SSH_PRIVATE_KEY`: (La llave generada el 12/03/2026 para conexión segura sin clave).

---

## 🚑 6. En Caso de Emergencia (Sin Acceso)
Si el servidor deja de responder o la clave root falla:
1. Entrar al panel de **NutHost**.
2. Ir a **Rescue Reboot**.
3. Ver la clave temporal en la consola **VNC**.
4. Seguir los pasos de recuperación detallados en: [vps_credentials_history.md](file:///e:/Javiermix_web/vps_extras/vps_credentials_history.md)

---

> [!CAUTION]
> No compartas este archivo. Si cambias alguna contraseña importante, actualízala aquí también para no perder el acceso a futuro.
