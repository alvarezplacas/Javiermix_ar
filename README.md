# 📸 Javier Mix V2 - Golden Master 2.0

Repositorio Maestro para la web de **JavierMix Ar**, el nodo de control central de la infraestructura fotográfica fine art.

## 🏛️ Arquitectura del Proyecto
Este proyecto utiliza un stack moderno y optimizado:
- **Frontend**: Astro 6 (con transiciones de vista y SSR).
- **CMS**: Directus v11.17.2 (SDK v11).
- **Caché/Likes**: Redis 7 (con IP Tracking para prevención de spam).
- **Base de Datos**: PostgreSQL 16.
- **Analíticas**: Umami.
- **Despliegue**: Docker con celdas aisladas en `/opt/javiermix/`.

## 🚀 Protocolo de Despliegue (IA & Manual)
Para garantizar la estabilidad del sistema, los cambios deben seguir este flujo exacto:

1.  **Local Development**: Realizar cambios en la máquina local (`d:\web_javiermix\JAVIERMIX-AR-0504`).
2.  **Git Push**: `git commit -m "feat/fix: descripcion"` y luego `git push origin master`.
3.  **VPS Pull**: Acceder al VPS y en la ruta `/opt/javiermix/web_0504/` ejecutar:
    ```bash
    git pull origin master
    ```
4.  **Rebuild**: Reconstruir el contenedor para aplicar cambios de SSR y Assets:
    ```bash
    docker compose up -d --build web_javiermix
    ```

> [!IMPORTANT]
> **NO EDITAR** archivos directamente en el VPS. Esto genera conflictos de Git que rompen el flujo de despliegue.

## 🏛️ Reglas de Oro del SDK (Directus v11)
Para futuras IAs trabajando en este repo, seguir estas reglas para evitar errores 404/500:

1.  **Colecciones del Sistema**: Directus v11 restringe `readItem` sobre colecciones como `directus_files` o `directus_folders`. 
    *   **MAL**: `readItem('directus_files', id)`
    *   **BIEN**: `readFiles({ filter: { id: { _eq: id } }, limit: 1 })`
2.  **Paginación**: Siempre incluir `limit: -1` al leer carpetas o archivos para asegurar que se obtengan todos los elementos (especialmente en catálogos).
3.  **Aislamiento de Redis**: El cliente de Redis debe ser `server-only`. No importar módulos de Redis en componentes que se hidraten en el cliente para evitar fallos de compilación de Vite.

## 📂 Documentación Adicional
- **[Manual de Agentes](./docs/README_AGENTES.md)**: Historial de misiones y secretos técnicos.
- **[Informe VPS](./docs/informevps.md)**: Mapa de puertos e infraestructura.

---
*Firmado: Antigravity*