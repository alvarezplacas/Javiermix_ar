# Avances del Laboratorio y Buscador Inteligente - 2026

Este documento compila las especificaciones técnicas y operativas de las últimas integraciones realizadas en el **Gabinete de Experimentación** (`/laboratorio`) y el **Portal de Búsqueda** (`/galeria`). Todas las funcionalidades operan bajo el **Estándar de Oro JMX** para lograr interactividad de alta fidelidad (60 FPS) sin APIs de coste recurrente (On-Device Processing).

---

## 1. El Portal de Búsqueda Tri-Estado (`/galeria`)
Se expandió la interfaz de búsqueda y filtrado de obras incorporando una segmentación de tres vías (selector de segmentos) que permite conmutar dinámicamente entre tres motores de búsqueda locales:

* **Modo OBRAS**: Búsqueda convencional mediante filtrado de texto coincidente sobre títulos y series.
* **Modo SERIES**: Agrupamiento y visualización de colecciones en formato de tarjetas de colección con su descripción y portada.
* **Modo CONCEPTUAL (IA local)**:
  * **Estrategia**: Diseñado como interfaz e infraestructura preparatoria para embeddings de CLIP mediante Transformers.js.
  * **Motor Semántico Inicial**: Implementa un analizador local en JavaScript que asocia términos conceptuales y emocionales (*calma, paz, silencio, caos, energía, ruido, soledad, vacío, melancolía, nostalgia*) con patrones cromáticos y compositivos de las obras (ej. filtrado de azules y grises para "calma/soledad", rojos e iluminación para "caos/energía").

---

## 2. Editor de Imágenes WebGL Estilo Photoshop (`/laboratorio/editor`)
Se creó un configurador visual tridimensional y panel de revelado digital interactivo inspirado en la interfaz clásica de Photoshop. Su arquitectura permite procesar imágenes de forma gratuita e ilimitada directamente en la GPU del cliente.

### Arquitectura de Componentes
* **Barra de Herramientas (Izquierda)**: Iconos interactivos con tooltips para seleccionar Mover, Revelado, Filtros, Relieve 3D y Texto.
* **Lienzo de Trabajo (Centro)**: Área interactiva con soporte Drag & Drop de archivos locales. Utiliza una arquitectura de tres capas:
  1. *Canvas de Imagen (Offscreen 2D)*: Compositores de imagen, texto y ajustes.
  2. *Canvas de Profundidad (Offscreen 2D)*: Almacena el mapa de relieve en escala de grises.
  3. *Lienzo Principal (WebGL)*: Renderiza el resultado final combinando los buffers mediante shaders.
* **Panel de Propiedades (Derecha)**: Sliders de control en tiempo real, gestor de capas y botones de carga y exportación a disco (JPEG/PNG).

### Motor 3D de Relieve (Displacement Shader)
Implementa un shader en WebGL que calcula el paralaje dinámico reactivo al cursor:
```glsl
precision mediump float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uDepthMap;
uniform vec2 uMouseOffset;
uniform float uDepthIntensity;

void main() {
    float depth = texture2D(uDepthMap, vUv).r;
    vec2 displacedUv = vUv + uMouseOffset * depth * uDepthIntensity;
    displacedUv = clamp(displacedUv, 0.001, 0.999);
    gl_FragColor = texture2D(uImage, displacedUv);
}
```
* **Pintar Relieve**: Permite pintar con un pincel difuminado directamente sobre el mapa de profundidad para decidir qué partes sobresalen de la pantalla.
* **Presets de Relieve**: Generación automática de mapas de relieve matemáticos: Esfera (Cúpula central), Túnel (Radial) y Horizonte (Gradiente).
* **Filtros de Revelado y Acentos**: Control de brillo, contraste, saturación y exposición acelerados por hardware, junto a filtros cromáticos de autor (*Velvet Crimson*, *Golden Sepia*, *Esmeralda*, *Gris Platinado*, y *Glitch*).

---

## 3. Optimización 3D en la Galería Infinita (`/laboratorio/profundidad`)

### Corrección de Superposición (Depth Sorting)
Anteriormente, los paneles de vidrio flotantes se renderizaban en un plano superpuesto independiente (`z-index: 2`), lo que provocaba que se dibujaran sobre las fotos incluso si estaban en el fondo 3D (Z negativo).
* **Solución**: Se reubicaron los paneles `.glass-panel` directamente dentro del elemento `.tunnel`. De este modo, las fotos y los paneles comparten el **mismo contexto de renderizado 3D**, permitiendo al navegador resolver el *Z-buffering* nativo de forma correcta.
* **Fórmula de Translación**: Dado que el túnel se traslada por `progress`, calculamos la posición local restando el avance: `zPos_local = zPos_final - progress`.

### Distribución Periférica
* Para evitar que los paneles colisionaran o atravesaran de forma antiestética los marcos de las obras en el centro, se expandió el límite de cálculo espacial ($X > 600px$ / $X < -600px$, $Y > 350px$ / $Y < -350px$). Los vidrios ahora flotan en el lateral del viewport, enmarcando el recorrido del espectador.

### Solución de Fugas de Memoria
* **Render Loop**: Se añadió la condición `if (!tunnel.isConnected) return;` en el `requestAnimationFrame` para detener instantáneamente el bucle cuando el usuario sale de la página en Astro.
* **Limpieza de Sonido**: Control de parada asíncrono en `astro:before-preparation` para descargar de forma segura el audio en reproducción.
* **Layout Thrashing**: Eliminación de consultas de flujo (`offsetHeight`) en el bucle principal, reemplazándolas por constantes matemáticas estables en CSS3D.
