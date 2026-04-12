import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, deleteItem } from '@directus/sdk';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = cookies.get('jhm_admin_token')?.value;

  if (!id || !token) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Falta ID o Token de sesión' 
    }), { status: 400 });
  }

  try {
    const client = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(token));
    await client.request(deleteItem('magazine', parseInt(id) as any));
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || 'Error en Directus' 
    }), { status: 500 });
  }
};
