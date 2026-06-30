import rss from '@astrojs/rss';
import { DirectusManager, getAssetUrl } from '../conexion/directus';
import { readItems } from '@directus/sdk';

// NOTA SOBRE VARIABLES DE ENTORNO DE DIRECTUS:
// DirectusManager utiliza internamente las siguientes variables de entorno:
// - import.meta.env.PUBLIC_DIRECTUS_URL (ej. https://admin.javiermix.ar)
// - import.meta.env.INTERNAL_DIRECTUS_URL (ej. http://javiermix-directus:8055)
// - import.meta.env.DIRECTUS_STATIC_TOKEN (Token de acceso estático)

export async function GET(context) {
  try {
    const client = await DirectusManager.getClient();
    
    // Obtener artículos filtrados estrictamente por estado "publicado" o "published"
    const dbArticles = await client.request(readItems('magazine', {
      filter: {
        status: { _in: ['published', 'Publicado'] }
      },
      sort: ['-date_created'],
      fields: ['*']
    }));

    return rss({
      title: 'Revista Javier Mix | Fine Art & Fotografía de Autor',
      description: 'Crónicas de luz, memoria y potencia estética para coleccionistas y decoradores de interiores.',
      site: context.site || 'https://javiermix.ar',
      xmlns: {
        media: 'http://search.yahoo.com/mrss/',
        content: 'http://purl.org/rss/1.0/modules/content/'
      },
      items: dbArticles.map((article) => {
        // Generar URL de portada optimizada en formato .jpg y ancho de 1200px para crawlers / Google Discover
        const imageUrl = article.featured_image 
          ? getAssetUrl(article.featured_image, { width: 1200, format: 'jpg', quality: 90 }) 
          : 'https://javiermix.ar/img/og/javiermix-og.jpg';

        // Sanitizar y decodificar el contenido
        const plainExcerpt = article.seo_description || 
          article.content_html?.replace(/<[^>]*>/g, '').trim().substring(0, 250) + '...' || 
          '';

        return {
          title: article.title,
          pubDate: article.date_created ? new Date(article.date_created) : new Date(),
          description: plainExcerpt,
          link: `/revista/${article.id}-${article.slug}`,
          enclosure: {
            url: imageUrl,
            length: 0,
            type: 'image/jpeg'
          },
          customData: `
            <media:content url="${imageUrl}" type="image/jpeg" medium="image" width="1200" />
            <author>${article.author || 'Javier Mix'}</author>
            <content:encoded><![CDATA[${article.content_html || ''}]]></content:encoded>
          `
        };
      }),
      customData: `<language>es-AR</language>`
    });
  } catch (error) {
    console.error('Error generando RSS feed:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate RSS' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
