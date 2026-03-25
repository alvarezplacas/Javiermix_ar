// h:\Javiermix_web_v2\frontend\pages\api\obras\delete.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = cookies.get('jhm_admin_token')?.value;

  if (!id || !token) {
    return redirect('/dashboard/obras?error=missing_id_or_token');
  }

  const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';

  try {
    const res = await fetch(`${DIRECTUS_URL}/items/artworks/${id}`, {
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
