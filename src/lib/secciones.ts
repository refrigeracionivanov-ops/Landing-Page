// La lista de tipos sale del adaptador, no del esquema de Sanity: importar
// `schemaTypes/bloques` arrastraria el paquete `sanity` entero (es codigo del
// studio, para el navegador) a un Worker, donde ni siquiera carga. Ademas asi
// el editor y el servidor comparten una sola lista y no pueden desincronizarse.
import { TIPOS } from '../editor/adaptador';

const TIPOS_VALIDOS = new Set(Object.keys(TIPOS));

/**
 * Rechaza cualquier cosa que no sea una lista de bloques conocidos y bien
 * formados. Devuelve el motivo, o null si esta todo bien.
 *
 * La usan los dos caminos que escriben contenido: el guardado desde el editor y
 * la restauracion de una version del historial. La segunda no es paranoia — una
 * version guardada hace un mes puede traer un tipo de bloque que despues se
 * saco del codigo, y es mejor decirlo que publicar una pagina con un hueco.
 */
export function validarSecciones(secciones: unknown): string | null {
  if (!Array.isArray(secciones)) return 'El contenido tiene que ser una lista de secciones.';
  if (secciones.length > 60) return 'Demasiadas secciones.';

  const claves = new Set<string>();

  for (const [i, bloque] of secciones.entries()) {
    if (!bloque || typeof bloque !== 'object') return `La sección ${i + 1} no es válida.`;

    const { _key, _type } = bloque as Record<string, unknown>;

    if (typeof _type !== 'string' || !TIPOS_VALIDOS.has(_type)) {
      return `La sección ${i + 1} es de un tipo desconocido (${String(_type)}).`;
    }
    if (typeof _key !== 'string' || !_key) return `A la sección ${i + 1} le falta el identificador.`;
    if (claves.has(_key)) return `Hay dos secciones con el mismo identificador (${_key}).`;

    claves.add(_key);
  }

  return null;
}
