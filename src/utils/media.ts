/**
 * Utilidades para el manejo de medios (imágenes/videos) en Javier Mix V2.
 * Soporta resolución de UUIDs de Directus y optimización al vuelo.
 */

const DIRECTUS_URL = 'https://admin.javiermix.ar';

/**
 * Resuelve una URL de medio basándose en si es un UUID de Directus o una ruta local/externa.
 */
export function resolveMediaURL(url: string | null): string {
  if (!url) return '/img/placeholder.jpg';
  
  // Si ya es una URL completa o una ruta absoluta local, retornarla
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }
  
  // Si es un UUID de Directus (36 caracteres con guiones)
  if (url.length === 36 && url.includes('-')) {
    return `${DIRECTUS_URL}/assets/${url}`;
  }
  
  // Fallback para rutas relativas (ej. legadas de V1)
  return `/img/obras/${url}`;
}

interface OptimizationOptions {
  width?: number;
  height?: number;
  format?: 'avif' | 'webp' | 'jpg' | 'png';
  quality?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
}

/**
 * Genera una URL de imagen optimizada usando las transformaciones de Directus.
 */
export function getOptimizedImageURL(id: string | null, options: OptimizationOptions = {}): string {
  if (!id) return '/img/placeholder.jpg';
  
  // Si no es un UUID de Directus, intentamos resolverlo normalmente
  if (!(id.length === 36 && id.includes('-'))) {
    return resolveMediaURL(id);
  }
  
  const params = new URLSearchParams();
  
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.format) params.set('format', options.format);
  if (options.quality) params.set('quality', options.quality.toString());
  if (options.fit) params.set('fit', options.fit);
  
  // No forzamos formato por defecto para diagnóstico; permitimos el original de Directus
  if (options.format) params.set('format', options.format);

  const queryString = params.toString();
  return `${DIRECTUS_URL}/assets/${id}${queryString ? `?${queryString}` : ''}`;
}
