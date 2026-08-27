import { createClient } from '@sanity/client';
import { SANITY_WRITE_TOKEN } from 'astro:env/server';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import { apilarVersion } from './versiones';
import type { Bloque } from '../tipos';

/**
 * Escribir el contenido de la portada, con su copia de respaldo.
 *
 * Vive aparte porque hay dos caminos que escriben lo mismo —guardar desde el
 * editor y restaurar una version del historial— y los dos tienen que apilar lo
 * anterior antes de pisar. Si eso viviera en uno de los dos endpoints, el otro
 * terminaria olvidandoselo.
 */

/** Convierte un slug legible en un ID de documento Sanity. */
export function idPaginaDe(slug: string): string {
  return `pagina-${slug.replace(/[^a-z0-9]/g, '-')}`;
}

/** Compatibilidad con código que referencia el ID directamente. */
export const ID_PAGINA = idPaginaDe('inicio');

/**
 * El token de escritura nunca viaja al navegador: este cliente solo se arma
 * dentro del Worker.
 */
export function clienteEscritura() {
  if (!SANITY_WRITE_TOKEN) return null;

  return createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    apiVersion: '2024-10-01',
    token: SANITY_WRITE_TOKEN,
    // Escrituras nunca por CDN: devuelve contenido cacheado.
    useCdn: false,
  });
}

type ClienteEscritura = NonNullable<ReturnType<typeof clienteEscritura>>;

/**
 * Guarda las secciones y deja lo anterior en el historial.
 *
 * El respaldo va antes de escribir y en su propio try: si D1 falla, se pierde
 * una version del historial, no el trabajo de quien esta editando. Al reves
 * —cortar el guardado porque no se pudo respaldar— seria hacerle pagar a la
 * persona equivocada un problema que no puede resolver.
 */
export async function escribirSecciones(
  cliente: ClienteEscritura,
  db: D1Database,
  secciones: Bloque[],
  autor: string | null,
  slug = 'inicio',
): Promise<void> {
  const id = idPaginaDe(slug);
  try {
    const anteriores = await cliente.fetch<Bloque[] | null>(`*[_id == "${id}"][0].secciones`);
    if (anteriores?.length) await apilarVersion(db, anteriores, autor);
  } catch (error) {
    console.error('[pagina] No se pudo apilar la version anterior:', error);
  }

  await cliente
    .createIfNotExists({ _id: id, _type: 'pagina', slug: { _type: 'slug', current: slug }, secciones: [] })
    .catch(() => {});
  await cliente.patch(id).set({ secciones }).commit();
}
