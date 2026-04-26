import { createPreference } from '@services/mercadopago';
import { createOrder } from '@conexion/directus';
import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_STATIC_TOKEN || '-Z-gFGpFRrmFv8dOxED-LZbusJDRQJsg';

/**
 * 🛒 API Checkout (Motor V8)
 * 
 * Este endpoint recibe el carrito, valida precios contra Directus
 * y genera la preferencia de Mercado Pago.
 */

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { items, customer, shippingMethod } = body;

        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ error: 'Carrito vacío' }), { status: 400 });
        }

        // 🛡️ PROTOCOLO DE BLINDAJE: Validación Server-Side contra Directus
        const client = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(DIRECTUS_TOKEN));
        const validatedItems = [];
        let subtotal = 0;

        for (const item of items) {
            const realId = item.id.includes('-') ? item.id.split('-')[0] : item.id;
            const sizeLabel = item.id.includes('-') ? item.id.split('-')[1].toLowerCase() : 'standard';

            const dbItems = await client.request(readItems('artworks', { filter: { id: { _eq: realId } }, limit: 1 }));
            const dbItem = dbItems[0];

            if (!dbItem) throw new Error(`Producto no encontrado: ${realId}`);

            let price = dbItem.price || 0;
            if (sizeLabel === 'small' && dbItem.precio_small) price = dbItem.precio_small;
            if (sizeLabel === 'medium' && dbItem.precio_medium) price = dbItem.precio_medium;
            if (sizeLabel === 'large' && dbItem.precio_large) price = dbItem.precio_large;

            // Sumar costo de enmarcado si existe
            if (item.framing && item.framing.price) {
                price += item.framing.price;
            }

            subtotal += price * item.quantity;
            validatedItems.push({
                id: item.id,
                title: `${dbItem.title || 'Obra Javier Mix'} (${sizeLabel.toUpperCase()})${item.framing ? ' + Marco' : ''}`,
                price: price,
                quantity: item.quantity
            });
        }

        // 🚚 LOGÍSTICA DE ENVÍO
        let shippingCost = 0;
        let shippingLabel = "Retiro en Studio";

        if (shippingMethod === 'national') {
            shippingCost = 7500; // Tarifa plana Andreani Placeholder
            shippingLabel = "Envío Nacional Andreani";
            validatedItems.push({
                id: 'shipping-national',
                title: 'Envío Andreani (Seguro Incluido)',
                price: shippingCost,
                quantity: 1
            });
        } else if (shippingMethod === 'international') {
            shippingCost = 45000; // Tarifa plana DHL Placeholder
            shippingLabel = "Envío Internacional (DHL)";
            validatedItems.push({
                id: 'shipping-intl',
                title: 'Envío Internacional (DHL Express)',
                price: shippingCost,
                quantity: 1
            });
        }

        const totalFinal = subtotal + shippingCost;

        // 📝 Registro de la Orden como 'Pending'
        const order = await createOrder({
            total: totalFinal,
            items: validatedItems,
            status: 'pending',
            customer_email: customer?.email || 'anonimo@test.com',
            shipping_method: shippingMethod || 'pickup',
            shipping_address: customer?.address || 'Retiro en Studio',
            shipping_cost: shippingCost
        });

        if (!order) {
            throw new Error('No se pudo crear la orden en Directus');
        }

        // 💳 Creación de la Preferencia de Mercado Pago
        const preference = await createPreference(validatedItems, order.id);

        return new Response(JSON.stringify({ 
            id: preference.id,
            init_point: preference.init_point,
            order_id: order.id
        }), { status: 200 });


    } catch (error) {
        console.error('❌ Error en Checkout V8:', error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
