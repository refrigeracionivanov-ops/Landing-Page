// `D1Database` es un tipo global que aporta `worker-configuration.d.ts`
// (se regenera con `npm run tipos`).
import type { Bloque } from '../tipos';

/**
 * Cuantas versiones se conservan.
 *
 * Veinte, y no las de los ultimos treinta dias: la pagina se edita de a rachas
 * —una tarde se toca todo, despues no se toca en dos meses—, y un limite por
 * fecha deja sin red justo al que estuvo trabajando. Veinte son veinte sin
 * importar cuando se hicieron.
 */
export const MAXIMO_VERSIONES = 20;

/** Lo que se muestra en la lista del historial, sin el JSON del contenido. */
export interface ResumenVersion {
  id: number;
  /** UTC, en el formato de SQLite: "2026-08-19 22:41:07". */
  guardada_en: string;
  autor: string | null;
  cantidad_secciones: number;
  /** Editor desde el que se guardó: 'compacto' | 'complejo'. Null en versiones antiguas. */
  tema: string | null;
}

/**
 * Guarda el contenido que esta por sobrescribirse y descarta lo que sobra.
 *
 * El borrado va en el mismo paso que la insercion y no en una limpieza aparte:
 * una tabla que se poda sola no necesita que nadie se acuerde de podarla.
 */
export async function apilarVersion(db: D1Database, secciones: Bloque[], autor: string | null, tema: string | null = null): Promise<void> {
  await db
    .prepare('INSERT INTO versiones (autor, cantidad_secciones, secciones, tema) VALUES (?, ?, ?, ?)')
    .bind(autor, secciones.length, JSON.stringify(secciones), tema)
    .run();

  await db
    .prepare('DELETE FROM versiones WHERE id NOT IN (SELECT id FROM versiones ORDER BY id DESC LIMIT ?)')
    .bind(MAXIMO_VERSIONES)
    .run();
}

/** De la mas nueva a la mas vieja, que es el orden en que se buscan. */
export async function listarVersiones(db: D1Database): Promise<ResumenVersion[]> {
  const { results } = await db
    .prepare('SELECT id, guardada_en, autor, cantidad_secciones, tema FROM versiones ORDER BY id DESC')
    .all<ResumenVersion>();

  return results ?? [];
}

/**
 * Devuelve el contenido de una version, o null si ya no esta.
 *
 * "Ya no esta" incluye el JSON ilegible, que no deberia pasar nunca porque lo
 * escribimos nosotros. Se trata igual que la version inexistente: quien esta
 * mirando el historial no puede hacer nada distinto con esa diferencia.
 */
export async function obtenerVersion(db: D1Database, id: number): Promise<{ secciones: Bloque[]; tema: string | null } | null> {
  const fila = await db
    .prepare('SELECT secciones, tema FROM versiones WHERE id = ?')
    .bind(id)
    .first<{ secciones: string; tema: string | null }>();

  if (!fila) return null;

  try {
    const secciones = JSON.parse(fila.secciones);
    return Array.isArray(secciones) ? { secciones: secciones as Bloque[], tema: fila.tema } : null;
  } catch {
    console.error(`[versiones] La version ${id} tiene un JSON ilegible.`);
    return null;
  }
}
