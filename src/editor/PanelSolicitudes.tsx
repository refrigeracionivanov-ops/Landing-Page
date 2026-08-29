import { useEffect, useRef, useState, useCallback } from 'react';

interface SolicitudResumen {
  id: number;
  nombre: string;
  estado: string;
  tipo_servicio: string;
  fecha_preferida: string;
  franja: string;
  distrito: string;
  creada_en: string;
}

const COLORES: Record<string, { bg: string; color: string }> = {
  nueva:      { bg: '#d0e2ff', color: '#0043ce' },
  contactada: { bg: '#e8daff', color: '#6929c4' },
  agendada:   { bg: '#a7f0ba', color: '#0e6027' },
  completada: { bg: '#e0e0e0', color: '#525252' },
  cancelada:  { bg: '#ffd7d9', color: '#a2191f' },
};

function formatFecha(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

interface Props {
  count: number;
}

export default function PanelSolicitudes({ count }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [acciones, setAcciones] = useState<Record<number, 'cargando' | 'listo'>>({});
  const contenedor = useRef<HTMLDivElement>(null);
  const countPrevio = useRef(count);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await fetch('/api/solicitudes-panel');
      if (r.ok) {
        const datos = (await r.json()) as { solicitudes: SolicitudResumen[] };
        setSolicitudes(datos.solicitudes ?? []);
      }
    } catch { /* silencioso */ }
    finally { setCargando(false); }
  }, []);

  useEffect(() => {
    if (!abierto) return;
    cargar();
    const intervalo = setInterval(cargar, 30_000);
    return () => clearInterval(intervalo);
  }, [abierto, cargar]);

  // Cuando llega una nueva solicitud por SSE y el panel está abierto, recargar al instante.
  useEffect(() => {
    if (count > countPrevio.current && abierto) cargar();
    countPrevio.current = count;
  }, [count, abierto, cargar]);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, [abierto]);

  async function accion(id: number, tipo: 'aceptar' | 'rechazar') {
    setAcciones(prev => ({ ...prev, [id]: 'cargando' }));
    try {
      await fetch('/api/solicitudes-panel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, accion: tipo }),
      });
      await cargar();
    } finally {
      setAcciones(prev => ({ ...prev, [id]: 'listo' }));
    }
  }

  const tieneNuevas = count > 0;

  return (
    <div ref={contenedor} style={{ position: 'relative', alignSelf: 'center' }}>
      <button
        type="button"
        onClick={() => setAbierto(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          height: 32,
          background: abierto ? '#262626' : 'transparent',
          color: tieneNuevas ? '#fa4d56' : '#c6c6c6',
          border: tieneNuevas ? '1px solid #fa4d56' : '1px solid transparent',
          borderRadius: 2,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'background 120ms',
        }}
      >
        {tieneNuevas && (
          <span style={{
            background: '#fa4d56',
            color: '#fff',
            borderRadius: '50%',
            width: 16,
            height: 16,
            fontSize: 10,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
        Solicitudes
        <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>
          {abierto ? '▲' : '▼'}
        </span>
      </button>

      {abierto && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          width: 400,
          maxHeight: '70vh',
          overflowY: 'auto',
          background: '#1c1c1c',
          border: '1px solid #393939',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 9999,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            borderBottom: '1px solid #393939',
            position: 'sticky',
            top: 0,
            background: '#1c1c1c',
          }}>
            <span style={{ color: '#f4f4f4', fontSize: 13, fontWeight: 600 }}>
              Solicitudes recientes {cargando && <span style={{ opacity: 0.4 }}>·</span>}
            </span>
            <a
              href="/solicitudes"
              style={{ color: '#78a9ff', fontSize: 12, textDecoration: 'none' }}
              onClick={() => setAbierto(false)}
            >
              Ver todas
            </a>
          </div>

          {solicitudes.length === 0 ? (
            <p style={{ color: '#8d8d8d', fontSize: 13, padding: '16px 14px', textAlign: 'center' }}>
              {cargando ? 'Cargando...' : 'No hay solicitudes.'}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {solicitudes.map(s => {
                const color = COLORES[s.estado] ?? { bg: '#e0e0e0', color: '#525252' };
                const puedeActuar = ['nueva', 'contactada', 'agendada'].includes(s.estado);
                const cargandoEsta = acciones[s.id] === 'cargando';

                return (
                  <li key={s.id} style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #2a2a2a',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ color: '#f4f4f4', fontSize: 13, fontWeight: 600 }}>{s.nombre}</span>
                          <span style={{
                            background: color.bg,
                            color: color.color,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 2,
                            textTransform: 'capitalize',
                          }}>
                            {s.estado}
                          </span>
                        </div>
                        <p style={{ color: '#a8a8a8', fontSize: 12, margin: '2px 0 0' }}>
                          {s.tipo_servicio} — {s.distrito}
                        </p>
                        <p style={{ color: '#6f6f6f', fontSize: 11, margin: '1px 0 0' }}>
                          {formatFecha(s.fecha_preferida)} · {s.franja}
                        </p>
                      </div>

                      {puedeActuar && (
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {s.estado !== 'agendada' && (
                            <button
                              type="button"
                              disabled={cargandoEsta}
                              onClick={() => accion(s.id, 'aceptar')}
                              style={{
                                padding: '3px 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                background: '#0f62fe',
                                color: '#fff',
                                border: 0,
                                borderRadius: 2,
                                cursor: cargandoEsta ? 'default' : 'pointer',
                                opacity: cargandoEsta ? 0.5 : 1,
                              }}
                            >
                              Aceptar
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={cargandoEsta}
                            onClick={() => accion(s.id, 'rechazar')}
                            style={{
                              padding: '3px 8px',
                              fontSize: 11,
                              background: 'transparent',
                              color: '#fa4d56',
                              border: '1px solid #fa4d56',
                              borderRadius: 2,
                              cursor: cargandoEsta ? 'default' : 'pointer',
                              opacity: cargandoEsta ? 0.5 : 1,
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
