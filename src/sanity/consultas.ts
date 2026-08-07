import { sanityClient } from 'sanity:client';
import type { Ajustes, Pagina } from '../tipos';

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

const hoy = () => new Date().toISOString().slice(0, 10);

export async function obtenerPagina(slug: string): Promise<Pagina | null> {
  return sanityClient.fetch<Pagina | null>(CONSULTA_PAGINA, { slug, hoy: hoy() });
}

export async function obtenerAjustes(): Promise<Ajustes | null> {
  return sanityClient.fetch<Ajustes | null>(CONSULTA_AJUSTES);
}

/** Los distritos del bloque de cobertura alimentan el desplegable del formulario. */
export async function obtenerDistritos(): Promise<string[]> {
  const distritos = await sanityClient.fetch<(string[] | null)[] | null>(
    `*[_type == "pagina"].secciones[_type == "coberturaBloque"].distritos`,
  );
  const planos = (distritos ?? []).flatMap((lista) => lista ?? []);
  return [...new Set(planos.filter((d): d is string => typeof d === 'string' && d.length > 0))].sort();
}
