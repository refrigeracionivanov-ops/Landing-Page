import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';
import { SANITY_WRITE_TOKEN } from 'astro:env/server';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import { verificarAcceso } from '../../lib/acceso';

export const prerender = false;

/**
 * Sube una imagen a Sanity desde el editor.
 *
 * Igual que /api/guardar: el token de escritura no sale del servidor. El
 * navegador manda el archivo, esto lo valida y lo reenvia a Sanity, que se
 * encarga del almacenamiento, el recorte y las versiones optimizadas.
 */

const MAXIMO = 10 * 1024 * 1024;
const FORMATOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']);

const respuesta = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: acceso.motivo ?? 'Sin permiso para subir imágenes.' }, 403);

  if (!SANITY_WRITE_TOKEN) return respuesta({ error: 'Falta SANITY_WRITE_TOKEN en el servidor.' }, 500);

  let archivo: File | null = null;
  try {
    const formulario = await request.formData();
    const valor = formulario.get('archivo');
    if (valor instanceof File) archivo = valor;
  } catch {
    return respuesta({ error: 'No se pudo leer el archivo.' }, 400);
  }

  if (!archivo) return respuesta({ error: 'No llegó ningún archivo.' }, 400);

  if (!FORMATOS.has(archivo.type)) {
    return respuesta({ error: `Formato no admitido (${archivo.type || 'desconocido'}). Usá JPG, PNG, WebP o AVIF.` }, 400);
  }

  if (archivo.size > MAXIMO) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1);
    return respuesta({ error: `La imagen pesa ${mb} MB y el máximo son 10 MB.` }, 400);
  }

  const cliente = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    apiVersion: '2024-10-01',
    token: SANITY_WRITE_TOKEN,
    useCdn: false,
  });

  try {
    // Se manda el File tal cual: el cliente de Sanity acepta Blob y lo pasa
    // directo a fetch. Convertirlo a bytes obligaba a cargar la imagen entera
    // en memoria del worker y ademas no encaja con el tipo que espera (Buffer,
    // que es de Node y aca no existe).
    const asset = await cliente.assets.upload('image', archivo, {
      filename: archivo.name || 'imagen',
      contentType: archivo.type,
    });

    console.log(`[imagen] ${acceso.email ?? 'desconocido'} subio ${archivo.name} (${asset._id}).`);

    // Esta es la forma que espera el sitio: una referencia, no una URL suelta.
    // Asi el CDN de Sanity puede recortar y comprimir segun donde se use.
    return respuesta({
      ok: true,
      imagen: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      vistaPrevia: asset.url,
    });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[imagen] Fallo la subida:', detalle);
    return respuesta({ error: `Sanity rechazó la imagen: ${detalle}` }, 502);
  }
};
