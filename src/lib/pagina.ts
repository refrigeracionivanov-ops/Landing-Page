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

/** El documento de Sanity que dibuja la portada. Hoy hay una sola pagina. */
export const ID_PAGINA = 'pagina-inicio';

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
): Promise<void> {
  try {
    const anteriores = await cliente.fetch<Bloque[] | null>(`*[_id == "${ID_PAGINA}"][0].secciones`);
    if (anteriores?.length) await apilarVersion(db, anteriores, autor);
  } catch (error) {
    console.error('[pagina] No se pudo apilar la version anterior:', error);
  }

  await cliente.patch(ID_PAGINA).set({ secciones }).commit();
}
