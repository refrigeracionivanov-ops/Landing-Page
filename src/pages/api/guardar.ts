import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verificarAcceso } from '../../lib/acceso';
import { validarSecciones } from '../../lib/secciones';
import { clienteEscritura, escribirSecciones } from '../../lib/pagina';
import type { Bloque } from '../../tipos';

export const prerender = false;

/**
 * Guarda las secciones de la pagina desde el editor.
 *
 * El token de escritura vive en el servidor y nunca viaja al navegador: el
 * editor manda el contenido, este endpoint lo valida y recien entonces escribe
 * en Sanity. Es tambien el unico lugar donde se controla quien puede guardar.
 *
 * Lo que habia queda apilado en el historial antes de pisarse. Ver
 * `src/lib/pagina.ts` y `/api/versiones`.
 */

const respuesta = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: acceso.motivo ?? 'Sin permiso para guardar.' }, 403);

  const cliente = clienteEscritura();
  if (!cliente) {
    return respuesta({ error: 'Falta SANITY_WRITE_TOKEN en el servidor. Sin eso no se puede escribir.' }, 500);
  }

  let cuerpo: { secciones?: unknown; pagina?: unknown; tema?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return respuesta({ error: 'El cuerpo del pedido no es JSON válido.' }, 400);
  }

  const problema = validarSecciones(cuerpo.secciones);
  if (problema) return respuesta({ error: problema }, 400);

  const secciones = cuerpo.secciones as Bloque[];
  const slug = typeof cuerpo.pagina === 'string' && /^[a-z0-9-]+$/.test(cuerpo.pagina)
    ? cuerpo.pagina
    : 'inicio';
  const tema = typeof cuerpo.tema === 'string' ? cuerpo.tema : null;

  try {
    await escribirSecciones(cliente, env.DB, secciones, acceso.email ?? null, slug, tema);
    console.log(`[guardar] ${acceso.email ?? 'desconocido'} guardo ${secciones.length} secciones.`);
    return respuesta({ ok: true, secciones: secciones.length });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[guardar] Fallo la escritura en Sanity:', detalle);
    return respuesta({ error: `Sanity rechazó el guardado: ${detalle}` }, 502);
  }
};
