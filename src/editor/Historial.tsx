import { useEffect, useState } from 'react';

interface ResumenVersion {
  id: number;
  guardada_en: string;
  autor: string | null;
  cantidad_secciones: number;
}

interface Props {
  alCerrar: () => void;
}

/**
 * SQLite guarda la fecha en UTC y sin marca de zona: "2026-08-19 22:41:07".
 * Sin la Z al final, el navegador la lee como hora local y muestra tres horas
 * de mas. Es el tipo de error que nadie nota hasta que compara con el reloj.
 */
const aFechaLocal = (guardadaEn: string) =>
  new Date(`${guardadaEn.replace(' ', 'T')}Z`).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const estilos = {
  fondo: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(22, 22, 22, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  panel: {
    background: 'white',
    width: 'min(560px, 100%)',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    fontSize: 14,
    color: '#161616',
  },
  encabezado: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
  },
  fila: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '12px 20px',
    borderBottom: '1px solid #f4f4f4',
  },
  boton: {
    background: 'none',
    border: '1px solid #0f62fe',
    color: '#0f62fe',
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },
} satisfies Record<string, React.CSSProperties>;

/**
 * El historial de la pagina: las ultimas veinte versiones, con un boton para
 * volver a cualquiera.
 *
 * Cada fila es el contenido tal como estaba ANTES de un guardado, asi que la
 * primera de la lista es "como estaba hasta el ultimo cambio" — que es lo que
 * busca quien acaba de romper algo.
 */
export default function Historial({ alCerrar }: Props) {
  const [versiones, setVersiones] = useState<ResumenVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restaurando, setRestaurando] = useState<number | null>(null);

  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') alCerrar();
    };

    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [alCerrar]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/versiones');
        const datos = (await r.json()) as { versiones?: ResumenVersion[]; error?: string };

        if (!r.ok) throw new Error(datos.error ?? `El servidor respondió ${r.status}.`);

        setVersiones(datos.versiones ?? []);
      } catch (fallo) {
        setError(fallo instanceof Error ? fallo.message : 'No se pudo leer el historial.');
      }
    })();
  }, []);

  async function restaurar(version: ResumenVersion) {
    const confirmado = window.confirm(
      `Se va a publicar el contenido del ${aFechaLocal(version.guardada_en)}, con ${version.cantidad_secciones} ` +
        'secciones.\n\nLo que está publicado ahora queda guardado en el historial, así que esto también se ' +
        'puede deshacer. Si tenés cambios sin guardar en el editor, se pierden.',
    );

    if (!confirmado) return;

    setRestaurando(version.id);
    setError(null);

    try {
      const r = await fetch('/api/versiones', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: version.id }),
      });
      const datos = (await r.json()) as { ok?: boolean; error?: string };

      if (!r.ok || !datos.ok) throw new Error(datos.error ?? `El servidor respondió ${r.status}.`);

      // El editor tiene el contenido viejo en memoria: la unica forma honesta de
      // mostrar lo restaurado es volver a pedir la pagina.
      window.location.reload();
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo restaurar.');
      setRestaurando(null);
    }
  }

  return (
    <div style={estilos.fondo} onClick={alCerrar}>
      <div style={estilos.panel} onClick={(evento) => evento.stopPropagation()}>
        <div style={estilos.encabezado}>
          <strong style={{ fontSize: 16 }}>Versiones anteriores</strong>
          <button type="button" onClick={alCerrar} style={{ background: 'none', border: 0, cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>

        {error && (
          <p style={{ margin: 0, padding: '12px 20px', background: '#fff1f1', color: '#a2191f' }}>{error}</p>
        )}

        <div style={{ overflowY: 'auto' }}>
          {versiones === null && !error && <p style={{ padding: '16px 20px' }}>Buscando...</p>}

          {versiones?.length === 0 && (
            <p style={{ padding: '16px 20px', color: '#525252' }}>
              Todavía no hay versiones anteriores. Se guarda una cada vez que apretás Guardar, y quedan las
              últimas veinte.
            </p>
          )}

          {versiones?.map((version) => (
            <div key={version.id} style={estilos.fila}>
              <div>
                <div>{aFechaLocal(version.guardada_en)}</div>
                <div style={{ color: '#525252', fontSize: 13 }}>
                  {version.cantidad_secciones} secciones
                  {version.autor ? ` — ${version.autor}` : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={() => restaurar(version)}
                disabled={restaurando !== null}
                style={{
                  ...estilos.boton,
                  ...(restaurando !== null ? { borderColor: '#8d8d8d', color: '#8d8d8d', cursor: 'default' } : {}),
                }}
              >
                {restaurando === version.id ? 'Restaurando...' : 'Volver a esta'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
