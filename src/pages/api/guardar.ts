import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';
import { SANITY_WRITE_TOKEN } from 'astro:env/server';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import { verificarAcceso } from '../../lib/acceso';
// La lista de tipos sale del adaptador, no del esquema de Sanity: importar
// `schemaTypes/bloques` arrastraria el paquete `sanity` entero (es codigo del
// studio, para el navegador) a un Worker, donde ni siquiera carga. Ademas asi
// el editor y el servidor comparten una sola lista y no pueden desincronizarse.
import { TIPOS } from '../../editor/adaptador';

export const prerender = false;

/**
 * Guarda las secciones de la pagina desde el editor.
 *
 * El token de escritura vive aca y nunca viaja al navegador: el editor manda
 * el contenido, este endpoint lo valida y recien entonces escribe en Sanity.
 * Es tambien el unico lugar donde se controla quien puede guardar.
 */

const TIPOS_VALIDOS = new Set(Object.keys(TIPOS));

const respuesta = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });

/** Rechaza cualquier cosa que no sea una lista de bloques conocidos y bien formados. */
function validar(secciones: unknown): string | null {
  if (!Array.isArray(secciones)) return 'El contenido tiene que ser una lista de secciones.';
  if (secciones.length > 60) return 'Demasiadas secciones.';

  const claves = new Set<string>();

  for (const [i, bloque] of secciones.entries()) {
    if (!bloque || typeof bloque !== 'object') return `La sección ${i + 1} no es válida.`;

    const { _key, _type } = bloque as Record<string, unknown>;

    if (typeof _type !== 'string' || !TIPOS_VALIDOS.has(_type)) {
      return `La sección ${i + 1} es de un tipo desconocido (${String(_type)}).`;
    }
    if (typeof _key !== 'string' || !_key) return `A la sección ${i + 1} le falta el identificador.`;
    if (claves.has(_key)) return `Hay dos secciones con el mismo identificador (${_key}).`;

    claves.add(_key);
  }

  return null;
}

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: acceso.motivo ?? 'Sin permiso para guardar.' }, 403);

  if (!SANITY_WRITE_TOKEN) {
    return respuesta({ error: 'Falta SANITY_WRITE_TOKEN en el servidor. Sin eso no se puede escribir.' }, 500);
  }

  let cuerpo: { secciones?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return respuesta({ error: 'El cuerpo del pedido no es JSON válido.' }, 400);
  }

  const problema = validar(cuerpo.secciones);
  if (problema) return respuesta({ error: problema }, 400);

  const cliente = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    apiVersion: '2024-10-01',
    token: SANITY_WRITE_TOKEN,
    // Escrituras nunca por CDN: devuelve contenido cacheado.
    useCdn: false,
  });

  try {
    await cliente.patch('pagina-inicio').set({ secciones: cuerpo.secciones }).commit();
    console.log(`[guardar] ${acceso.email ?? 'desconocido'} guardo ${(cuerpo.secciones as unknown[]).length} secciones.`);
    return respuesta({ ok: true, secciones: (cuerpo.secciones as unknown[]).length });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[guardar] Fallo la escritura en Sanity:', detalle);
    return respuesta({ error: `Sanity rechazó el guardado: ${detalle}` }, 502);
  }
};
