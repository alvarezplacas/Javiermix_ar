# Registro de Recuperación y Credenciales VPS

Este documento contiene los puntos clave de acceso y el historial de recuperación del servidor VPS Nova 8G.

## 🔑 Credenciales Actuales (Marzo 2026)

- **IP del Servidor**: `144.217.163.13`
- **Usuario SSH**: `root`
- **Contraseña SSH**: `JavierMix2026!` (Actualizada el 12/03/2026)
- **Panel NPM**: `http://144.217.163.13:81`
- **Base de Datos (MariaDB)**: `JavierMix2026!` (Según archivo .env)

---

## 🛠️ Proceso de Recuperación (Modo Rescate)

En caso de perder acceso nuevamente, este fue el método exitoso:

1. **Activar Modo Rescate**: En el panel de NutHost, seleccionar "Rescue Reboot".
2. **Obtener Clave Temporal**: La clave aparece en la consola VNC de NutHost.
3. **Acceso vía SSH**: `ssh root@144.217.163.13` (usando la clave temporal).
4. **Reseteo de Clave y Arreglo SSH**:
   - Montar disco: `mount /dev/sdb1 /mnt`.
   - Entrar al disco: `chroot /mnt`.
   - **Cambiar clave**: `echo 'root:JavierMix2026!' | chpasswd`.
   - **Habilitar Password Login**: 
     - `sed -i 's/^#?PasswordAuthentication .*/PasswordAuthentication yes/' /etc/ssh/sshd_config`
     - `sed -i 's/^#?PermitRootLogin .*/PermitRootLogin yes/' /etc/ssh/sshd_config`
5. **Salir y Reiniciar**: Desmontar todo, salir del modo rescate en el panel y reiniciar normal.

> [!NOTE]
> Se habilitó `PasswordAuthentication yes` porque se sospechaba que el servidor solo aceptaba llaves SSH (Keys), lo cual bloqueaba nuestro acceso manual aunque la clave fuera correcta.

---

## 📜 Historial de Intentos Fallidos
*Claves antiguas que dejaron de funcionar o fueron erróneas:*
- `Tecno121212`
- `3L3X1T0LL3G0!#@a`
- `VxWSuquGxmsF`
