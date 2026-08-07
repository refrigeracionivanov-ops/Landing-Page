import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';
import {
  SANITY_WRITE_TOKEN,
  RESEND_API_KEY,
  NOTIFY_EMAIL,
} from 'astro:env/server';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import type { SolicitudEntrante } from '../../tipos';

// Unica ruta que corre en el servidor. Todo el resto del sitio es estatico.
export const prerender = false;

const cliente = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  apiVersion: '2024-10-01',
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

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

export const POST: APIRoute = async ({ request }) => {
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

  const solicitud = {
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

  const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => !solicitud[campo]);
  if (faltantes.length) {
    return responder(400, { mensaje: 'Faltan algunos datos obligatorios del formulario.' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(solicitud.fechaPreferida)) {
    return responder(400, { mensaje: 'La fecha no tiene un formato valido.' });
  }

  // El navegador ya limita la fecha minima, pero eso se puede saltear.
  // La regla de verdad se aplica aca.
  const ajustes = await cliente.fetch<{ franjas?: { etiqueta: string; cupo: number }[]; diasAnticipacion?: number } | null>(
    `*[_type == "ajustes"][0]{franjas, diasAnticipacion}`,
  );

  const minimo = new Date();
  minimo.setHours(0, 0, 0, 0);
  minimo.setDate(minimo.getDate() + (ajustes?.diasAnticipacion ?? 1));

  if (new Date(`${solicitud.fechaPreferida}T00:00:00`) < minimo) {
    return responder(400, { mensaje: 'Esa fecha ya paso o es demasiado pronto. Elegi otro dia.' });
  }

  // Un mismo telefono no puede acumular solicitudes abiertas para el mismo dia.
  const duplicada = await cliente.fetch<boolean>(
    `count(*[_type == "solicitud" && telefono == $telefono && fechaPreferida == $fecha && estado != "cancelada"]) > 0`,
    { telefono: solicitud.telefono, fecha: solicitud.fechaPreferida },
  );

  if (duplicada) {
    return responder(409, {
      mensaje: 'Ya tenemos una solicitud tuya para ese dia. Te contactamos por WhatsApp a la brevedad.',
    });
  }

  // Cupo por franja: la franja se llena cuando se alcanza el numero configurado en Ajustes.
  const cupo = ajustes?.franjas?.find((f) => f.etiqueta === solicitud.franja)?.cupo;

  if (cupo) {
    const tomadas = await cliente.fetch<number>(
      `count(*[_type == "solicitud" && fechaPreferida == $fecha && franja == $franja && estado in ["nueva", "contactada", "agendada"]])`,
      { fecha: solicitud.fechaPreferida, franja: solicitud.franja },
    );

    if (tomadas >= cupo) {
      return responder(409, {
        mensaje: 'Esa franja ya se lleno para ese dia. Proba con otro horario u otra fecha.',
      });
    }
  }

  try {
    await cliente.create({ _type: 'solicitud', estado: 'nueva', ...solicitud });
  } catch {
    return responder(500, {
      mensaje: 'No pudimos guardar la solicitud. Escribinos por WhatsApp y te atendemos igual.',
    });
  }

  // El aviso por correo es secundario: si falla, la solicitud ya quedo guardada.
  if (RESEND_API_KEY && NOTIFY_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Web <onboarding@resend.dev>',
          to: [NOTIFY_EMAIL],
          subject: `Nueva visita: ${solicitud.nombre} (${solicitud.distrito})`,
          text: [
            `Nombre: ${solicitud.nombre}`,
            `Telefono: ${solicitud.telefono}`,
            `Distrito: ${solicitud.distrito}`,
            `Direccion: ${solicitud.direccion}`,
            `Servicio: ${solicitud.tipoServicio}`,
            `Equipo: ${solicitud.tipoEquipo || '-'}`,
            `Dia: ${solicitud.fechaPreferida} — ${solicitud.franja}`,
            '',
            `Problema: ${solicitud.descripcion || '-'}`,
          ].join('\n'),
        }),
      });
    } catch {
      // Silencio a proposito: no vamos a fallarle al cliente porque no salio un mail.
    }
  }

  return responder(200, { ok: true });
};
