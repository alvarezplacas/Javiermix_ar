# MISION: EXTRACCIÓN Y DISTRIBUCIÓN (V1 -> V2)
**Objetivo:** Leer el código legado ubicado en `H:\Javiermix_web` y refactorizarlo dividiéndolo en la nueva estructura modular de `Javiermix_web_v2`.

## REGLAS DE EXTRACCIÓN:
1. **No inventes código nuevo:** Tu trabajo es MIGRAR y SEPARAR lógicas. Si encuentras un archivo gigante en la V1 que mezcla la galería de arte con el blog, debes extraer la parte de la galería y enviarla a `/frontend/galery`, y la parte del blog a `/frontend/magazine`.
2. **Desacoplamiento del Backend:** Todo script que llame a bases de datos (fetch a APIs, configuraciones de Directus) debe ser extraído, limpiado y enviado a `/backend/conexion`. Los frontends solo deben importar desde esa carpeta central.
3. **Paso a paso:** No intentes migrar todo el sitio de un golpe. Pregúntame qué módulo vamos a migrar hoy y enfócate 100% en rastrear las dependencias de ese módulo en el código viejo.