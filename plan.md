Plan de Implementación: Auditoría y Mejora de la Mesa de Trabajo (Editor 3D/IA)
Este plan tiene como objetivo optimizar el código, ampliar las capacidades de importación (soportando mapas de profundidad externos y guardado/carga de proyectos en JSON) y resolver problemas de fugas de recursos (leaks) en el panel del laboratorio interactivo de JavierMix.

Cambios Propuestos
1. Estudio Editor 3D/IA (editor.astro)
Optimizaremos y ampliaremos src/pages/laboratorio/editor.astro:

Nuevas Funciones de Importación:
Carga de Mapa de Profundidad Externo: Permitir subir una imagen en escala de grises (generada por IA) directamente para usarla como relieve 3D.
Importación/Exportación de Proyecto en JSON: Guardar el estado completo de edición (capas de texto con sus posiciones, filtros aplicados, parámetros de revelado y el mapa de profundidad en Base64) y volver a cargarlo para continuar trabajando.
Modos de Renderizado WebGL Mejorados:
Sustituir la casilla de mapa de calor básica por un selector de modo:
Desplazamiento Normal (3D reactivo al cursor).
Mapa de Profundidad (escala de grises).
Mapa de Calor JMX (gradiente premium morado/rosa/oro/blanco).
Efecto Anaglifo 3D Estereoscópico (separación de canales rojo/cian en base a la profundidad y movimiento).
Mejoras Visuales y de UX (Mesa de Trabajo):
Fondo de mesa de trabajo de alta gama tipo rejilla/blueprint técnico CAD.
Cursor dinámico flotante en el lienzo que represente visualmente el tamaño del pincel de relieve cuando la herramienta 3D esté activa.
Estabilidad y Rendimiento (Auditoría):
Eliminar la ejecución duplicada del script (DOMContentLoaded + astro:page-load).
Gestionar correctamente el ciclo de vida del loop de animación (cancelAnimationFrame) y los listeners globales al navegar a otras secciones usando transiciones de Astro.
[MODIFY] 
editor.astro
2. Control de Recursos y Limpieza en Otros Experimentos
Para evitar fugas de memoria y procesamiento de GPU de fondo en la navegación por Astro:
3. En main derecho con opción retractil, agregar biblioteca para incrustar fotos de series. 
Cancelar bucles requestAnimationFrame e intervalos de forma limpia cuando el usuario abandona la página.
[MODIFY] 
cuadro-digital.astro
Almacenar el ID del bucle de renderizado y cancelarlo en la preparación de transición.
Limpiar el intervalo de la galería automática y listeners de teclado al salir.
[MODIFY] 
lava-fractal.astro
Cambiar la inicialización de DOMContentLoaded por astro:page-load únicamente.
Detener el bucle de renderizado de partículas de lava al navegar.
[MODIFY] 
cuarto-oscuro.astro
Eliminar listeners globales (mouseup, touchend en window) en la transición de página.
Plan de Verificación
Pruebas Manuales
Verificar Carga y Modos:
Abrir el editor, cargar una imagen de prueba.
Alternar entre los modos de visualización (Normal, Mapa de calor JMX, Anaglifo 3D) para comprobar los efectos de shader WebGL.
Probar Herramienta de Relieve:
Activar la herramienta 3D con pincel, comprobar que se muestra el cursor circular del tamaño correcto y que cambia de tamaño al ajustar el slider.
Subir un mapa de profundidad externo y mover el ratón para ver la deformación tridimensional instantánea.
Guardar y Cargar Proyecto:
Añadir una capa de texto, desplazarla, aplicar un filtro y cambiar valores de contraste.
Exportar como archivo .json.
Recargar la página (para limpiar el estado) e importar el archivo guardado para verificar que se restaura el estado, el mapa de profundidad pintado y la tipografía.
Verificación de Performance:
Navegar entre páginas del laboratorio y verificar en la consola de herramientas de desarrollo que no persisten errores de WebGL de páginas anteriores ni bucles de renderizado activos.

----------------------

Verificar el modo "conceptual" en el buscador. No detecta imagenes por concepto, analizar libreria. 
https://javiermix.ar/galeria