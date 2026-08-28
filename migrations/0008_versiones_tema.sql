-- Guarda el tema activo cuando se hizo el guardado ('compacto' o 'complejo').
-- Permite que el historial redirija al editor correcto al restaurar una version.
-- NULL en versiones anteriores a este cambio.

ALTER TABLE versiones ADD COLUMN tema TEXT;
