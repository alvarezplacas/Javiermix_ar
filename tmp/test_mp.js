import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);

async function test() {
    try {
        console.log('--- 🧪 Test de Conectividad Mercado Pago ---');
        console.log('Usando Token:', process.env.MP_ACCESS_TOKEN.substring(0, 15) + '...');
        
        const body = {
            items: [
                {
                    id: 'test-item-1',
                    title: 'Obra de Prueba - Javier Mix',
                    unit_price: 1,
                    quantity: 1,
                    currency_id: 'ARS'
                }
            ],
            back_urls: {
                success: 'https://javiermix.ar/test-success',
            }
        };

        const response = await preference.create({ body });
        console.log('✅ ÉXITO: Preferencia creada correctamente.');
        console.log('ID:', response.id);
        console.log('URL de pago (Sandbox/Init):', response.init_point);
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR verificando token de Mercado Pago:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Detalle:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

test();
