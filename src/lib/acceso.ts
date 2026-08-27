import { CF_ACCESS_TEAM_DOMAIN, CF_ACCESS_AUD, CLAVE_EDITOR } from 'astro:env/server';
import { env } from 'cloudflare:workers';

/**
 * Verificacion del token de Cloudflare Access.
 *
 * Cloudflare Access ya bloquea la ruta en el borde: quien no inicio sesion nunca
 * llega hasta aca. Pero la URL interna del deployment (*.pages.dev) puede quedar
 * accesible sin pasar por Access, asi que validamos el token igual. Es la unica
 * barrera entre internet y los datos personales de los clientes.
 */

interface ClavePublica {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
}

let cacheClaves: { claves: ClavePublica[]; expira: number } | null = null;

const decodificarBase64Url = (texto: string): Uint8Array<ArrayBuffer> => {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(texto.length / 4) * 4, '=');
  const binario = atob(base64);
  // Se construye sobre un ArrayBuffer propio: `Uint8Array.from` devuelve un tipo
  // mas laxo que crypto.subtle no acepta.
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
};

const leerJson = (parte: string): Record<string, unknown> =>
  JSON.parse(new TextDecoder().decode(decodificarBase64Url(parte)));

async function obtenerClaves(dominio: string): Promise<ClavePublica[]> {
  // Las claves rotan, pero no cada minuto. Una hora de cache evita pedirlas
  // en cada carga del panel.
  if (cacheClaves && cacheClaves.expira > Date.now()) return cacheClaves.claves;

  const respuesta = await fetch(`https://${dominio}/cdn-cgi/access/certs`);
  if (!respuesta.ok) throw new Error('No se pudieron obtener las claves de Cloudflare Access');

  const { keys } = (await respuesta.json()) as { keys: ClavePublica[] };
  cacheClaves = { claves: keys, expira: Date.now() + 3_600_000 };
  return keys;
}

export interface ResultadoAcceso {
  autorizado: boolean;
  email?: string;
  motivo?: string;
  /** `true` cuando alcanza con escribir la clave para entrar. Lo usa /administrador
   *  para mostrar el formulario en vez de una pantalla de error. */
  pideClave?: boolean;
}

export const COOKIE_CLAVE = 'acceso_editor';

/**
 * Lo que se guarda en la cookie: un hash de la clave, no la clave.
 *
 * Si alguien lee la cookie del navegador no se lleva la contrasena, y como el
 * servidor recalcula el hash en cada pedido, cambiar `CLAVE_EDITOR` invalida
 * todas las sesiones abiertas de una.
 */
export async function firmaDeClave(clave: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`acceso-editor:${clave}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Devuelve el hash de autenticación vigente.
 *
 * Primero mira la tabla `configuracion` de D1 (donde el panel guarda los
 * cambios de clave). Si no hay entrada, calcula el hash de CLAVE_EDITOR.
 * Si tampoco existe eso, devuelve null: sin proteccion configurada.
 */
export async function obtenerHashClave(): Promise<string | null> {
  try {
    if (env.DB) {
      const fila = await env.DB
        .prepare('SELECT valor FROM configuracion WHERE clave = ?')
        .bind('clave_hash')
        .first<{ valor: string }>();
      if (fila?.valor) return fila.valor;
    }
  } catch { /* tabla no existe todavia o D1 no disponible: sigue con env */ }
  if (CLAVE_EDITOR) return firmaDeClave(CLAVE_EDITOR);
  return null;
}

/** Comparacion de tiempo constante: no revela cuantos caracteres coinciden. */
export function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

const leerCookie = (request: Request, nombre: string) =>
  (request.headers.get('cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${nombre}=([^;]+)`))?.[1];

export async function verificarAcceso(request: Request): Promise<ResultadoAcceso> {
  // En desarrollo no hay Cloudflare Access delante. Se avisa por consola para que
  // nadie confunda esto con "esta protegido".
  if (import.meta.env.DEV) {
    console.warn('[acceso] Modo desarrollo: /solicitudes, /administrador y sus endpoints NO estan protegidos.');
    return { autorizado: true, email: 'desarrollo@local' };
  }

  /**
   * Puerta provisoria por clave.
   *
   * Cloudflare Access solo protege dominios propios, y en un `*.workers.dev`
   * no se puede usar. Mientras tanto vale una clave compartida en
   * `CLAVE_EDITOR`. Es mas debil a proposito: una sola clave para todos, sin
   * registro de quien entro y sin poder revocar a una persona sola. En cuanto
   * existan las variables de Access, esta rama deja de usarse sola.
   */
  if (!CF_ACCESS_TEAM_DOMAIN || !CF_ACCESS_AUD) {
    const hashEsperado = await obtenerHashClave();
    if (!hashEsperado) {
      return {
        autorizado: false,
        motivo: 'No hay ninguna proteccion configurada. Falta CLAVE_EDITOR, o las dos variables de Cloudflare Access.',
      };
    }

    const cookie = leerCookie(request, COOKIE_CLAVE);
    if (cookie && iguales(cookie, hashEsperado)) {
      return { autorizado: true, email: 'clave-compartida' };
    }

    return { autorizado: false, pideClave: true, motivo: 'Hace falta la clave para entrar.' };
  }

  const cookie = request.headers.get('cookie') ?? '';
  const token =
    request.headers.get('cf-access-jwt-assertion') ??
    cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1];

  if (!token) return { autorizado: false, motivo: 'No llego el token de Cloudflare Access.' };

  const [cabecera, cuerpo, firma] = token.split('.');
  if (!cabecera || !cuerpo || !firma) return { autorizado: false, motivo: 'Token mal formado.' };

  try {
    const { kid, alg } = leerJson(cabecera) as { kid?: string; alg?: string };
    if (alg !== 'RS256') return { autorizado: false, motivo: 'Algoritmo de firma inesperado.' };

    const claves = await obtenerClaves(CF_ACCESS_TEAM_DOMAIN);
    const clave = claves.find((c) => c.kid === kid);
    if (!clave) return { autorizado: false, motivo: 'La clave del token no figura entre las de Access.' };

    const clavePublica = await crypto.subtle.importKey(
      'jwk',
      { kty: clave.kty, n: clave.n, e: clave.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const firmaValida = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      clavePublica,
      decodificarBase64Url(firma),
      new TextEncoder().encode(`${cabecera}.${cuerpo}`),
    );

    if (!firmaValida) return { autorizado: false, motivo: 'La firma del token no es valida.' };

    const datos = leerJson(cuerpo) as { aud?: string | string[]; exp?: number; email?: string };

    const audiencias = Array.isArray(datos.aud) ? datos.aud : [datos.aud];
    if (!audiencias.includes(CF_ACCESS_AUD)) {
      return { autorizado: false, motivo: 'El token es de otra aplicacion.' };
    }

    if (!datos.exp || datos.exp * 1000 < Date.now()) {
      return { autorizado: false, motivo: 'El token vencio. Volve a iniciar sesion.' };
    }

    return { autorizado: true, email: datos.email };
  } catch {
    return { autorizado: false, motivo: 'No se pudo verificar el token.' };
  }
}
