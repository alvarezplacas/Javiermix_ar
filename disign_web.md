# 🎨 Sistema de Diseño: Javier Mix V2

Este documento define el lenguaje visual y los estándares estéticos "Premium Dark" del proyecto. Debe ser la referencia para cualquier nuevo componente o página.

## 🌈 Paleta de Colores (Design Tokens)

Se basa en una estética de **Galería de Arte de Lujo**, usando tonos de Oníx, Travertino y acentos en Oro.

### 🏷️ Colores Principales
- **Gold (Acento)**: `#DCB14A` (`hsl(44, 69%, 58%)`) - Usado para botones `btn-premium`, iconos activos y resaltados.
- **Burgundy (Puntual)**: `#BF1534` (`hsl(349, 70%, 45%)`) - Usado para elementos de contraste o "likes" intensos.
- **White (Pure)**: `#FFFFFF` - Texto de títulos y elementos de alta jerarquía.

### 🌑 Escala de Negros (Onyx)
- **Onyx Deep**: `#050505` - Fondo principal del sitio.
- **Onyx Soft**: `#111111` - Fondos de tarjetas y contenedores secundarios.
- **Onyx Charcoal**: `#0D0D0D` - Superposiciones y capas de opacidad.

### 🗿 Tonos Piedra (Travertine)
- **Travertine Light**: `#D9CFCC` - Texto principal del cuerpo.
- **Travertine Mid**: `#A69C94` - Texto secundario, leyendas y "muted".
- **Travertine Dark**: `#595351` - Bordes sutiles y separadores.

---

## 🔡 Tipografía (Typography)

Usamos un sistema de fuente dual para separar la narrativa de lo técnico.

- **Primaria (Narrativa/Lujo)**: `Cormorant Garamond` (Serif). 
    - Usada en: Títulos (`h1` a `h3`), frases de impacto y citas.
    - Estilo: Letras elegantes, con aire clásico pero moderno.
- **Secundaria (Técnica/UI)**: `Montserrat` (Sans-serif). 
    - Usada en: Menús, botones, párrafos de lectura larga y datos técnicos de obras.
    - Estilo: Limpio y legible en pantallas de alta resolución.

---

## 📂 Formatos de Archivo Soportados

Para mantener el rendimiento "Golden Master", se exigen los siguientes formatos:

1. **Imágenes**: **`.avif`** (Obligatorio para fotografías). Ofrece la mejor relación calidad/peso para arte fino.
2. **Video**: **`.mp4`** (Optimizado con codec H.264/H.265). Usado en backgrounds de Hero y loops infinitos.
3. **Logos e Iconos**: **`.svg`**. Para asegurar nitidez absoluta en cualquier nivel de zoom.
4. **Miniaturas (Fallback)**: `.webp`. Solo si el AVIF no es viable por alguna restricción de red (Directus lo maneja automáticamente).

---

## 🎞️ Detalles de Diseño "Olvidados" (The Wow Factor)

1. **Efecto de Vidrio (Glassmorphism)**: 
   - Los elementos flotantes (filtros, barras de navegación) deben usar un fondo semi-transparente: `rgba(13, 13, 13, 0.85)` con `backdrop-filter: blur(10px)`.
2. **Transiciones Premium**: 
   - No usar transiciones de `0.3s` lineales. El estándar es `0.6s` con `cubic-bezier(0.22, 1, 0.36, 1)`. Esto da una sensación de suavidad orgánica ("Ease-out").
3. **Malla de 50/50**: 
   - Las páginas de "Obra" deben mantener el equilibrio visual: Izquierda fija (Imagen de arte), Derecha scrollable (Detalle técnico).
4. **Micro-animaciones de Hover**: 
   - El escalado de imágenes en la galería no debe superar el `scale(1.05)`. El cambio de opacidad al mostrar la imagen secundaria (`_2.avif`) debe ser de `0.6s`.
5. **Espaciado Fluido**: 
   - Usamos `clamp()` para el espaciado. El sitio debe "respirar" tanto en una pantalla de iPad como en un monitor de 32 pulgadas.

---
> [!TIP]
> **Regla de Oro**: Si algo es importante, va en **Gold**. Si es información de soporte, va en **Travertine Mid**. El fondo NUNCA es blanco puro, siempre es **Onyx Deep**.
