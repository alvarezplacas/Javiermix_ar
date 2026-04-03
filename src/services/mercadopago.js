import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * 💳 Mercado Pago Service (V8 Motor)
 * 
 * Este servicio centraliza la creación de preferencias de pago.
 * Utiliza las credenciales del entorno para operar en Sandbox o Producción.
 */

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-6831000000000000-000000-00000000000000000000', // Placeholder
    options: { timeout: 5000 }
});

export async function createPreference(items, orderId) {
    const preference = new Preference(client);

    const body = {
        items: items.map(item => ({
            id: item.id,
            title: item.title,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: 'ARS' // O USD según configuración
        })),
        back_urls: {
            success: 'https://javiermix.ar/carrito/success',
            failure: 'https://javiermix.ar/carrito/failure',
            pending: 'https://javiermix.ar/carrito/pending'
        },
        auto_return: 'approved',
        external_reference: orderId, // Crucial para el Webhook
        notification_url: 'https://javiermix.ar/api/webhook' // URL donde MP nos avisará
    };

    try {
        const response = await preference.create({ body });
        return {
            id: response.id,
            init_point: response.init_point
        };
    } catch (error) {
        console.error('❌ Error creando preferencia de Mercado Pago:', error);
        throw error;
    }
}
