import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verificarAcceso, firmaDeClave, iguales, obtenerHashClave, COOKIE_CLAVE } from '../../lib/acceso';

export const prerender = false;

const resp = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), {
    status: estado,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return resp({ error: 'Sin permiso.' }, 403);

  if (!env.DB) return resp({ error: 'Sin base de datos.' }, 500);

  let cuerpo: { claveActual?: unknown; claveNueva?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return resp({ error: 'JSON inválido.' }, 400);
  }

  const claveActual = typeof cuerpo.claveActual === 'string' ? cuerpo.claveActual.trim() : '';
  const claveNueva = typeof cuerpo.claveNueva === 'string' ? cuerpo.claveNueva : '';

  if (!claveNueva || claveNueva.length < 8) {
    return resp({ error: 'La clave nueva tiene que tener al menos 8 caracteres.' }, 400);
  }

  // Verificar que la clave actual sea correcta.
  const hashEsperado = await obtenerHashClave();
  if (!hashEsperado) return resp({ error: 'No hay clave configurada en el servidor.' }, 500);

  const hashIngresado = await firmaDeClave(claveActual);
  if (!iguales(hashIngresado, hashEsperado)) {
    return resp({ error: 'La clave actual no es correcta.' }, 400);
  }

  // Guardar el hash de la nueva clave en D1.
  const nuevoHash = await firmaDeClave(claveNueva);
  await env.DB
    .prepare('INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?)')
    .bind('clave_hash', nuevoHash)
    .run();

  // Actualizar la cookie de la sesion actual para que no quede cerrada.
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': [
        `${COOKIE_CLAVE}=${nuevoHash}`,
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        `Max-Age=${60 * 60 * 12}`,
      ].join('; '),
    },
  });
};
