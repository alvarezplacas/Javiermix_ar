import type { APIRoute } from 'astro';

const ALLOWED_IP = '100.67.40.82'; // Tailscale IP of Motorola Edge 20 Lite
const ALLOWED_IPV6 = 'fd7a:115c:a1e0::2639:2852'; // IPv6 fallback
const PIN = '7890'; // Simplified PIN for access

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. IP Validation
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const isAllowedIp = 
      clientAddress === ALLOWED_IP || 
      clientAddress === ALLOWED_IPV6 || 
      forwardedFor.includes(ALLOWED_IP) || 
      forwardedFor.includes(ALLOWED_IPV6) || 
      clientAddress === '127.0.0.1' || 
      clientAddress === '::1';

    if (!isAllowedIp) {
      return new Response(JSON.stringify({ error: "Dispositivo no autorizado por Tailscale IP." }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();

    // 2. PIN Validation
    if (body.pin !== PIN) {
      return new Response(JSON.stringify({ error: "PIN incorrecto." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Forward request to MiniIA backend
    const backendResponse = await fetch('http://100.94.20.127:3013/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        domain: 'master', // Or javiermix.ar if you want to scope it
        user_name: 'Javier Móvil',
        user_role: 'admin' // Full access
      }),
    });

    if (!backendResponse.ok) {
      throw new Error(`Error en el backend de MiniIA: ${backendResponse.statusText}`);
    }

    const data = await backendResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Error interno del proxy' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
