-- Historial de versiones del contenido de la pagina.
--
-- Sanity guarda revisiones, pero en el plan gratuito las conserva tres dias:
-- alcanza para deshacer lo de esta manana y no para "esto quedo feo hace dos
-- semanas", que es el caso real. Aca se guardan las ultimas veinte sin importar
-- la fecha.
--
-- Se apila lo que HABIA, no lo que se guarda: la fila que entra es el contenido
-- que esta por sobrescribirse. Asi la version 1 es siempre "como estaba antes
-- del ultimo guardado", que es lo que alguien busca cuando quiere volver atras.
--
-- `secciones` es el JSON tal cual se guarda en Sanity, para poder devolverlo sin
-- traducir nada. `cantidad_secciones` se calcula al insertar y no con
-- json_array_length: la lista del historial no tiene por que leer y parsear
-- veinte documentos enteros para mostrar un numero.

CREATE TABLE versiones (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  guardada_en        TEXT NOT NULL DEFAULT (datetime('now')),
  -- Quien guardo. Null cuando se entro con la clave compartida, que no
  -- distingue personas: mentir un nombre ahi seria peor que no tenerlo.
  autor              TEXT,
  cantidad_secciones INTEGER NOT NULL,
  secciones          TEXT NOT NULL
);

-- Sin indice a proposito: la tabla nunca pasa de veinte filas y se lee entera
-- ordenada por id. Un indice ahi solo agrega trabajo en cada insercion.
