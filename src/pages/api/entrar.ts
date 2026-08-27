import type { APIRoute } from 'astro';
import { COOKIE_CLAVE, firmaDeClave, iguales, obtenerHashClave } from '../../lib/acceso';

export const prerender = false;

/**
 * Canjea la clave compartida por una cookie de sesion.
 *
 * Solo existe mientras no haya Cloudflare Access. Ver src/lib/acceso.ts.
 */

/** Freno simple contra fuerza bruta, por IP y en memoria del worker. */
const intentos = new Map<string, { cantidad: number; hasta: number }>();
const MAXIMO = 8;
const ESPERA = 10 * 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
  const hashEsperado = await obtenerHashClave();
  if (!hashEsperado) {
    return new Response('No hay clave configurada en el servidor.', { status: 500 });
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'desconocida';
  const registro = intentos.get(ip);

  if (registro && registro.cantidad >= MAXIMO && registro.hasta > Date.now()) {
    const minutos = Math.ceil((registro.hasta - Date.now()) / 60000);
    return new Response(`Demasiados intentos. Volve a probar en ${minutos} minutos.`, { status: 429 });
  }

  const formulario = await request.formData();
  const clave = String(formulario.get('clave') ?? '');
  const destino = String(formulario.get('destino') ?? '/administrador');

  // `destino` viene del formulario, asi que solo se aceptan rutas internas:
  // si no, cualquiera podria armar un enlace que redirija a otro sitio.
  const aDonde = destino.startsWith('/') && !destino.startsWith('//') ? destino : '/administrador';

  const hashIngresado = await firmaDeClave(clave);
  if (!iguales(hashIngresado, hashEsperado)) {
    const cantidad = (registro?.cantidad ?? 0) + 1;
    intentos.set(ip, { cantidad, hasta: Date.now() + ESPERA });
    return new Response(null, {
      status: 303,
      headers: { location: `${aDonde}?error=1` },
    });
  }

  intentos.delete(ip);

  return new Response(null, {
    status: 303,
    headers: {
      location: aDonde,
      'set-cookie': [
        `${COOKIE_CLAVE}=${hashEsperado}`,
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        `Max-Age=${60 * 60 * 12}`,
      ].join('; '),
    },
  });
};
