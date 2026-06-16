import type { APIRoute } from 'astro';

const PIN = '7890'; // Simplified PIN for access

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // 2. PIN Validation
    if (body.pin !== PIN) {
      return new Response(JSON.stringify({ error: "PIN incorrecto." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Forward request to MiniIA backend
    const backendResponse = await fetch('http://100.110.176.23:3013/api/chat', {
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
