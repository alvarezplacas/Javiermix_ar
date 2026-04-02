# 🏗️ Arquitectura Javier Mix V2 (Golden Master)

Este documento detalla la estructura técnica y el flujo de datos del proyecto, diseñado para ser escalable, modular y fácil de navegar para agentes de IA.

## 🔗 Sistema de Conexiones (Path Aliasing)

Para mantener la limpieza del código y facilitar la escalabilidad, se DEBEN usar los alias configurados en `tsconfig.json`. Está PROHIBIDO usar rutas relativas profundas (ej: `../../../`).

| Alias | Ruta Destino | Propósito |
| :--- | :--- | :--- |
| **`@conexion/*`** | `src/conexion/*` | Capa de datos (Directus, MySQL, Drizzle). Única fuente de verdad. |
| **`@components/*`** | `src/components/*` | Componentes UI reutilizables (Botones, Cards, Modales). |
| **`@layouts/*`** | `src/layouts/*` | Plantillas maestras (MainLayout, DashboardLayout). |
| **`@utils/*`** | `src/utils/*` | Funciones auxiliares (formateo de fechas, resolución de URLs). |
| **`@styles/*`** | `src/styles/*` | Tokens de diseño, variables HSL y CSS global. |

---

## 🏗️ Capas de la Aplicación

### 1. Capa de Visualización (Astro 5 SSR)
- **Framework**: Astro 5 en modo **SSR (Server-Side Rendering)** para asegurar datos siempre frescos del CMS.
- **Páginas**: Ubicadas en `src/pages/`. Siguen una estructura lógica por "Jurisdicciones" (Galería, Revista, Dashboard).

### 2. Capa de Conexión (El "Cerebro")
- **Archivo Crítico**: [`src/conexion/directus.ts`](file:///d:/web_javiermix/JAVIERMIX-AR-2903/src/conexion/directus.ts)
- **Lógica**: Implementa un sistema de redundancia (Fallback).
    - Primero intenta conectar por la red interna de Docker (`javiermix_directus:8055`).
    - Si falla, usa la URL pública configurada en el `.env`.
- **Regla**: El frontend no hace `fetch` directo a URLs externas; usa las funciones exportadas desde `@conexion`.

### 3. Capa de Datos (Híbrida)
- **Directus CMS**: Gestión de Obras, Series, Artículos y Archivos.
- **MySQL (Drizzle)**: Para operaciones de alta frecuencia o locales:
    - Registro de **Likes**.
    - Tracking de **IPs** (Prevención de spam).

### 4. Capa de Estilo (Premium Dark)
- **CSS**: Vanilla CSS con variables HSL.
- **Colores Estrella**:
    - Gold: `--color-accent` (`#bd9b53`)
    - Onyx Deep: `--color-onyx-deep` (`#050505`)

---

## 📁 Flujo de Escalabilidad

Para añadir una nueva funcionalidad (ej: "Tienda"), el flujo estándar es:
1. Definir la colección en **Directus**.
2. Crear el conector en `@conexion/tienda.ts`.
3. Crear los componentes en `@components/tienda/`.
4. Crear la ruta en `src/pages/tienda/` usando `@layouts/`.

---
> [!IMPORTANT]
> **Actualización para Agentes**: Si vas a modificar una conexión a la base de datos, empieza siempre analizando `@conexion/`. Si vas a cambiar un visual, empieza por `@styles/`.
