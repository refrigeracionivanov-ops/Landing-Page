-- Guarda el id del evento creado en Google Calendar.
-- Sin esto no podriamos actualizar ni borrar el evento cuando la solicitud
-- cambia de estado: solo sabriamos crearlo.

ALTER TABLE solicitudes ADD COLUMN evento_id TEXT;
