import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verificarAcceso } from '../../lib/acceso';

export const prerender = false;

// Cloudflare cierra streams largos; reconectar cada 3 min es seguro y limpio.
const MAX_MS = 3 * 60 * 1000;
const INTERVALO_MS = 5_000;

export const GET: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) {
    return new Response('Sin permiso.', { status: 403 });
  }

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  let cerrado = false;

  const cerrar = () => {
    if (!cerrado) {
      cerrado = true;
      writer.close().catch(() => {});
    }
  };

  request.signal.addEventListener('abort', cerrar);

  const escribir = (texto: string) =>
    writer.write(encoder.encode(texto)).catch(cerrar);

  let ultimoTotal = -1;

  const consultar = async () => {
    if (cerrado || !env.DB) return;
    try {
      const fila = await env.DB
        .prepare(`SELECT COUNT(*) AS total FROM solicitudes WHERE estado = 'nueva'`)
        .first<{ total: number }>();
      const total = fila?.total ?? 0;
      if (total !== ultimoTotal) {
        ultimoTotal = total;
        await escribir(`data: ${JSON.stringify({ total })}\n\n`);
      }
    } catch { /* silencioso */ }
  };

  const loop = async () => {
    await consultar();
    const inicio = Date.now();
    while (!cerrado && Date.now() - inicio < MAX_MS) {
      await new Promise<void>(resolve => setTimeout(resolve, INTERVALO_MS));
      await consultar();
      if (!cerrado) await escribir(': ping\n\n');
    }
    cerrar();
  };

  loop();

  return new Response(readable, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
};
