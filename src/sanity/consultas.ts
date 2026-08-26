import { createClient } from '@sanity/client';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from 'astro:env/client';
import type { Ajustes, Pagina } from '../tipos';

/**
 * Lectura sin CDN.
 *
 * El CDN de Sanity sirve contenido de hasta un minuto atras. Eso servia cuando
 * la pagina se compilaba una vez y listo, pero ahora se renderiza en cada
 * visita y se edita en vivo: guardar y esperar un minuto para ver el cambio
 * haria sentir el editor roto.
 *
 * El costo es una consulta a Sanity por visita. Para el trafico de una landing
 * es despreciable; si algun dia crece, la solucion no es volver al CDN sino
 * cachear la respuesta en el borde e invalidarla al guardar.
 */
const clienteEnVivo = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  apiVersion: '2024-10-01',
  useCdn: false,
});

/**
 * Las promociones vencidas se filtran en la consulta, no en el navegador.
 * Asi nadie tiene que acordarse de borrar la promo de julio en agosto.
 */
const CONSULTA_PAGINA = `*[_type == "pagina" && slug.current == $slug][0]{
  titulo,
  seo,
  secciones[]{
    ...,
    _type == "promocionesBloque" => {
      ...,
      "promos": promos[!defined(vigenciaHasta) || vigenciaHasta >= $hoy]
    }
  }
}`;

const CONSULTA_AJUSTES = `*[_type == "ajustes"][0]`;

/** Los distritos del bloque de cobertura alimentan el desplegable del formulario. */
const CONSULTA_DISTRITOS = `*[_type == "pagina"].secciones[_type == "coberturaBloque"].distritos`;

const hoy = () => new Date().toISOString().slice(0, 10);

const aplanarDistritos = (listas: (string[] | null)[] | null): string[] => {
  const planos = (listas ?? []).flatMap((lista) => lista ?? []);
  return [...new Set(planos.filter((d): d is string => typeof d === 'string' && d.length > 0))].sort();
};

export interface ContenidoPagina {
  pagina: Pagina | null;
  ajustes: Ajustes | null;
  distritos: string[];
}

/**
 * Todo lo que la pagina necesita, en un solo viaje.
 *
 * Antes eran tres consultas en paralelo. Cuando la pagina se compilaba una vez
 * daba igual, pero ahora corre en cada visita y cada viaje a Sanity se paga en
 * tiempo de carga. GROQ deja pedir las tres cosas juntas.
 */
export async function obtenerContenido(slug: string): Promise<ContenidoPagina> {
  const datos = await clienteEnVivo.fetch<{
    pagina: Pagina | null;
    ajustes: Ajustes | null;
    distritos: (string[] | null)[] | null;
  }>(
    `{
      "pagina": ${CONSULTA_PAGINA},
      "ajustes": ${CONSULTA_AJUSTES},
      "distritos": ${CONSULTA_DISTRITOS}
    }`,
    { slug, hoy: hoy() },
  );

  return {
    pagina: datos?.pagina ?? null,
    ajustes: datos?.ajustes ?? null,
    distritos: aplanarDistritos(datos?.distritos ?? null),
  };
}

export async function obtenerPagina(slug: string): Promise<Pagina | null> {
  return clienteEnVivo.fetch<Pagina | null>(CONSULTA_PAGINA, { slug, hoy: hoy() });
}

export async function obtenerAjustes(): Promise<Ajustes | null> {
  return clienteEnVivo.fetch<Ajustes | null>(CONSULTA_AJUSTES);
}

export async function obtenerDistritos(): Promise<string[]> {
  return aplanarDistritos(await clienteEnVivo.fetch<(string[] | null)[] | null>(CONSULTA_DISTRITOS));
}
