import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';
import { SANITY_WRITE_TOKEN } from 'astro:env/server';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import { verificarAcceso } from '../../lib/acceso';

export const prerender = false;

/**
 * Guarda los ajustes del negocio.
 *
 * Estos campos no son texto decorativo: el telefono y el WhatsApp son la unica
 * via de contacto del sitio, y las franjas con su cupo son lo que decide que
 * puede pedir un cliente al agendar. Un valor mal guardado no se ve feo, deja
 * de funcionar — por eso se valida cada campo antes de escribir, con las mismas
 * reglas que declara el esquema en `src/sanity/schemaTypes/documentos.ts`.
 */

const respuesta = (datos: object, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });

interface Franja {
  etiqueta: string;
  cupo: number;
}

const texto = (valor: unknown) => (typeof valor === 'string' ? valor.trim() : '');

/**
 * Devuelve el mensaje del primer problema, o `null` si esta todo bien.
 *
 * Un solo error por vez y en castellano llano: quien usa esta pantalla no
 * programa, y una lista de fallas tecnicas no le dice que arreglar.
 */
function validar(datos: Record<string, unknown>): string | null {
  if (!texto(datos.nombre)) return 'El nombre del negocio no puede quedar vacio.';
  if (!texto(datos.telefono)) return 'El telefono no puede quedar vacio: es el numero que aparece en toda la pagina.';

  const whatsapp = texto(datos.whatsapp);
  if (!whatsapp) return 'El WhatsApp no puede quedar vacio.';
  if (!/^\d{8,15}$/.test(whatsapp)) {
    return 'El WhatsApp va con solo numeros, sin +, espacios ni guiones. Ej: 51999888777';
  }

  const email = texto(datos.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo no parece un correo.';

  const google = texto(datos.googleResenas);
  if (google && !/^https:\/\/[^\s]+$/.test(google)) {
    return 'El enlace de resenas de Google tiene que empezar con https:// y no llevar espacios.';
  }

  if (datos.mostrarBarraContacto !== undefined && typeof datos.mostrarBarraContacto !== 'boolean') {
    return 'El valor de la barra de contacto no es valido.';
  }

  const dias = datos.diasAnticipacion;
  if (dias !== undefined) {
    if (typeof dias !== 'number' || !Number.isInteger(dias) || dias < 0 || dias > 30) {
      return 'Los dias de anticipacion tienen que ser un numero entero entre 0 y 30.';
    }
  }

  if (datos.franjas !== undefined) {
    if (!Array.isArray(datos.franjas)) return 'Las franjas horarias no son una lista.';
    if (datos.franjas.length > 12) return 'Son demasiadas franjas horarias.';

    for (const [i, franja] of datos.franjas.entries()) {
      if (!franja || typeof franja !== 'object') return `La franja ${i + 1} no es valida.`;

      const { etiqueta, cupo } = franja as Record<string, unknown>;

      if (!texto(etiqueta)) return `A la franja ${i + 1} le falta el nombre. Ej: "Manana (8:00 - 12:00)"`;
      if (typeof cupo !== 'number' || !Number.isInteger(cupo) || cupo < 1 || cupo > 20) {
        return `El cupo de "${texto(etiqueta)}" tiene que ser un numero entero entre 1 y 20.`;
      }
    }
  }

  return null;
}

/**
 * Arma el documento con los campos conocidos y nada mas.
 *
 * Lista blanca y no "lo que venga": el navegador manda el cuerpo, y sin esto
 * cualquiera con la clave podria escribir campos inventados dentro del
 * documento de ajustes.
 */
function armar(datos: Record<string, unknown>) {
  const limpio: Record<string, unknown> = {
    nombre: texto(datos.nombre),
    telefono: texto(datos.telefono),
    whatsapp: texto(datos.whatsapp),
    mensajeWhatsapp: texto(datos.mensajeWhatsapp),
    email: texto(datos.email),
    direccion: texto(datos.direccion),
    horario: texto(datos.horario),
    googleResenas: texto(datos.googleResenas),
    mensajeResena: texto(datos.mensajeResena),
    mostrarBarraContacto: datos.mostrarBarraContacto !== false,
    diasAnticipacion: typeof datos.diasAnticipacion === 'number' ? datos.diasAnticipacion : 1,
    franjas: Array.isArray(datos.franjas)
      ? (datos.franjas as Franja[]).map((franja, i) => ({
          // Sanity exige `_key` en todo objeto dentro de un array: sin el,
          // rechaza la mutacion. Ver el mismo detalle en `editor/adaptador.ts`.
          _key: texto((franja as unknown as Record<string, unknown>)._key) || `franja-${i}-${Date.now()}`,
          etiqueta: texto(franja.etiqueta),
          cupo: franja.cupo,
        }))
      : [],
  };

  // El logo viaja tal como lo devuelve /api/imagen: una referencia, no una URL.
  // Si no vino nada, se deja el que ya estaba en vez de borrarlo.
  const logo = datos.logo as Record<string, unknown> | undefined;
  if (logo && typeof logo === 'object' && logo.asset) limpio.logo = logo;

  return limpio;
}

export const POST: APIRoute = async ({ request }) => {
  const acceso = await verificarAcceso(request);
  if (!acceso.autorizado) return respuesta({ error: acceso.motivo ?? 'Sin permiso para guardar.' }, 403);

  if (!SANITY_WRITE_TOKEN) {
    return respuesta({ error: 'Falta SANITY_WRITE_TOKEN en el servidor. Sin eso no se puede escribir.' }, 500);
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return respuesta({ error: 'El cuerpo del pedido no es JSON valido.' }, 400);
  }

  const problema = validar(cuerpo);
  if (problema) return respuesta({ error: problema }, 400);

  const cliente = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
    apiVersion: '2024-10-01',
    token: SANITY_WRITE_TOKEN,
    useCdn: false,
  });

  try {
    await cliente.patch('ajustes').set(armar(cuerpo)).commit();
    console.log(`[ajustes] ${acceso.email ?? 'desconocido'} guardo los ajustes del negocio.`);
    return respuesta({ ok: true });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[ajustes] Fallo la escritura en Sanity:', detalle);
    return respuesta({ error: `Sanity rechazo el guardado: ${detalle}` }, 502);
  }
};
