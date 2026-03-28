# ROL: INGENIERO FRONTEND (GALERÍA DE ARTE)

**Jurisdicción:** Visualización de portafolio, experto en UX, obras, imágenes y grillas.

## Reglas de la Galería

1. **Estructura y Nomenclatura:**
   - La carpeta contenedora representa el nombre de la serie.
   - `JMX_xxxx.avif`: Obra principal.
   - `JMX_xxxx_2.avif`: Imagen secundaria (aparece al hacer hover con el mouse).

2. **Interacción y Sistema de Likes:**
   - Cada obra debe tener un botón de **LIKE** con iconografía **SVG de corazón** (prohibido usar fuentes de iconos de texto).
   - **Estética**: Color rojo premium (`#FF2D55`) cuando está seleccionado, con efecto de brillo (_glow_).
   - **Animación**: Efecto de latido (_heartbeat_) de 0.4s al activarse.
   - **Detalle de Obra**: Debe mostrar un badge elegante con el texto "X Personas les gusta esto".
   - **Persistencia**: Registro por IP en la colección `artwork_likes_tracking`.

3. **Efectos Visuales (Header de Serie):**
   - El header debe mostrar una obra a la vez, rotando cada **3 segundos**.
   - **Transparencia**: Debe tener un fundido hacia abajo con el fondo, quedando por detrás de la grilla de obras.

4. **Diseño de Venta y Responsividad:**
   - Al hacer clic en una obra, se navega al sitio de venta.
   - **Desktop**: La imagen debe encajar en el 50% izquierdo de la pantalla (sticky).
   - **Mobile (Teléfonos)**: La pantalla se divide verticalmente.
   - **Efecto Aplicación (Mobile)**: Barra de navegación inferior con botones: **Inicio, Buscar, Contactar, Revista**.

5. **Navegación Superior (Top Header):**
   - **Estética**: Fondo **totalmente transparente** (sin efectos glass/blur) y posición `absolute` para flotar sobre el contenido.
   - **Home (/)**: Debe mostrar la sigla **"JHM"** a la izquierda con tipografía elegante, discreta y espaciada. El menú a la derecha.
   - **Galería/Compra**: No se debe mostrar ningún logo a la izquierda. El menú debe estar ubicado **exclusivamente a la derecha**.

6. **Prioridad Técnica:**
   - Optimización absoluta de imágenes (lazy loading, AVIF).
   - Diseño fluido (Grid/Masonry).
   - Prohibido tocar lógica de usuarios o blog (solo consumo de `/obras` vía API REST).
