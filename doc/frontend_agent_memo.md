# Ayuda Memoria: Arquitectura Visual JHM (V2 Master)

Este documento sirve como guía de referencia para cualquier intervención futura en el frontend de la web de Javier Mix. Resume las decisiones estéticas de nicho ("Premium Dark / Fine Art") y las reparaciones técnicas críticas realizadas.

## 1. Identidad Visual JHM
- **Paleta de Autor (HSL)**: Basada en el sistema original V1. 
    - **Travertine Light** (#F2EFE9): Usado para textos de baja fatiga.
    - **Onyx Deep** (#0D0D0D): Fondo maestro.
    - **Gold Master** (#C5A059): Para elementos de jerarquía (títulos, bordes de solapas).
    - **Burgundy JHM** (#BF1534): Acento sutil (ej. Corazón likes).
- **Consigna de Bajo Contraste**: Nunca usar blanco puro (#FFF) para textos. Preferir siempre la paleta Travertine para mantener la elegancia de galería.

## 2. Home: Experiencia Inmersiva
- **Hero Master Transition**: Al cargar la página, una imagen estática preside durante 2s, luego se desvanece (blur fade) para revelar un **Bucle Infinito Mixto** (fotos y videos mp4 de Directus).
    - **Tiempos**: 6s por foto, duración natural (máx 10s) para videos.
    - **Máscara Perimetral**: Al 92% de visibilidad central para asegurar nitidez del detalle de la obra mientras se funde con el fondo.
- **Identidad Tipográfica**: Título principal "Memoria y Potencia" en Dorado (#C5A059), peso 300, y legibilidad reforzada (+1pt en todo el cuerpo de texto).

## 3. Página de Obra: Interacciones Master
- **Zoom Cinematográfico (0.8s)**: Transición ultra-suave (`cubic-bezier(0.19, 1, 0.22, 1)`) para explorar el detalle.
- **Corazón JHM c/Contador**: Botón de likes rojo traslúcido (`rgba(191, 21, 52, 0.2)`) con contador integrado a la izquierda de la obra.
- **Solapas (Tabs)**: Diseño envolvente con bordes Gold envolventes, recuperando el look "analógico" de la V1.

## 4. Robustez de Contenido
- **Revista Fallback**: Implementación de iconos de cámara/foto automáticos si un artículo en Directus no dispone de `featured_image`.
- **Navegación Dinámica**: Rutas SSR en `/revista/[slug].astro` calibradas para leer `Astro.params.slug` y evitar redirecciones erróneas.

---
**Nota para el Agente**: Respetar siempre el balance entre la "fuerza visual" y el "minimalismo de nicho". No añadir decoraciones innecesarias; dejar que la obra fotográfica sea el único referente.
