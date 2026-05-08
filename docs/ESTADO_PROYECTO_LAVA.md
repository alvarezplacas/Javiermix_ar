# Informe de Estado: Motor de Restauración "Lava JMX"
**Fecha:** 8 de mayo de 2026

## 1. Resumen de la Intervención
Hoy se ha transformado el laboratorio de **Rescate de Fotos** de una galería estática a una experiencia de exhibición de alta fidelidad, centrada en el nuevo motor de comparación interactivo.

## 2. El Motor "Lava JMX" (Core)
- **Geometría**: Se utiliza una línea divisoria con `clip-path` de diamante (afilada en los extremos) para minimizar la obstrucción visual.
- **Estados**:
    - **Idle (Frío)**: Color gris oscuro (#111), semi-transparente.
    - **Active (Incandescente)**: Gradiente animado de lava roja/oro con sombras proyectadas (`lava-flow`).
- **Sistema de Partículas**: Motor de gotas incandescentes que se desprenden orgánicamente al arrastrar la cortina. Utiliza `Element.animate()` para alto rendimiento (60 FPS).
- **Control Maestro**: Implementado con **Pointer Events** (`setPointerCapture`). Esto garantiza que el mouse nunca quede "pegado" y que la experiencia sea idéntica en desktop, tablets y móviles.

## 3. Integración en Producción (`rescate-fotos.astro`)
- **Lógica de Emparejamiento**: El sistema detecta automáticamente archivos con sufijo `_2` en Directus.
- **Comportamiento Condicional**: 
    - **Con restauración**: Se activa el Motor de Lava al hacer clic.
    - **Sin restauración**: Se muestra la imagen completa sin línea divisoria.
- **Acceso Directo**: Se eliminaron botones secundarios ("Analizar Obra"). Ahora el clic directo en la foto activa el visor.

## 4. Rediseño Estético del Laboratorio
- **Layout "Tetris"**: Se migró a un sistema de columnas (Masonry) que permite ver las fotos enteras en su proporción original, sin recortes (`object-fit: contain`).
- **Curaduría de Datos**: Se simplificó la metadata debajo de cada foto a **Título** y **Año**.
- **Navegación por Tags**: El selector de "Series Históricas" se integró en el encabezado como un selector de etiquetas premium con borde dorado.
- **Atmósfera del Visor**: Fondo de papel antiguo manchado (`papel.avif`) y títulos institucionales centrados ("RESTAURACIÓN").

## 5. Notas Técnicas para el Futuro
- **Repositorio**: Todos los cambios están en `master`.
- **Despliegue**: Se realiza mediante el script local `SUBIR_Y_ACTUALIZAR.bat` que conecta al VPS (`144.217.163.13`).
- **Punto de Control**: El motor es ahora una pieza de código unificada y limpia dentro del `<script>` de `rescate-fotos.astro`. No debe fragmentarse ni duplicarse en futuras ediciones.

---
**Estado Actual: ESTABLE y EN PRODUCCIÓN.**
