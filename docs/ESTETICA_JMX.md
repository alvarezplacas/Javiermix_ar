# 🏮 MANUAL DE ESTÉTICA Y EXCELENCIA JMX 🏮

Este documento es de lectura **OBLIGATORIA** para cualquier agente o desarrollador que intervenga el Motor JMX. La estética de este sitio no es negociable; es una construcción de marca que evoca la sensación de entrar a una galería de arte física de primer nivel.

## 1. La Regla de Oro: Pantalla 50/50
La visualización de obra en escritorio **DEBE** mantener siempre una columna dividida:
- **Izquierda (Fija):** Contenedor de la imagen con fondo `#0d0d0d`. La obra debe flotar con `drop-shadow` profundo.
- **Derecha (Scroll):** Información, historia y compra sobre fondo `#050505`.

## 2. Tipografía y Jerarquía
- **Títulos de Obra:** `font-family: var(--font-primary)`. Tamaño sugerido `3.2rem`.
- **Precios:** `font-weight: 300`, `font-size: 3.5rem`. La moneda es siempre **$ ARS**.
- **Labels UI:** Letra pequeña (`0.6rem`), todo en mayúsculas, con `letter-spacing: 3px`.

## 3. Paleta de Colores "Luxury Gold"
- **Acento Gold:** `#dcb14a` (Oro Javier Mix). Se usa para estados `active`, bordes de botones secundarios y labels de serie.
- **Fondos:** Se prohíbe el uso de `#000` puro absoluto en áreas de lectura. Usar `#050505` para profundidad.
- **Bordes:** Siempre sutiles, `rgba(255,255,255,0.05)` o `rgba(255,255,255,0.1)`.

## 4. Interactividad (UX de Guante Blanco)
- Las transiciones no deben ser bruscas. Usar `cubic-bezier(0.19, 1, 0.22, 1)` para un efecto de "deslizamiento" premium.
- El hover en botones secundarios debe ser una transición de borde dorado a fondo dorado sólido con texto negro.

## 5. Prohibiciones Críticas
- **PROHIBIDO** alterar el layout 50/50 sin aprobación expresa.
- **PROHIBIDO** simplificar los textos de "Términos" o "Ficha Técnica".
- **PROHIBIDO** usar componentes de UI genéricos (Bootstrap, Tailwind básico) sin estilizarlos bajo esta norma.

---
*Este manual se construye con cuidado porque valoramos la experiencia y la sensación de excelencia.*
