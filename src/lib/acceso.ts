import { CF_ACCESS_TEAM_DOMAIN, CF_ACCESS_AUD } from 'astro:env/server';

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
}

export async function verificarAcceso(request: Request): Promise<ResultadoAcceso> {
  // En desarrollo no hay Cloudflare Access delante. Se avisa por consola para que
  // nadie confunda esto con "esta protegido".
  if (import.meta.env.DEV) {
    console.warn('[acceso] Modo desarrollo: el panel de solicitudes NO esta protegido.');
    return { autorizado: true, email: 'desarrollo@local' };
  }

  if (!CF_ACCESS_TEAM_DOMAIN || !CF_ACCESS_AUD) {
    return { autorizado: false, motivo: 'Faltan CF_ACCESS_TEAM_DOMAIN o CF_ACCESS_AUD en las variables de entorno.' };
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
