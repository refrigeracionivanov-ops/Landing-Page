import {
  GOOGLE_SA_EMAIL,
  GOOGLE_SA_PRIVATE_KEY,
  GOOGLE_CALENDAR_ID,
  GOOGLE_CALENDAR_TIMEZONE,
} from 'astro:env/server';
import { guardarEventoId, obtenerSolicitud, type Solicitud } from './solicitudes';

/**
 * Espejo de las visitas agendadas en Google Calendar.
 *
 * D1 sigue siendo la fuente de verdad. El calendario es la vista para el dia a
 * dia: suena el celular, se ve junto al resto de la agenda, y no hay que
 * aprender ninguna herramienta nueva.
 *
 * Autenticacion por cuenta de servicio, no OAuth: no hay refresh token que
 * caduque ni sesion que alguien tenga que volver a iniciar. Alcanza con
 * compartir el calendario con el correo de la cuenta de servicio dandole
 * permiso de "hacer cambios en los eventos".
 */

const ZONA = GOOGLE_CALENDAR_TIMEZONE || 'America/Argentina/Buenos_Aires';
const API = 'https://www.googleapis.com/calendar/v3/calendars';

export const calendarioConfigurado = () =>
  Boolean(GOOGLE_SA_EMAIL && GOOGLE_SA_PRIVATE_KEY && GOOGLE_CALENDAR_ID);

/* ------------------------------------------------------------------ Auth */

const base64Url = (datos: ArrayBuffer | string) => {
  const binario =
    typeof datos === 'string' ? datos : String.fromCharCode(...new Uint8Array(datos));
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function importarClave(pem: string): Promise<CryptoKey> {
  // En las variables de entorno los saltos de linea viajan escapados.
  const limpio = pem
    .replace(/\\n/g, '\n')
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  const binario = atob(limpio);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);

  return crypto.subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

let cacheToken: { token: string; expira: number } | null = null;

async function obtenerToken(): Promise<string> {
  // El token dura una hora. Se renueva cinco minutos antes para no quedar
  // justo al limite en medio de una peticion.
  if (cacheToken && cacheToken.expira > Date.now()) return cacheToken.token;

  const ahora = Math.floor(Date.now() / 1000);

  const cabecera = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = base64Url(
    JSON.stringify({
      iss: GOOGLE_SA_EMAIL,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      iat: ahora,
      exp: ahora + 3600,
    }),
  );

  const clave = await importarClave(GOOGLE_SA_PRIVATE_KEY!);
  const firma = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    clave,
    new TextEncoder().encode(`${cabecera}.${cuerpo}`),
  );

  const respuesta = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${cabecera}.${cuerpo}.${base64Url(firma)}`,
    }),
  });

  if (!respuesta.ok) {
    throw new Error(`Google rechazo las credenciales: ${await respuesta.text()}`);
  }

  const { access_token, expires_in } = (await respuesta.json()) as {
    access_token: string;
    expires_in: number;
  };

  cacheToken = { token: access_token, expira: Date.now() + (expires_in - 300) * 1000 };
  return access_token;
}

/* --------------------------------------------------------------- Evento */

/**
 * Saca las horas de la etiqueta de la franja, ej. "Manana (8:00 - 12:00)".
 * Si la etiqueta no las trae, el evento se crea de dia completo en vez de
 * inventar un horario.
 */
function horasDeFranja(franja: string): { desde: string; hasta: string } | null {
  const coincidencia = franja.match(/(\d{1,2}):(\d{2})\s*[-–a]\s*(\d{1,2}):(\d{2})/);
  if (!coincidencia) return null;

  const [, h1, m1, h2, m2] = coincidencia;
  return {
    desde: `${h1!.padStart(2, '0')}:${m1}:00`,
    hasta: `${h2!.padStart(2, '0')}:${m2}:00`,
  };
}

function construirEvento(solicitud: Solicitud) {
  const horas = horasDeFranja(solicitud.franja);

  const cuando = horas
    ? {
        start: { dateTime: `${solicitud.fecha_preferida}T${horas.desde}`, timeZone: ZONA },
        end: { dateTime: `${solicitud.fecha_preferida}T${horas.hasta}`, timeZone: ZONA },
      }
    : {
        start: { date: solicitud.fecha_preferida },
        end: { date: solicitud.fecha_preferida },
      };

  return {
    summary: `Visita: ${solicitud.nombre} — ${solicitud.tipo_servicio}`,
    location: `${solicitud.direccion}, ${solicitud.distrito}`,
    description: [
      `Telefono: ${solicitud.telefono}`,
      `Servicio: ${solicitud.tipo_servicio}`,
      `Equipo: ${solicitud.tipo_equipo ?? '-'}`,
      `Franja: ${solicitud.franja}`,
      '',
      `Problema: ${solicitud.descripcion ?? '-'}`,
      solicitud.notas ? `\nNotas: ${solicitud.notas}` : '',
    ].join('\n'),
    ...cuando,
  };
}

async function pedir(ruta: string, metodo: string, cuerpo?: unknown) {
  const respuesta = await fetch(`${API}/${encodeURIComponent(GOOGLE_CALENDAR_ID!)}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${await obtenerToken()}`,
      'Content-Type': 'application/json',
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  // 404 y 410 al borrar significan que el evento ya no esta. Es el estado que
  // buscabamos, no un error.
  if (!respuesta.ok && !(metodo === 'DELETE' && [404, 410].includes(respuesta.status))) {
    throw new Error(`Google Calendar respondio ${respuesta.status}: ${await respuesta.text()}`);
  }

  return respuesta.status === 204 ? null : await respuesta.json().catch(() => null);
}

/** Crea el evento y devuelve su id, o `null` si el calendario no esta configurado. */
export async function crearEvento(solicitud: Solicitud): Promise<string | null> {
  if (!calendarioConfigurado()) return null;

  const evento = (await pedir('/events', 'POST', construirEvento(solicitud))) as { id?: string } | null;
  return evento?.id ?? null;
}

export async function actualizarEvento(solicitud: Solicitud, eventoId: string): Promise<void> {
  if (!calendarioConfigurado()) return;
  await pedir(`/events/${encodeURIComponent(eventoId)}`, 'PATCH', construirEvento(solicitud));
}

export async function borrarEvento(eventoId: string): Promise<void> {
  if (!calendarioConfigurado()) return;
  await pedir(`/events/${encodeURIComponent(eventoId)}`, 'DELETE');
}

/* ---------------------------------------------------------- Sincronizar */

/** Estados en los que la visita ocupa un lugar real en el calendario. */
const ESTADOS_CON_EVENTO = ['agendada', 'completada'];

/**
 * Alinea el calendario con lo que dice D1 para una solicitud.
 *
 * Nunca lanza: si Google falla, el cambio de estado ya quedo guardado y no
 * tiene sentido hacerle perder el trabajo a quien esta usando el panel.
 * Devuelve `false` para que la pagina pueda avisar que el espejo no se hizo.
 */
export async function sincronizar(db: D1Database, id: number): Promise<boolean> {
  if (!calendarioConfigurado()) return true;

  try {
    const solicitud = await obtenerSolicitud(db, id);
    if (!solicitud) return true;

    if (ESTADOS_CON_EVENTO.includes(solicitud.estado)) {
      if (solicitud.evento_id) {
        await actualizarEvento(solicitud, solicitud.evento_id);
      } else {
        const eventoId = await crearEvento(solicitud);
        if (eventoId) await guardarEventoId(db, id, eventoId);
      }
      return true;
    }

    // Volvio a un estado sin visita confirmada (o se cancelo): el evento sobra.
    if (solicitud.evento_id) {
      await borrarEvento(solicitud.evento_id);
      await guardarEventoId(db, id, null);
    }

    return true;
  } catch (error) {
    console.error('[calendario] No se pudo sincronizar la solicitud', id, error);
    return false;
  }
}
