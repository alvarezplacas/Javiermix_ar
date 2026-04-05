import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const coleccion = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/coleccion" }),
  schema: z.object({
    title: z.string(),
    etiqueta: z.string().optional().default('Edición Limitada'),
    precio: z.number().optional().default(250),

    // Imágenes necesarias para la dualidad (Obra principal y Ambiente)
    coverImage: z.string(),
    roomImage: z.string().optional(),

    // Especificaciones Técnicas (La ficha como en la foto 1)
    ficha_tecnica: z.object({
      camara: z.string().optional().default('Hasselblad'),
      lente: z.string().optional(),
      papel: z.string().optional().default('Hahnemühle FineArt Baryta'),
      dimensiones: z.string().optional().default('115 x 70 cm'),
      ano: z.number().optional()
    }).optional(),

    // Términos u otros detalles (ej: Certificado de Autenticidad)
    terminos: z.string().optional().default('Incluye Certificado de Autenticidad y calidad Museo.'),
  })
});

const revista = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/revista" }),
  schema: z.object({
    title: z.string(),
    subtitulo: z.string().optional(),

    // Metadata Obligatoria
    pubDate: z.coerce.date(),
    coverImage: z.string(),
    autor: z.string().default('Javier Mix'),

    // Para replicar el puntaje (ej 8) circular al final del artículo
    puntaje: z.number().min(1).max(10).optional(),

    // Media para el panel sticky derecho
    // Cada item puede ser image o video con caption opcional
    mediaItems: z.array(z.object({
      type: z.enum(['image', 'video']),
      src: z.string(),
      caption: z.string().optional(),
    })).optional(),
  })
});

export const collections = { coleccion, revista };
