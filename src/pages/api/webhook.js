import { updateOrder } from '@conexion/directus';

/**
 * 🛰️ Webhook Mercado Pago (Motor V8)
 * 
 * Este endpoint escucha las notificaciones asíncronas de Mercado Pago
 * para confirmar el pago y actualizar el estado de la Orden en Directus.
 */

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { type, data } = body;

        // Solo nos interesan los pagos (payment)
        if (type === 'payment') {
            const paymentId = data.id;

            // 🔍 Consultamos el estado del pago en Mercado Pago (Safe side)
            // En producción, aquí haríamos un fetch a MP con el paymentId
            // para validar que el pago es 'approved'.
            
            console.log(`💳 Recorriendo Pago MP ID: ${paymentId}`);

            // Actualizamos la orden en Directus (En un flujo real, MP envía la external_reference)
            // Nota: Mercado Pago envía las notificaciones y luego nosotros consultamos el Payment.
            // Para simplificar esta v1, asumimos que si llega aquí, es para procesar.

            // updateOrder(orderId, { status: 'paid', mercadopago_id: paymentId });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('❌ Error en Webhook V8:', error.message);
        return new Response(null, { status: 500 });
    }
};
