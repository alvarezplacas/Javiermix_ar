import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, deleteItem } from '@directus/sdk';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL || 'https://admin.javiermix.ar';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = cookies.get('jhm_admin_token')?.value;

  if (!id || !token) {
    return redirect('/dashboard/obras?error=missing_id_or_token');
  }

  try {
    const client = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(token));
    await client.request(deleteItem('artworks', parseInt(id) as any));
    
    return redirect('/dashboard/obras?success=deleted');
  } catch (error: any) {
    console.error("Error borrando obra:", error);
    return redirect(`/dashboard/obras?error=${encodeURIComponent(error.message || 'Error en Directus')}`);
  }
};
