-- Hora especifica de la visita dentro de la franja.
-- Cuando el admin elige un sub-slot (ej. "09:00-10:00" dentro de "Manana (8:00-12:00)")
-- se guarda aca para que el evento de Google Calendar use ese horario exacto.

ALTER TABLE solicitudes ADD COLUMN hora_visita TEXT;
