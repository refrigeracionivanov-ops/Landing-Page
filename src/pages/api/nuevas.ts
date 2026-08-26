import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verificarAcceso } from '../../lib/acceso';

export const prerender = false;

const respuesta = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });

export const GET: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: 'Sin permiso.' }, 403);

  if (!env.DB) return respuesta({ total: 0 });

  try {
    const fila = await env.DB
      .prepare(`SELECT COUNT(*) AS total FROM solicitudes WHERE estado = 'nueva'`)
      .first<{ total: number }>();
    return respuesta({ total: fila?.total ?? 0 });
  } catch {
    return respuesta({ total: 0 });
  }
};
