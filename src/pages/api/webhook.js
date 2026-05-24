import { getOrder, updateOrder, createCollector, createCertificate, DirectusManager } from '@conexion/directus';
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
                    // 🌟 Extraer datos reales del comprador desde Mercado Pago
                    const payerEmail = paymentData.payer?.email || order.customer_email;
                    const payerFirstName = paymentData.payer?.first_name || '';
                    const payerLastName = paymentData.payer?.last_name || '';
                    const payerName = `${payerFirstName} ${payerLastName}`.trim() || order.customer_name || "Cliente Javier Mix";
                    const payerPhone = paymentData.payer?.phone?.number || order.customer_phone || "";

                    console.log(`👤 Datos de Comprador Recuperados: ${payerName} <${payerEmail}>`);

                    // 2. Crear o Actualizar Coleccionista con datos reales
                    const collector = await createCollector({
                        name: payerName,
                        email: payerEmail,
                        phone: payerPhone
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
                                    edition_number: "Edición Abierta",
                                    dimensions: "Según Pedido"
                                });
                            }
                        }
                    }

                    // 4. Actualizar estado final de la Orden (enriquecida con datos reales)
                    await updateOrder(orderId, { 
                        status: 'paid', 
                        mercadopago_id: mpTransactionId,
                        payment_date: new Date().toISOString(),
                        customer_name: payerName,
                        customer_email: payerEmail,
                        customer_phone: payerPhone
                    });
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('❌ Error en Webhook V8:', error.message);
        return new Response(null, { status: 200 }); // Siempre 200 para que MP no reintente infinitamente
    }
};

