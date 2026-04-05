import type { APIRoute } from 'astro';
import { fetchFromDirectus } from '../../../conexion/directus';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = cookies.get('jhm_admin_token')?.value;

  if (!id || !token) {
    return redirect('/dashboard/obras?error=missing_id_or_token');
  }

  try {
    const res = await fetchFromDirectus(`/items/artworks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      return redirect('/dashboard/obras?success=deleted');
    } else {
      const data = await res.json();
      console.error("Error borrando obra:", data);
      return redirect(`/dashboard/obras?error=${encodeURIComponent(data.errors?.[0]?.message || 'Error desconocido')}`);
    }
  } catch (error) {
    console.error("Error en API delete obra:", error);
    return redirect('/dashboard/obras?error=connection_failed');
  }
};
