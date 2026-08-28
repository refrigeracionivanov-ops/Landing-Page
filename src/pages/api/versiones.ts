import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verificarAcceso } from '../../lib/acceso';
import { validarSecciones } from '../../lib/secciones';
import { clienteEscritura, escribirSecciones } from '../../lib/pagina';
import { listarVersiones, obtenerVersion, MAXIMO_VERSIONES } from '../../lib/versiones';

export const prerender = false;

/**
 * El historial de la pagina: GET lista, POST restaura.
 *
 * Restaurar no es un caso aparte de guardar. Toma el contenido de una version
 * vieja y lo guarda como si alguien lo hubiera escrito recien, lo que deja lo
 * que habia apilado en el historial. Asi restaurar tambien se deshace, que es
 * lo primero que hace falta cuando uno restaura la version equivocada.
 */

const respuesta = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });

export const GET: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: acceso.motivo ?? 'Sin permiso para ver el historial.' }, 403);

  try {
    return respuesta({ versiones: await listarVersiones(env.DB), maximo: MAXIMO_VERSIONES });
  } catch (error) {
    console.error('[versiones] No se pudo leer el historial:', error);
    return respuesta({ error: 'No se pudo leer el historial.' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: acceso.motivo ?? 'Sin permiso para restaurar.' }, 403);

  const cliente = clienteEscritura();
  if (!cliente) {
    return respuesta({ error: 'Falta SANITY_WRITE_TOKEN en el servidor. Sin eso no se puede escribir.' }, 500);
  }

  let cuerpo: { id?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return respuesta({ error: 'El cuerpo del pedido no es JSON válido.' }, 400);
  }

  const id = Number(cuerpo.id);
  if (!Number.isInteger(id) || id < 1) return respuesta({ error: 'Falta el número de versión.' }, 400);

  const version = await obtenerVersion(env.DB, id);
  if (!version) return respuesta({ error: 'Esa versión ya no está en el historial.' }, 404);

  const { secciones, tema } = version;

  /**
   * Se valida aunque la escribimos nosotros: entre aquel guardado y hoy pudo
   * sacarse del codigo un tipo de bloque, y publicar una pagina con una seccion
   * que ya no existe es peor que avisar que esa version quedo vieja.
   */
  const problema = validarSecciones(secciones);
  if (problema) {
    return respuesta({ error: `Esa versión ya no se puede usar: ${problema}` }, 409);
  }

  try {
    await escribirSecciones(cliente, env.DB, secciones, acceso.email ?? null);
    console.log(`[versiones] ${acceso.email ?? 'desconocido'} restauro la version ${id}.`);
    return respuesta({ ok: true, secciones: secciones.length, tema });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[versiones] Fallo la restauracion:', detalle);
    return respuesta({ error: `Sanity rechazó la restauración: ${detalle}` }, 502);
  }
};
