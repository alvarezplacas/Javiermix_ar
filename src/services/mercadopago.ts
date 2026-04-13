import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * 💳 Mercado Pago Service (V8 Motor - TypeScript Edition)
 * 
 * Este servicio centraliza la creación de preferencias de pago.
 * Utiliza las credenciales del entorno para operar en Sandbox o Producción.
 * Las URLs se generan dinámicamente según el dominio configurado.
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://javiermix.ar';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    options: { timeout: 10000 }
});

export interface MPItem {
    id: string;
    title: string;
    price: number | string;
    quantity: number | string;
}

export async function createPreference(items: MPItem[], orderId: string) {
    const preference = new Preference(client);

    const body = {
        items: items.map(item => ({
            id: item.id,
            title: item.title,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: 'ARS'
        })),
        back_urls: {
            success: `${SITE_URL}/carrito/success`,
            failure: `${SITE_URL}/carrito/failure`,
            pending: `${SITE_URL}/carrito/pending`
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: `${SITE_URL}/api/webhook`
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
