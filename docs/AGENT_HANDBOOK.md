# 🤖 Javier Mix - Agent Handbook (v1.0)

Este documento es una guía técnica para agentes de IA que trabajen en este repositorio. Ayuda a entender la arquitectura desacoplada y el flujo de datos sin necesidad de investigación previa.

## 🏗️ Arquitectura

El sitio es una aplicación **Astro 5 (SSR)** integrada con **Directus CMS** y una base de datos **MySQL** residual.

- **Frontend**: Carpeta `src/`. Usa Astro con soporte SSR para contenido dinámico.
- **CMS**: Directus Cloud (`https://admin.javiermix.ar`).
- **DB**: MySQL local (Drizzle ORM) para el sistema de Likes y Tracking de IP.

## 📁 Estructura de Datos (Directus)

- **Series**: Se mapean directamente desde las **Folders** dentro de la carpeta raíz "Catalogo".
- **Obras**: Se mapean desde los **Files** dentro de cada carpeta de serie.
- **Detalle Extendido**: La colección `artworks` en Directus contiene los metadatos técnicos (cámara, lente, precios por tamaño) vinculados por el campo `filename` (que coincide con `filename_download` del archivo).

## 🔌 Capa de Conexión (`src/conexion/directus.ts`)

Toda la comunicación con Directus DEBE pasar por la función `fetchFromDirectus`.

- Implementa una lógica de **Redundancia (Fallback)**: Intenta conectar primero por la red interna de Docker (`http://javiermix_directus:8055`) y si falla, usa la URL pública.
- Requiere el **Static Token** configurado en el archivo.

## 💡 Reglas de Oro para Intervenir

1. **Rutas @**: Usa siempre los alias configurados (`@components`, `@conexion`, `@layouts`).
2. **Estética**: El sitio sigue una estética de "Galería Premium Dark". No uses Tailwind ni colores genéricos.
3. **Optimización**: Las imágenes se sirven a través del endpoint de assets de Directus con parámetros de optimización (`?width=...&format=avif`).

---
*Ultima actualización: 2026-04-02 by Antigravity (Academic Persona Enabled)*

### 📝 Directiva de Comportamiento (Orden de Reinicio)
En el próximo inicio de sesión, el agente debe:
1. **Persona Académica**: Actuar con un nivel técnico de posgrado, priorizando la investigación y el diseño de arquitectura sólida.
2. **Estudio Activo**: Ante dudas, tiene permiso para realizar búsquedas web exhaustivas, estudiar repositorios de referencia y guardar el conocimiento nuevo en `Manual_ayuda.md`.
3. **Misión Redis**: Ejecutar el `plan_Redis.md` integrando Redis en el stack de Docker y optimizando la capa de comunicación del frontend.

> [!NOTE]
> **Informe de Fecha**: Fecha de actualización: 2026-03-29 por el anterior agente. Fecha actual: 2026-04-02.
