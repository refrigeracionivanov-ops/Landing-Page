// `D1Database` es un tipo global que aporta `worker-configuration.d.ts`
// (se regenera con `npm run tipos`).

export const ESTADOS = ['nueva', 'contactada', 'agendada', 'completada', 'cancelada', 'spam'] as const;

/**
 * Los que se muestran en los filtros de la lista.
 *
 * `spam` queda afuera: se llega desde su propio boton. Lo que se marco como
 * basura no tiene por que ocupar un lugar en la fila de trabajo diaria.
 */
export const ESTADOS_VISIBLES = ESTADOS.filter((estado) => estado !== 'spam');
export type Estado = (typeof ESTADOS)[number];

/** Estados que ocupan un lugar en la agenda. Una cancelada libera el cupo. */
const ESTADOS_ACTIVOS = ['nueva', 'contactada', 'agendada'] as const;

export interface Solicitud {
  id: number;
  creada_en: string;
  estado: Estado;
  nombre: string;
  telefono: string;
  distrito: string;
  direccion: string;
  tipo_servicio: string;
  tipo_equipo: string | null;
  descripcion: string | null;
  fecha_preferida: string;
  franja: string;
  /** Sub-slot elegido por el admin, ej. "09:00-10:00". Null si usa toda la franja. */
  hora_visita: string | null;
  notas: string | null;
  /** Id del evento espejado en Google Calendar. Null si no llego a agendarse. */
  evento_id: string | null;
  /** Cuando se le pidio la resena de Google. Null si todavia no se le pidio. */
  resena_pedida_en: string | null;
}

export type SolicitudNueva = Omit<
  Solicitud,
  'id' | 'creada_en' | 'estado' | 'notas' | 'evento_id' | 'resena_pedida_en'
>;

const marcadores = (cantidad: number) => Array.from({ length: cantidad }, () => '?').join(', ');

export async function existeDuplicado(db: D1Database, telefono: string, fecha: string): Promise<boolean> {
  const fila = await db
    .prepare(
      `SELECT 1 FROM solicitudes
       WHERE telefono = ? AND fecha_preferida = ?
         AND estado NOT IN ('cancelada', 'spam')
       LIMIT 1`,
    )
    .bind(telefono, fecha)
    .first();

  return fila !== null;
}

export async function contarEnFranja(db: D1Database, fecha: string, franja: string): Promise<number> {
  const fila = await db
    .prepare(
      `SELECT COUNT(*) AS total FROM solicitudes
       WHERE fecha_preferida = ? AND franja = ?
         AND estado IN (${marcadores(ESTADOS_ACTIVOS.length)})`,
    )
    .bind(fecha, franja, ...ESTADOS_ACTIVOS)
    .first<{ total: number }>();

  return fila?.total ?? 0;
}

export async function crearSolicitud(db: D1Database, datos: SolicitudNueva): Promise<void> {
  await db
    .prepare(
      `INSERT INTO solicitudes
         (nombre, telefono, distrito, direccion, tipo_servicio, tipo_equipo, descripcion, fecha_preferida, franja)
       VALUES (${marcadores(9)})`,
    )
    .bind(
      datos.nombre,
      datos.telefono,
      datos.distrito,
      datos.direccion,
      datos.tipo_servicio,
      datos.tipo_equipo,
      datos.descripcion,
      datos.fecha_preferida,
      datos.franja,
    )
    .run();
}

export async function listarSolicitudes(db: D1Database, estado?: string): Promise<Solicitud[]> {
  const filtrar = estado && ESTADOS.includes(estado as Estado);

  // Sin filtro, el spam no aparece: se llega a el eligiendolo. La vista sin
  // filtro es la fila de trabajo del dia, y ahi la basura estorba.
  const consulta = filtrar
    ? db.prepare(`SELECT * FROM solicitudes WHERE estado = ? ORDER BY creada_en DESC LIMIT 200`).bind(estado)
    : db.prepare(`SELECT * FROM solicitudes WHERE estado != 'spam' ORDER BY creada_en DESC LIMIT 200`);

  const { results } = await consulta.all<Solicitud>();
  return results ?? [];
}

export async function contarPorEstado(db: D1Database): Promise<Record<string, number>> {
  const { results } = await db
    .prepare(`SELECT estado, COUNT(*) AS total FROM solicitudes GROUP BY estado`)
    .all<{ estado: string; total: number }>();

  return Object.fromEntries((results ?? []).map((f) => [f.estado, f.total]));
}

export async function obtenerSolicitud(db: D1Database, id: number): Promise<Solicitud | null> {
  return db.prepare(`SELECT * FROM solicitudes WHERE id = ?`).bind(id).first<Solicitud>();
}

export async function guardarEventoId(db: D1Database, id: number, eventoId: string | null): Promise<void> {
  await db.prepare(`UPDATE solicitudes SET evento_id = ? WHERE id = ?`).bind(eventoId, id).run();
}

export async function actualizarSolicitud(
  db: D1Database,
  id: number,
  cambios: { estado?: string; notas?: string; hora_visita?: string | null },
): Promise<boolean> {
  if (cambios.estado && !ESTADOS.includes(cambios.estado as Estado)) return false;

  const campos: string[] = [];
  const valores: (string | number | null)[] = [];

  if (cambios.estado) {
    campos.push('estado = ?');
    valores.push(cambios.estado);
  }
  if (cambios.notas !== undefined) {
    campos.push('notas = ?');
    valores.push(cambios.notas);
  }
  if (cambios.hora_visita !== undefined) {
    campos.push('hora_visita = ?');
    valores.push(cambios.hora_visita);
  }
  if (!campos.length) return false;

  const resultado = await db
    .prepare(`UPDATE solicitudes SET ${campos.join(', ')} WHERE id = ?`)
    .bind(...valores, id)
    .run();

  return resultado.success;
}

/**
 * Deja constancia de que a este cliente ya se le pidio la resena.
 *
 * La resena en si no pasa por aca: se escribe en Google, que es el punto de
 * hacerlo asi. Esto solo evita pedirsela dos veces a la misma persona.
 */
export async function marcarResenaPedida(db: D1Database, id: number): Promise<boolean> {
  const resultado = await db
    .prepare("UPDATE solicitudes SET resena_pedida_en = datetime('now') WHERE id = ?")
    .bind(id)
    .run();

  return resultado.success;
}

/**
 * La proxima franja con lugar, a partir de una fecha.
 *
 * Recorre dia por dia y devuelve la primera combinacion de fecha y franja que
 * todavia tiene cupo. Mira como maximo `dias` hacia adelante: si en dos semanas
 * no hay un hueco, el problema no lo resuelve mover una visita.
 */
export async function proximoHueco(
  db: D1Database,
  desde: string,
  franjas: { etiqueta: string; cupo: number }[],
  dias = 21,
): Promise<{ fecha: string; franja: string } | null> {
  if (!franjas.length) return null;

  const fecha = new Date(`${desde}T00:00:00Z`);

  for (let i = 0; i < dias; i++) {
    const dia = fecha.toISOString().slice(0, 10);

    for (const { etiqueta, cupo } of franjas) {
      if ((await contarEnFranja(db, dia, etiqueta)) < cupo) return { fecha: dia, franja: etiqueta };
    }

    fecha.setUTCDate(fecha.getUTCDate() + 1);
  }

  return null;
}

/** Mueve una visita a otro dia y franja. Usado por "Posponer". */
export async function moverSolicitud(db: D1Database, id: number, fecha: string, franja: string): Promise<boolean> {
  const resultado = await db
    .prepare('UPDATE solicitudes SET fecha_preferida = ?, franja = ? WHERE id = ?')
    .bind(fecha, franja, id)
    .run();

  return resultado.success;
}

/**
 * Cuántas solicitudes activas tienen asignado cada sub-slot, para un conjunto
 * de combinaciones fecha+franja. Devuelve un Map con clave "fecha|franja|slot".
 * Con cupo 1 por slot, si el valor >= 1 el slot está ocupado.
 */
export async function contarPorSubSlot(
  db: D1Database,
  combinaciones: { fecha: string; franja: string }[],
): Promise<Map<string, number>> {
  if (!combinaciones.length) return new Map();

  const condiciones = combinaciones.map(() => '(fecha_preferida = ? AND franja = ?)').join(' OR ');
  const valores = combinaciones.flatMap((c) => [c.fecha, c.franja]);

  const { results } = await db
    .prepare(
      `SELECT fecha_preferida, franja, hora_visita
       FROM solicitudes
       WHERE (${condiciones})
         AND estado NOT IN ('cancelada', 'spam')
         AND hora_visita IS NOT NULL`,
    )
    .bind(...valores)
    .all<{ fecha_preferida: string; franja: string; hora_visita: string }>();

  // hora_visita puede ser un slot único "08:00-09:00" o varios separados por
  // coma "08:00-09:00,09:00-10:00" cuando la visita ocupa más de una hora.
  const mapa = new Map<string, number>();
  for (const fila of results ?? []) {
    for (const slot of fila.hora_visita.split(',')) {
      const s = slot.trim();
      if (!s) continue;
      const clave = `${fila.fecha_preferida}|${fila.franja}|${s}`;
      mapa.set(clave, (mapa.get(clave) ?? 0) + 1);
    }
  }
  return mapa;
}

/** Las visitas de un rango de fechas, para la vista de calendario. */
export async function solicitudesEntre(db: D1Database, desde: string, hasta: string): Promise<Solicitud[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM solicitudes
       WHERE fecha_preferida BETWEEN ? AND ? AND estado != 'spam'
       ORDER BY fecha_preferida, franja`,
    )
    .bind(desde, hasta)
    .all<Solicitud>();

  return results ?? [];
}

/** Borra de verdad lo marcado como spam. Es el unico borrado del sistema. */
export async function vaciarSpam(db: D1Database): Promise<number> {
  const resultado = await db.prepare("DELETE FROM solicitudes WHERE estado = 'spam'").run();
  return resultado.meta.changes ?? 0;
}
