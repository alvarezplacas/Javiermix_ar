# 🚀 Guía de Despliegue en VPS - Javier Mix

Este proyecto está preparado para ejecutarse en un servidor VPS usando **Node.js** y **Astro SSR**.

## 📦 Requisitos en el Servidor
- Node.js v18+ 
- NPM o PNPM
- Una instancia de Directus accesible (Cloud o Docker)

## 🛠️ Pasos para Desplegar (Zona JAVIERMIX-AR-2903)

1. **Subir archivos**: Copia todo el contenido de esta carpeta a tu VPS.
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Variables de Entorno**: Asegurate que tu archivo `.env` en el servidor tenga:
   - `DIRECTUS_URL`: Tu URL pública.
   - `DIRECTUS_TOKEN`: El token secreto que ya incluí.
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`: Credenciales de tu MySQL.

4. **Construir el sitio**:
   ```bash
   npm run build
   ```
5. **Iniciar Producción**:
   ```bash
   node ./dist/server/entry.mjs
   ```

## 🐋 Uso con Docker (Opcional)
También he incluido un `Dockerfile.prod` en la raíz si prefieres un despliegue contenerizado.
