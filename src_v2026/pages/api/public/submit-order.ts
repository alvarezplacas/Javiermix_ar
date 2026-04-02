import { db } from '../../../db/client';
import { collectors, orders } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
    try {
        const body = await request.json();
        
        // Destructurar la data que mande checkout.astro
        const { firstName, lastName, email, phone, address, city, country, notes, cartItems, total } = body;

        if (!email || !firstName || !cartItems || cartItems.length === 0) {
            return new Response(JSON.stringify({ error: 'Faltan datos obligatorios o carrito vacío' }), { status: 400 });
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const fullAddress = `${address}, ${city}, ${country}`;

        // 1. Manejo del Coleccionista (Buscarlo o Crearlo)
        let collectorId = null;
        const existingCol = await db.select().from(collectors).where(eq(collectors.email, email)).limit(1);
        
        if (existingCol.length > 0) {
            collectorId = existingCol[0].id;
            // Opcionalmente actualizar teléfono si no lo tenia
        } else {
            const insertCol = await db.insert(collectors).values({
                name: fullName,
                email: email,
                phone: phone,
                country: country,
                status: 'lead' // Pendiente a convertirse en 'collector' cuando pague
            });
            collectorId = Number(insertCol[0].insertId);
        }

        // 2. Generar Número de Orden Único
        const shortHash = Math.random().toString(36).substring(2, 6).toUpperCase();
        const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
        const orderNumber = `JMX-${dateStr}-${shortHash}`;

        // 3. Crear Registro en Órdenes
        await db.insert(orders).values({
            order_number: orderNumber,
            collector_id: collectorId,
            collector_name: fullName,
            collector_email: email,
            collector_phone: phone,
            shipping_address: fullAddress,
            total_price: total.toString(),
            payment_method: 'transferencia',
            payment_status: 'pending',
            items_json: JSON.stringify(cartItems),
            notes: notes || ''
        });

        // 4. Responder Exitosamente
        return new Response(JSON.stringify({ 
            success: true, 
            order_number: orderNumber,
            instructions: {
                bank: 'Mercado Pago',
                alias: 'cobromix',
                holder: 'Javier Hernan Alvarez'
            }
        }), { status: 200 });

    } catch (e: any) {
        console.error('Error procesando orden Checkout:', e);
        return new Response(JSON.stringify({ error: 'Error del servidor procesando la orden.' }), { status: 500 });
    }
}
