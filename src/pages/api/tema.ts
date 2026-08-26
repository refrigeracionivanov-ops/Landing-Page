import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';
import { SANITY_WRITE_TOKEN } from 'astro:env/server';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import { verificarAcceso } from '../../lib/acceso';

export const prerender = false;

const respuesta = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: acceso.motivo ?? 'Sin permiso.' }, 403);

  if (!SANITY_WRITE_TOKEN) return respuesta({ error: 'Falta SANITY_WRITE_TOKEN.' }, 500);

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return respuesta({ error: 'JSON inválido.' }, 400);
  }

  const { tema } = cuerpo;
  if (tema !== 'compacto' && tema !== 'complejo') {
    return respuesta({ error: 'Tema inválido. Debe ser "compacto" o "complejo".' }, 400);
  }

  const cliente = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    apiVersion: '2024-10-01',
    token: SANITY_WRITE_TOKEN,
    useCdn: false,
  });

  try {
    await cliente.patch('ajustes').set({ tema }).commit();
    return respuesta({ ok: true });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    return respuesta({ error: `Sanity rechazó el guardado: ${detalle}` }, 502);
  }
};
