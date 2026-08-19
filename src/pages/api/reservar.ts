import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createClient } from '@sanity/client';
import { RESEND_API_KEY, NOTIFY_EMAIL, GOOGLE_CALENDAR_TIMEZONE, TURNSTILE_SECRET } from 'astro:env/server';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import { contarEnFranja, crearSolicitud, existeDuplicado } from '../../lib/solicitudes';
import type { SolicitudEntrante } from '../../tipos';

export const prerender = false;

// Sanity solo se consulta para leer la configuracion de franjas y cupos, que es
// contenido publico. Los datos del cliente van a D1, nunca aca.
const sanity = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  apiVersion: '2024-10-01',
  useCdn: true,
});

/**
 * Que dia es hoy para el negocio, no para el servidor.
 *
 * El worker corre en UTC. El cliente que agenda esta en Buenos Aires, tres
 * horas atras: entre las 21:00 y la medianoche el servidor ya cambio de dia
 * y el navegador no. Calculando "hoy" en UTC, la fecha minima quedaba un dia
 * adelante de la que el propio formulario proponia, y toda solicitud hecha en
 * esa franja se rechazaba con "esa fecha ya paso".
 *
 * `en-CA` formatea como AAAA-MM-DD, que es justo lo que viaja en el formulario.
 */
const hoyLocal = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: GOOGLE_CALENDAR_TIMEZONE || 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

/** Suma dias a una fecha AAAA-MM-DD sin que el huso vuelva a meter la cola. */
const sumarDias = (iso: string, dias: number) => {
  const fecha = new Date(`${iso}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
};

const responder = (estado: number, cuerpo: Record<string, unknown>) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  });

const CAMPOS_OBLIGATORIOS = [
  'nombre',
  'telefono',
  'distrito',
  'direccion',
  'tipoServicio',
  'fechaPreferida',
  'franja',
] as const;

const limpiar = (valor: unknown, maximo = 500) =>
  typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';

/**
 * Le pregunta a Cloudflare si del otro lado hay una persona.
 *
 * Tres comprobaciones, no una:
 *
 * - `success`, que el token sea valido y no este gastado;
 * - `action`, que venga de este formulario y no de otro del mismo sitio;
 * - `hostname`, que el widget se haya resuelto en el dominio desde el que se
 *   esta pidiendo. El widget acepta `localhost` para poder probar, y sin esta
 *   comprobacion cualquiera podria generar tokens validos desde su maquina y
 *   mandarlos a produccion.
 *
 * Si no hay secreto configurado, no verifica y deja pasar. Es deliberado: un
 * secreto mal cargado dejaria al negocio sin poder recibir una sola visita, y
 * eso es peor que el spam que evita. Los otros frenos siguen en pie.
 */
async function esPersona(token: string, anfitrionEsperado: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true;

  if (typeof token !== 'string' || !token || token.length > 2048) return false;

  try {
    const respuesta = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
    });

    if (!respuesta.ok) throw new Error(`siteverify respondio ${respuesta.status}`);

    const datos = (await respuesta.json()) as { success?: boolean; action?: string; hostname?: string };

    return datos.success === true && datos.action === 'agendar' && datos.hostname === anfitrionEsperado;
  } catch (error) {
    // Aca si se rechaza: llegamos con un token que no pudimos comprobar.
    console.error('[reservar] No se pudo verificar Turnstile:', error);
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const db = env.DB;

  if (!db) {
    console.error('[reservar] Falta el binding D1 "DB". Revisa wrangler.jsonc.');
    return responder(500, { mensaje: 'El formulario no esta disponible. Escribinos por WhatsApp.' });
  }

  /**
   * Freno por IP, antes de leer el cuerpo y antes de tocar la base.
   *
   * El formulario es publico — ese es el punto de una landing — asi que sin un
   * limite un script llena la agenda de basura, dispara un correo por cada
   * envio y ocupa los cupos de franjas reales. El campo trampa frena a los bots
   * tontos; esto frena al que insiste.
   *
   * Si el limitador falla, se deja pasar: es una defensa, no la puerta. Un
   * problema en Cloudflare no puede dejar al negocio sin recibir pedidos.
   */
  const ip = request.headers.get('cf-connecting-ip') ?? 'desconocida';

  try {
    const { success } = await env.LIMITE_RESERVAS.limit({ key: ip });

    if (!success) {
      console.warn(`[reservar] Limite por IP alcanzado: ${ip}`);
      return responder(429, {
        mensaje: 'Recibimos varios pedidos desde tu conexion. Espera un minuto o escribinos por WhatsApp.',
      });
    }
  } catch (error) {
    console.error('[reservar] El limitador no respondio, se deja pasar:', error);
  }

  let datos: SolicitudEntrante;

  try {
    datos = await request.json();
  } catch {
    return responder(400, { mensaje: 'No pudimos leer el formulario.' });
  }

  // Campo trampa. Un bot lo completa; una persona no lo ve. Respondemos 200 a
  // proposito para no darle informacion util a quien esta probando.
  if (limpiar(datos.sitioWeb)) {
    return responder(200, { ok: true });
  }

  /**
   * La verificacion va despues del campo trampa y antes de tocar la base.
   *
   * El anfitrion esperado sale del propio pedido y no de una lista en la
   * configuracion: asi vale `localhost` en desarrollo y el dominio real en
   * produccion, sin una variable mas que se olvida de actualizar el dia que
   * cambie el dominio.
   */
  if (!(await esPersona(limpiar(datos.turnstile, 2048), new URL(request.url).hostname, ip))) {
    return responder(403, {
      mensaje: 'No pudimos verificar que seas una persona. Recarga la pagina y proba de nuevo.',
    });
  }

  const campos = {
    nombre: limpiar(datos.nombre, 120),
    telefono: limpiar(datos.telefono, 40),
    distrito: limpiar(datos.distrito, 80),
    direccion: limpiar(datos.direccion, 200),
    tipoServicio: limpiar(datos.tipoServicio, 80),
    tipoEquipo: limpiar(datos.tipoEquipo, 80),
    descripcion: limpiar(datos.descripcion, 1000),
    fechaPreferida: limpiar(datos.fechaPreferida, 10),
    franja: limpiar(datos.franja, 80),
  };

  if (CAMPOS_OBLIGATORIOS.some((campo) => !campos[campo])) {
    return responder(400, { mensaje: 'Faltan algunos datos obligatorios del formulario.' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(campos.fechaPreferida)) {
    return responder(400, { mensaje: 'La fecha no tiene un formato valido.' });
  }

  const ajustes = await sanity
    .fetch<{ franjas?: { etiqueta: string; cupo: number }[]; diasAnticipacion?: number } | null>(
      `*[_type == "ajustes"][0]{franjas, diasAnticipacion}`,
    )
    .catch(() => null);

  // El navegador ya limita la fecha minima, pero eso se puede saltear.
  // La regla de verdad se aplica aca.
  const minimo = sumarDias(hoyLocal(), ajustes?.diasAnticipacion ?? 1);

  // Comparacion de textos: dos fechas en formato AAAA-MM-DD se ordenan solas.
  if (campos.fechaPreferida < minimo) {
    return responder(400, { mensaje: 'Esa fecha ya paso o es demasiado pronto. Elegi otro dia.' });
  }

  if (await existeDuplicado(db, campos.telefono, campos.fechaPreferida)) {
    return responder(409, {
      mensaje: 'Ya tenemos una solicitud tuya para ese dia. Te contactamos por WhatsApp a la brevedad.',
    });
  }

  const cupo = ajustes?.franjas?.find((f) => f.etiqueta === campos.franja)?.cupo;

  if (cupo && (await contarEnFranja(db, campos.fechaPreferida, campos.franja)) >= cupo) {
    return responder(409, {
      mensaje: 'Esa franja ya se lleno para ese dia. Proba con otro horario u otra fecha.',
    });
  }

  try {
    await crearSolicitud(db, {
      nombre: campos.nombre,
      telefono: campos.telefono,
      distrito: campos.distrito,
      direccion: campos.direccion,
      tipo_servicio: campos.tipoServicio,
      tipo_equipo: campos.tipoEquipo || null,
      descripcion: campos.descripcion || null,
      fecha_preferida: campos.fechaPreferida,
      franja: campos.franja,
    });
  } catch (error) {
    console.error('[reservar] No se pudo guardar en D1:', error);
    return responder(500, {
      mensaje: 'No pudimos guardar la solicitud. Escribinos por WhatsApp y te atendemos igual.',
    });
  }

  // El aviso por correo es secundario: si falla, la solicitud ya quedo guardada.
  if (RESEND_API_KEY && NOTIFY_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Web <onboarding@resend.dev>',
          to: [NOTIFY_EMAIL],
          subject: `Nueva visita: ${campos.nombre} (${campos.distrito})`,
          text: [
            `Nombre: ${campos.nombre}`,
            `Telefono: ${campos.telefono}`,
            `Distrito: ${campos.distrito}`,
            `Direccion: ${campos.direccion}`,
            `Servicio: ${campos.tipoServicio}`,
            `Equipo: ${campos.tipoEquipo || '-'}`,
            `Dia: ${campos.fechaPreferida} — ${campos.franja}`,
            '',
            `Problema: ${campos.descripcion || '-'}`,
          ].join('\n'),
        }),
      });
    } catch {
      // Silencio a proposito: no vamos a fallarle al cliente porque no salio un mail.
    }
  }

  return responder(200, { ok: true });
};
