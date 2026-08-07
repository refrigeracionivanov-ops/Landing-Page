import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';
import type { Image } from '@sanity/types';

const builder = createImageUrlBuilder(sanityClient);

/**
 * Construye la URL de una imagen alojada en Sanity.
 * El recorte y el redimensionado los hace su CDN, no nosotros.
 */
export function urlImagen(fuente: Image) {
  return builder.image(fuente).auto('format').fit('max');
}
