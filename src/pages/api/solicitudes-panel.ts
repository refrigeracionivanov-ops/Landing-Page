import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verificarAcceso } from '../../lib/acceso';
import { listarSolicitudes, actualizarSolicitud } from '../../lib/solicitudes';
import { sincronizar } from '../../lib/calendario';

export const prerender = false;

const resp = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), {
    status: estado,
    headers: { 'content-type': 'application/json' },
  });

export const GET: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return resp({ error: 'Sin permiso.' }, 403);
  if (!env.DB) return resp({ solicitudes: [] });

  try {
    const todas = await listarSolicitudes(env.DB);
    return resp({ solicitudes: todas.slice(0, 20) });
  } catch {
    return resp({ solicitudes: [] });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return resp({ error: 'Sin permiso.' }, 403);
  if (!env.DB) return resp({ error: 'Sin DB.' }, 500);

  let cuerpo: { id?: unknown; accion?: unknown };
  try {
    cuerpo = (await request.json()) as { id?: unknown; accion?: unknown };
  } catch {
    return resp({ error: 'JSON inválido.' }, 400);
  }

  const id = Number(cuerpo.id);
  if (!Number.isInteger(id) || id < 1) return resp({ error: 'ID inválido.' }, 400);

  const estado =
    cuerpo.accion === 'aceptar' ? 'agendada' :
    cuerpo.accion === 'rechazar' ? 'cancelada' : null;

  if (!estado) return resp({ error: 'Acción inválida. Debe ser "aceptar" o "rechazar".' }, 400);

  await actualizarSolicitud(env.DB, id, { estado });
  await sincronizar(env.DB, id);

  return resp({ ok: true });
};
