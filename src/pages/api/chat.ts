import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Forward request to MiniIA backend on Tailscale (dgmix)
    const backendResponse = await fetch('http://100.110.176.23:3013/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        domain: body.domain || 'javiermix.ar',
        user_name: body.user_name || 'Visitante_Javiermix',
        user_role: body.user_role || 'cliente'
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Error en el backend de MiniIA: ${errorText || backendResponse.statusText}`);
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
