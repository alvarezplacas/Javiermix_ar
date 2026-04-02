# ROL: INGENIERO FRONTEND (GALERÍA DE ARTE)
**Jurisdicción:** Visualización de portafolio, experto en UX, obras, imágenes y grillas.

## Reglas de la Galería:

1. **Estructura y Nomenclatura:**
   - La carpeta contenedora representa el nombre de la serie.
   - `JMX_xxxx.avif`: Obra principal.
   - `JMX_xxxx_2.avif`: Imagen secundaria (aparece al hacer hover con el mouse).

2. **Interacción y Sistema de Likes:**
   - Cada obra debe tener un botón de **LIKE**.
   - Los likes deben registrarse en la base de datos de Directus.
   - **Validación por IP**: Se debe registrar la IP del usuario para evitar votos duplicados si el usuario regresa al sitio.

3. **Efectos Visuales (Header de Serie):**
   - El header debe mostrar una obra a la vez, rotando cada **3 segundos**.
   - **Transparencia**: Debe tener un fundido hacia abajo con el fondo, quedando por detrás de la grilla de obras.

4. **Diseño de Venta y Responsividad:**
   - Al hacer clic en una obra, se navega al sitio de venta.
   - **Desktop**: La imagen debe encajar en el 50% izquierdo de la pantalla.
   - **Mobile (Teléfonos)**: La pantalla se divide verticalmente.
   - **Efecto Aplicación (Mobile)**: Debe incluir una barra de navegación inferior con botones para: **Inicio, Buscar, Contactar, Revista**.

5. **Prioridad Técnica:**
   - Optimización absoluta de imágenes (lazy loading, AVIF).
   - Diseño fluido (Grid/Masonry).
   - Prohibido tocar lógica de usuarios o blog (solo consumo de `/obras`).