-- Solicitudes de visita tecnica.
-- Contiene datos personales de clientes: nunca debe replicarse a Sanity.

CREATE TABLE IF NOT EXISTS solicitudes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  creada_en      TEXT NOT NULL DEFAULT (datetime('now')),
  estado         TEXT NOT NULL DEFAULT 'nueva'
                 CHECK (estado IN ('nueva', 'contactada', 'agendada', 'completada', 'cancelada')),
  nombre         TEXT NOT NULL,
  telefono       TEXT NOT NULL,
  distrito       TEXT NOT NULL,
  direccion      TEXT NOT NULL,
  tipo_servicio  TEXT NOT NULL,
  tipo_equipo    TEXT,
  descripcion    TEXT,
  fecha_preferida TEXT NOT NULL,
  franja         TEXT NOT NULL,
  notas          TEXT
);

-- Para contar cuantas visitas hay tomadas en una franja de un dia.
CREATE INDEX IF NOT EXISTS idx_solicitudes_cupo
  ON solicitudes (fecha_preferida, franja, estado);

-- Para detectar que un mismo telefono no pida dos veces el mismo dia.
CREATE INDEX IF NOT EXISTS idx_solicitudes_duplicado
  ON solicitudes (telefono, fecha_preferida);

-- Para el listado del panel, que va de la mas nueva a la mas vieja.
CREATE INDEX IF NOT EXISTS idx_solicitudes_recientes
  ON solicitudes (creada_en DESC);
