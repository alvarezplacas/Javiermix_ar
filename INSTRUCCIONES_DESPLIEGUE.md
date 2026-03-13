# 🚀 GUÍA DE ACTUALIZACIÓN AL VPS - ALVAREZ PLACAS

Este archivo es para recordarte (y recordarme) cómo subir los cambios que hagamos en este diseño directamente al servidor.

## 🛠️ Cómo subir cambios (Flujo Automático)

No necesitas tocar nada del servidor ni volver a la carpeta anterior. Solo sigue estos pasos aquí:

1.  **Hacer cambios**: Editamos el diseño, las fotos o los textos en esta carpeta (`E:\Alvarezplacas`).
2.  **Enviar a GitHub**: Una vez que terminemos de pulir algo, usaremos los comandos de Git:
    *   `git add .`
    *   `git commit -m "Mejoras de diseño"`
    *   `git push origin main`
3.  **Magia Automática**: Al hacer el `push`, el VPS detecta el cambio y se actualiza solo en **alvarezplacas.com.ar**.

---

## 🔗 Datos de Consulta Rápida

- **URL Pública**: [alvarezplacas.com.ar](http://alvarezplacas.com.ar)
- **IP del VPS**: `144.217.163.13`
- **Carpeta en el VPS**: `/home/ubuntu/alvarezplacas_web`
- **Carpeta Maestra de Accesos**: Si alguna vez olvidas una clave, están todas en:
  `E:\Javiermix_web\vps_extras\V_ACCESOS_Y_CONFIGURACION_VPS.md`

---
> [!TIP]
> Cada vez que abras esta carpeta para trabajar, recuerda que lo que hagamos aquí se sube a internet en segundos simplemente usando Git.
