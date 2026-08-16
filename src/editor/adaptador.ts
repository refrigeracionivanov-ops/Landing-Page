import type { Bloque } from '../tipos';

/**
 * Traduce entre la forma de Sanity y la de Puck.
 *
 * Son la misma estructura con distinto nombre: una lista ordenada de bloques
 * tipados con sus datos adentro.
 *
 *   Sanity   { _key, _type: 'heroBloque',   titular: '...' }
 *   Puck     { type: 'Hero', props: { id, titular: '...' } }
 *
 * Las dos unicas asimetrias reales se resuelven aca abajo:
 * el `_key` de Sanity es el `id` de Puck, y `distritos` es una lista de textos
 * en Sanity mientras que Puck solo sabe manejar listas de objetos.
 */

/** El nombre que ve quien edita <- el nombre tecnico del bloque en Sanity. */
export const TIPOS: Record<string, string> = {
  heroBloque: 'Portada',
  textoBloque: 'Texto libre',
  pasosBloque: 'Como trabajamos',
  planesBloque: 'Planes y precios',
  avisoBloque: 'Aviso destacado',
  beneficiosBloque: 'Beneficios',
  serviciosBloque: 'Servicios',
  promocionesBloque: 'Promociones',
  antesDespuesBloque: 'Antes y despues',
  confianzaBloque: 'Confianza',
  coberturaBloque: 'Zonas donde atendemos',
  testimoniosBloque: 'Testimonios',
  faqBloque: 'Preguntas frecuentes',
  agendarBloque: 'Agendar visita',
  ctaBloque: 'Cierre',
};

const TIPOS_INVERSO = Object.fromEntries(Object.entries(TIPOS).map(([sanity, puck]) => [puck, sanity]));

/** Un `_key` nuevo para los bloques que se agregan desde el editor. */
export const nuevaClave = () => Math.random().toString(36).slice(2, 12);

export interface ItemPuck {
  type: string;
  props: Record<string, unknown> & { id: string };
}

/**
 * Listas de texto suelto que Puck no sabe manejar.
 *
 * Sanity guarda `["Miraflores", "Surco"]`; Puck solo edita listas de objetos,
 * asi que en el editor viajan como `[{ valor: "Miraflores" }]`. Estas dos
 * tablas dicen donde pasa, para no repetir la conversion en cada bloque.
 */
const LISTAS_PLANAS: Record<string, string[]> = {
  coberturaBloque: ['distritos'],
};

/** Igual que arriba, pero la lista vive dentro de cada item de otra lista. */
const LISTAS_PLANAS_ANIDADAS: Record<string, { lista: string; campo: string }> = {
  planesBloque: { lista: 'planes', campo: 'incluye' },
};

const aObjetos = (valores: unknown) =>
  Array.isArray(valores) ? valores.map((valor) => ({ valor: String(valor) })) : valores;

const aTextos = (objetos: unknown) =>
  Array.isArray(objetos)
    ? objetos.map((o: any) => (typeof o === 'string' ? o : (o?.valor ?? ''))).filter(Boolean)
    : objetos;

function convertirListas(datos: Record<string, unknown>, tipo: string, hacia: 'puck' | 'sanity') {
  const transformar = hacia === 'puck' ? aObjetos : aTextos;

  for (const campo of LISTAS_PLANAS[tipo] ?? []) {
    if (datos[campo] !== undefined) datos[campo] = transformar(datos[campo]);
  }

  const anidada = LISTAS_PLANAS_ANIDADAS[tipo];
  if (anidada && Array.isArray(datos[anidada.lista])) {
    datos[anidada.lista] = (datos[anidada.lista] as any[]).map((item) =>
      item?.[anidada.campo] === undefined ? item : { ...item, [anidada.campo]: transformar(item[anidada.campo]) },
    );
  }
}

export function deSanityAPuck(secciones: Bloque[] = []): { content: ItemPuck[]; root: { props: {} } } {
  const content = secciones
    .filter((bloque) => TIPOS[bloque._type])
    .map((bloque) => {
      const { _key, _type, ...datos } = bloque as Bloque & Record<string, unknown>;
      const props: Record<string, unknown> = { ...datos, id: _key ?? nuevaClave() };

      convertirListas(props, _type, 'puck');

      return { type: TIPOS[_type], props } as ItemPuck;
    });

  return { content, root: { props: {} } };
}

/**
 * Le pone `_key` a todo objeto que viva dentro de un array.
 *
 * Sanity lo exige para poder reordenar y parchear items sin ambiguedad; sin el,
 * la mutacion se rechaza. Puck no los genera, asi que los ponemos al salir.
 * Los que ya venian de Sanity conservan el suyo: si se regeneraran en cada
 * guardado, el historial de versiones mostraria todo como cambiado siempre.
 */
function asegurarClaves(valor: unknown): unknown {
  if (Array.isArray(valor)) {
    return valor.map((item) =>
      item && typeof item === 'object'
        ? { _key: (item as any)._key ?? nuevaClave(), ...(asegurarClaves(item) as object) }
        : item,
    );
  }

  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([clave, v]) => [clave, asegurarClaves(v)]));
  }

  return valor;
}

export function dePuckASanity(content: ItemPuck[] = []): Bloque[] {
  return content.map((item) => {
    const { id, ...datos } = item.props;
    const tipo = TIPOS_INVERSO[item.type];

    convertirListas(datos, tipo, 'sanity');

    return { _key: id, _type: tipo, ...(asegurarClaves(datos) as object) } as unknown as Bloque;
  });
}
