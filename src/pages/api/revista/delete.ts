import type { APIRoute } from 'astro';
import { fetchFromDirectus } from '../../../conexion/directus';

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
    const res = await fetchFromDirectus(`/items/magazine/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      const data = await res.json();
      return new Response(JSON.stringify({ 
        success: false, 
        message: data.errors?.[0]?.message || 'Error en Directus' 
      }), { status: res.status });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message 
    }), { status: 500 });
  }
};
