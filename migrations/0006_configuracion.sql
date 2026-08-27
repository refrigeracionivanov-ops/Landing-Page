-- Configuracion del sistema: pares clave/valor para ajustes que no van
-- en Sanity (que es publico) ni en variables de entorno (que no se pueden
-- cambiar desde el panel).
--
-- Hoy solo guarda el hash de la clave del editor cuando el administrador
-- la cambia desde el panel. Si la tabla no tiene entrada, el sistema
-- usa CLAVE_EDITOR como respaldo.

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
