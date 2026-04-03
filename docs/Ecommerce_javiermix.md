# 🛒 MANUAL MAESTRO: Motor de Ecommerce V8 (JavierMix v2)

Este documento centraliza el conocimiento técnico y las "Mejores Prácticas de 2026" para el sistema de ventas del ecosistema JavierMix / Alvarez Placas.

---

## 🏛️ 1. Arquitectura "Agnóstica y Desacoplada"

El diseño del motor se basa en la independencia de los datos. El carrito no "conoce" qué producto vende; solo gestiona identidades y cantidades, delegando la validación de precios al servidor.

### Flujo de Datos

1. **Frontend (Astro + Nano Stores)**: El usuario añade productos al carrito. Los datos se persisten en `localStorage`.
2. **Capa de Conexión (Directus)**: El carrito consulta a Directus para obtener la información visual (fotos, títulos).
3. **Checkout (API Serverless)**: El carrito se envía a un endpoint de Astro (`/api/checkout`). Aquí se realiza la **Validación Crítica de Precios** contra la base de datos de Directus antes de generar el link de pago.
4. **Pago (Mercado Pago)**: Se genera una preferencia y se redirige al usuario.
5. **Confirmación (Webhook)**: Mercado Pago avisa al servidor cuando el pago se completa, y el servidor actualiza el stock/pedido en Directus.


---

## 🚀 2. Mejores Prácticas de 2026

### 🧠 Gestión de Estado con Nano Stores

- **Ultra Ligero**: Solo añade unos cientos de bytes al bundle.
- **Multimarca**: Al ser agnóstico, el mismo `cartStore.js` puede usarse en `javiermix.ar` o `alvarezplacas.com.ar` simplemente cambiando las IDs de producto.
- **Persistencia**: Uso obligatorio de `@nanostores/persistent` para evitar la pérdida del carrito en recargas de página accidentales.

### 🛡️ Seguridad y Blindaje

- **Precios Inalterables**: **JAMÁS** confiar en el precio que envía el frontend. El precio final se calcula siempre en el servidor en el momento del checkout consultando Directus.
- **Webhooks**: No considerar una venta como finalizada hasta recibir la notificación asíncrona de Mercado Pago.
- **Sandboxing**: Usar siempre cuentas de prueba de Mercado Pago para el desarrollo.

### 🖼️ Experiencia de Usuario (UX)

- **Añadir al carrito sin recarga**: Uso de islas reactivas para que el botón de añadir no interrumpa la navegación del usuario por la galería.
- **Cart Widget**: Un componente flotante o en el Header que muestre el total de items en tiempo real.

---

## 🏗️ 3. Estándar de Archivos (Mando a Distancia V8)

| Archivo | Propósito |
| :--- | :--- |
| **`src/store/cartStore.js`** | El cerebro reactivo. Guarda los items. |
| **`src/services/mercadopago.js`** | Configuración de credenciales y creación de preferencias (Backend). |
| **`src/services/directus.js`** | Validación de stock y precios de forma segura (Backend). |
| **`src/pages/api/checkout.js`** | Punto de entrada del carrito para procesar el pago. |
| **`src/pages/api/webhook.js`** | Receptor de confirmaciones de pago desde el exterior. |

---
> [!IMPORTANT]
> **Nota para Agentes**: Si necesitas añadir un nuevo tipo de producto (ej: "Consultoría"), añádelo en Directus, no en el código del carrito. El motor V8 tratará cualquier item con una ID válida de forma estándar.
