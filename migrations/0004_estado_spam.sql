-- Suma el estado 'spam' y un indice para la vista de calendario.
--
-- El estado vive en un CHECK, y SQLite no sabe modificar una restriccion: hay
-- que rehacer la tabla y copiar. Es la unica forma, y por eso conviene que la
-- lista de estados no cambie seguido.
--
-- 'spam' no borra: saca la solicitud de la vista y libera el cupo de la franja,
-- pero la fila queda. Un clic equivocado sobre un cliente real se deshace; un
-- DELETE, no.

CREATE TABLE solicitudes_nueva (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  creada_en      TEXT NOT NULL DEFAULT (datetime('now')),
  estado         TEXT NOT NULL DEFAULT 'nueva'
                 CHECK (estado IN ('nueva', 'contactada', 'agendada', 'completada', 'cancelada', 'spam')),
  nombre         TEXT NOT NULL,
  telefono       TEXT NOT NULL,
  distrito       TEXT NOT NULL,
  direccion      TEXT NOT NULL,
  tipo_servicio  TEXT NOT NULL,
  tipo_equipo    TEXT,
  descripcion    TEXT,
  fecha_preferida TEXT NOT NULL,
  franja         TEXT NOT NULL,
  notas          TEXT,
  evento_id      TEXT,
  resena_pedida_en TEXT
);

INSERT INTO solicitudes_nueva
  SELECT id, creada_en, estado, nombre, telefono, distrito, direccion, tipo_servicio,
         tipo_equipo, descripcion, fecha_preferida, franja, notas, evento_id, resena_pedida_en
  FROM solicitudes;

DROP TABLE solicitudes;
ALTER TABLE solicitudes_nueva RENAME TO solicitudes;

-- La vista de calendario pide las visitas de un rango de fechas.
CREATE INDEX idx_solicitudes_fecha ON solicitudes (fecha_preferida);
