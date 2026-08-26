import { createImageUrlBuilder } from '@sanity/image-url';
import type { ImagenSanity } from '../tipos';

const builder = createImageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
});

/**
 * Construye la URL de una imagen alojada en Sanity.
 * El recorte y el redimensionado los hace su CDN, no nosotros.
 */
export function urlImagen(fuente: ImagenSanity) {
  return builder.image(fuente as any).auto('format').fit('max');
}
