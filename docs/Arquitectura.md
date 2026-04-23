# 🏛️ Arquitectura JavierMix Golden Master 2.0 (Abril 2026)

Este documento detalla las decisiones técnicas y descubrimientos realizados durante la modernización y estabilización de la infraestructura.

## 📡 Conectividad Directus (Estandarización v11)

### 🚀 El Descubrimiento Crítico: `readFiles` vs `readItems`
En Directus v11, el SDK es estricto con las **Colecciones del Sistema** (core collections). 
- **Error**: `Cannot use readItems for core collections`.
- **Solución**: Para `directus_files` y `directus_folders`, se DEBE usar las funciones específicas `readFiles()` y `readFolders()`. No se pueden pedir mediante el método genérico.

### 🔐 Blindaje de Acceso (Folders Metadata)
Para que el sistema sea dinámico (Series automáticas), el rol **Public** en Directus debe tener permiso de **Lectura (Read)** activado en `System Collections -> Folders`. Sin esto, las carpetas son invisibles para la API pública.

### 📍 IDs Fijos para Alta Disponibilidad
Para secciones críticas que no deben fallar nunca, hemos hardcodeado los IDs de carpeta:
- **Home**: `f74cc3cc-4fce-46e4-8efd-477c65c79e67`
- **Laboratorio**: `d69266c5-90b3-467f-af9c-de4c7fa02f46` (Corregido de error tipográfico previo).

---

## 🏗️ Infraestructura de Red (Docker & Caddy)

### 🛰️ Resolución Interna
Se ha estandarizado el uso de **URLs Internas** para la comunicación entre contenedores:
- `INTERNAL_DIRECTUS_URL`: `http://javiermix-directus:8055`
- **Nota**: Se prefirió el uso de guiones (`-`) sobre guiones bajos (`_`) para evitar problemas de resolución de nombres en ciertos proxies y versiones de Docker.

### 🥊 Conflictos de Puertos
Existen dos instancias de Astro conviviendo en el VPS (`javiermix` y `alvarezplacas`). Ambas exponen el puerto `4321` internamente.
- **Solución**: El aislamiento se gestiona mediante la red de Docker y Caddy, que enruta por nombre de dominio (`javiermix.ar`) al contenedor correcto.

---

## 💻 Desarrollo y Compilación (Vite / Astro)

### 🛡️ Aislamiento de Dependencias (Server vs Client)
Uno de los mayores retos fue el error de compilación al intentar usar el Dashboard.
- **Problema**: Vite intentaba meter el cliente de Redis (`ioredis`) dentro del bundle del navegador.
- **Solución**: Se creó `src/conexion/likes.ts` para aislar funciones que dependen de Redis. `directus.ts` queda libre de dependencias de servidor pesadas para que el navegador pueda importarlo sin errores.

---

## 🎨 Sistema de Diseño 2026

### 🌈 Colores OKLCH y Fallbacks
Se utiliza el estándar de color perceptual `OKLCH` para degradados premium. 
- Se han incluido **fallbacks en hexadecimal** en `global.css` para asegurar que en navegadores antiguos (o si falla la carga de estilos modernos) la web siga siendo legible y elegante (Oro/Borgoña).

### 🎞️ Scroll-Driven Animations
El Laboratorio utiliza la API de `view-timeline` para animaciones basadas en el scroll, eliminando la necesidad de pesadas librerías de JS como GSAP.
