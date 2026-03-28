import { db, collectors, orders } from '../../../conexion/db';
import { eq } from 'drizzle-orm';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, address, city, country, notes, cartItems, total } = body;

        if (!email || !firstName || !cartItems || cartItems.length === 0) {
            return new Response(JSON.stringify({ error: 'Data incomplete' }), { status: 400 });
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const fullAddress = `${address}, ${city}, ${country}`;

        let collectorId = null;
        const existingCol = await db.select().from(collectors).where(eq(collectors.email, email)).limit(1);
        
        if (existingCol.length > 0) {
            collectorId = existingCol[0].id;
        } else {
            const insertCol = await db.insert(collectors).values({
                name: fullName,
                email: email,
                phone: phone,
                country: country,
                status: 'lead'
            });
            collectorId = Number(insertCol[0].insertId);
        }

        const shortHash = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `JMX-${new Date().getTime().toString().slice(-4)}-${shortHash}`;

        await db.insert(orders).values({
            order_number: orderNumber,
            collector_id: collectorId,
            collector_name: fullName,
            collector_email: email,
            collector_phone: phone,
            shipping_address: fullAddress,
            total_price: total.toString(),
            items_json: JSON.stringify(cartItems),
            notes: notes || ''
        });

        return new Response(JSON.stringify({ 
            success: true, 
            order_number: orderNumber 
        }), { status: 200 });

    } catch (e: any) {
        console.error('Error in submit-order:', e);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
