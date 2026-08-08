// `D1Database` es un tipo global que aporta `worker-configuration.d.ts`
// (se regenera con `npm run tipos`).

export const ESTADOS = ['nueva', 'contactada', 'agendada', 'completada', 'cancelada'] as const;
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
  notas: string | null;
}

export type SolicitudNueva = Omit<Solicitud, 'id' | 'creada_en' | 'estado' | 'notas'>;

const marcadores = (cantidad: number) => Array.from({ length: cantidad }, () => '?').join(', ');

export async function existeDuplicado(db: D1Database, telefono: string, fecha: string): Promise<boolean> {
  const fila = await db
    .prepare(
      `SELECT 1 FROM solicitudes
       WHERE telefono = ? AND fecha_preferida = ? AND estado != 'cancelada'
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

  const consulta = filtrar
    ? db.prepare(`SELECT * FROM solicitudes WHERE estado = ? ORDER BY creada_en DESC LIMIT 200`).bind(estado)
    : db.prepare(`SELECT * FROM solicitudes ORDER BY creada_en DESC LIMIT 200`);

  const { results } = await consulta.all<Solicitud>();
  return results ?? [];
}

export async function contarPorEstado(db: D1Database): Promise<Record<string, number>> {
  const { results } = await db
    .prepare(`SELECT estado, COUNT(*) AS total FROM solicitudes GROUP BY estado`)
    .all<{ estado: string; total: number }>();

  return Object.fromEntries((results ?? []).map((f) => [f.estado, f.total]));
}

export async function actualizarSolicitud(
  db: D1Database,
  id: number,
  cambios: { estado?: string; notas?: string },
): Promise<boolean> {
  if (cambios.estado && !ESTADOS.includes(cambios.estado as Estado)) return false;

  const campos: string[] = [];
  const valores: (string | number)[] = [];

  if (cambios.estado) {
    campos.push('estado = ?');
    valores.push(cambios.estado);
  }
  if (cambios.notas !== undefined) {
    campos.push('notas = ?');
    valores.push(cambios.notas);
  }
  if (!campos.length) return false;

  const resultado = await db
    .prepare(`UPDATE solicitudes SET ${campos.join(', ')} WHERE id = ?`)
    .bind(...valores, id)
    .run();

  return resultado.success;
}
