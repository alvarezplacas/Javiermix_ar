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
        const ids = items.map(item => item.id);
        const res = await fetchFromDirectus(`/items/artworks?filter[id][_in]=${ids.join(',')}`);
        const dbItems = (await res.json()).data;

        let totalReal = 0;
        const validatedItems = items.map(item => {
            const dbItem = dbItems.find(db => db.id == item.id);
            if (!dbItem) throw new Error(`Producto no encontrado: ${item.id}`);
            
            const price = dbItem.price || 0;
            totalReal += price * item.quantity;

            return {
                id: item.id,
                title: dbItem.title || 'Obra Javier Mix',
                price: price,
                quantity: item.quantity
            };
        });

        // 📝 Registro de la Orden como 'Perteneciente/Pending'
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
