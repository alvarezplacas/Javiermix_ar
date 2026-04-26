import { updateOrder, DirectusManager } from '@conexion/directus';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

/**
 * 🛰️ Webhook Mercado Pago (Motor V8 - Producción)
 */
export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (type === 'payment') {
            const paymentId = data.id;
            const payment = new Payment(client);
            
            // Consultamos a Mercado Pago para verificar el estado real
            const paymentData = await payment.get({ id: paymentId });
            
            if (paymentData.status === 'approved') {
                const orderId = paymentData.external_reference;
                const mpTransactionId = paymentData.id?.toString();

                console.log(`✅ Pago Aprobado: Orden ${orderId} | Pago MP: ${mpTransactionId}`);

                // Actualizamos Directus
                await updateOrder(orderId, { 
                    status: 'paid', 
                    mercadopago_id: mpTransactionId,
                    payment_date: new Date().toISOString()
                });
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('❌ Error en Webhook V8:', error.message);
        return new Response(null, { status: 200 }); // Siempre 200 para que MP no reintente infinitamente
    }
};
