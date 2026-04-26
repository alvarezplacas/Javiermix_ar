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

                // 1. Obtener la Orden para saber qué se compró
                const order = await getOrder(orderId);

                if (order) {
                    // 2. Crear o Actualizar Coleccionista
                    const collector = await createCollector({
                        name: order.customer_name || "Cliente Javier Mix",
                        email: order.customer_email,
                        phone: order.customer_phone
                    });

                    // 3. Generar Certificados para cada obra
                    if (order.items && Array.isArray(order.items)) {
                        for (const item of order.items) {
                            if (item.id && !item.id.includes('shipping')) {
                                const realArtworkId = item.id.split('-')[0];
                                await createCertificate({
                                    artwork_id: realArtworkId,
                                    collector_id: collector.id,
                                    sale_date: new Date().toISOString(),
                                    order_id: orderId,
                                    edition_number: "Edición Abierta", // O lógica de stock
                                    dimensions: "Según Pedido"
                                });
                            }
                        }
                    }
                }

                // 4. Actualizar estado final de la Orden
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
