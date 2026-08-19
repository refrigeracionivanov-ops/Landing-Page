-- Cuando se le pidio la resena de Google a este cliente.
--
-- No guarda la resena: esa vive en Google, que es justamente el punto. Guarda
-- que ya se la pedimos, para no pedirsela dos veces a la misma persona.
ALTER TABLE solicitudes ADD COLUMN resena_pedida_en TEXT;
