import { createPreference } from '../../services/mercadopago';
import { fetchFromDirectus, createOrder } from '../../conexion/directus';

/**
 * 🛒 API Checkout (Motor V8)
 * 
 * Este endpoint recibe el carrito, valida precios contra Directus
 * y genera la preferencia de Mercado Pago.
 */

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { items, customer } = body;

        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ error: 'Carrito vacío' }), { status: 400 });
        }

        // 🛡️ PROTOCOLO DE BLINDAJE: Validación Server-Side contra Directus
        const validatedItems = [];
        let totalReal = 0;

        for (const item of items) {
            // Extraer ID real si es un variant (formato: id-label)
            const realId = item.id.includes('-') ? item.id.split('-')[0] : item.id;
            const sizeLabel = item.id.includes('-') ? item.id.split('-')[1].toLowerCase() : 'standard';

            const res = await fetchFromDirectus(`/items/artworks/${realId}`);
            const dbItem = (await res.json()).data;

            if (!dbItem) throw new Error(`Producto no encontrado: ${realId}`);

            // Determinar precio según el tamaño seleccionado
            let price = dbItem.price || 0;
            if (sizeLabel === 'small' && dbItem.precio_small) price = dbItem.precio_small;
            if (sizeLabel === 'medium' && dbItem.precio_medium) price = dbItem.precio_medium;
            if (sizeLabel === 'large' && dbItem.precio_large) price = dbItem.precio_large;

            totalReal += price * item.quantity;
            validatedItems.push({
                id: item.id,
                title: `${dbItem.title || 'Obra Javier Mix'} (${sizeLabel.toUpperCase()})`,
                price: price,
                quantity: item.quantity
            });
        }

        // 📝 Registro de la Orden como 'Pending'
        const order = await createOrder({
            total: totalReal,
            items: validatedItems,
            status: 'pending',
            customer_email: customer?.email || 'anonimo@test.com'
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
