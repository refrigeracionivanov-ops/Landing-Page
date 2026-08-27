import React, { createContext, useContext, useEffect } from 'react';
import { usePuck } from '@measured/puck';
import PanelSolicitudes from './PanelSolicitudes';

/* ─── Contexto compartido con Editor.tsx ──────────────────────── */

export type EstadoGuardado = 'listo' | 'guardando' | 'guardado' | 'error';

interface HistoriaState {
  hasPast: boolean;
  hasFuture: boolean;
  back: () => void;
  forward: () => void;
}

interface EditorCtxValue {
  estadoGuardado: EstadoGuardado;
  guardar: () => void;
  abrirHistorial: () => void;
  solicitudesNuevas: number;
  historia: HistoriaState;
  actualizarHistoria: (h: HistoriaState) => void;
  actualizarContenido: (contenido: unknown[]) => void;  // usado solo por Editor.tsx
  temaPublico: 'compacto' | 'complejo';
  cambiarTema: (t: 'compacto' | 'complejo') => Promise<void>;
}

const HISTORIA_VACIA: HistoriaState = {
  hasPast: false,
  hasFuture: false,
  back: () => {},
  forward: () => {},
};

export const EditorCtx = createContext<EditorCtxValue>({
  estadoGuardado: 'listo',
  guardar: () => {},
  abrirHistorial: () => {},
  solicitudesNuevas: 0,
  historia: HISTORIA_VACIA,
  actualizarHistoria: () => {},
  actualizarContenido: () => {},
  temaPublico: 'compacto',
  cambiarTema: async () => {},
});

/* ─── Puente: vive dentro de Puck, sincroniza historial al contexto ─ */

export function PuckBridge() {
  const { history } = usePuck();
  const { actualizarHistoria } = useContext(EditorCtx);

  useEffect(() => {
    actualizarHistoria({
      hasPast: history.hasPast,
      hasFuture: history.hasFuture,
      back: history.back,
      forward: history.forward,
    });
  // history.back/forward son estables cuando hasPast/hasFuture no cambian
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.hasPast, history.hasFuture]);

  // Espaciador que ocupa la zona de header de Puck (48 px) para que el canvas
  // comience justo debajo de nuestro header fijo externo.
  return <div style={{ height: 48, pointerEvents: 'none' }} aria-hidden="true" />;
}

/* ─── Header (position: fixed, fuera del árbol de Puck) ──────── */

const LINK: React.CSSProperties = {
  display: 'flex', alignItems: 'center', height: 30, padding: '0 9px',
  fontSize: 12, color: '#8d8d8d', textDecoration: 'none',
  borderRadius: 2, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
};

const DIVIDER: React.CSSProperties = { width: 1, height: 18, background: '#2e2e2e', flexShrink: 0 };

const estiloBoton = (activo: boolean): React.CSSProperties => ({
  width: 28, height: 28, display: 'grid', placeItems: 'center',
  background: 'transparent', color: activo ? '#c6c6c6' : '#3d3d3d',
  border: '1px solid #2e2e2e', borderRadius: 2, fontSize: 15,
  cursor: activo ? 'pointer' : 'default', lineHeight: 1, transition: 'color 100ms',
});

export default function EditorHeader() {
  const { estadoGuardado, guardar, abrirHistorial, solicitudesNuevas, historia, temaPublico, cambiarTema } = useContext(EditorCtx);
  const guardando = estadoGuardado === 'guardando';
  const [cambiandoTema, setCambiandoTema] = React.useState(false);
  const [temaConfirmado, setTemaConfirmado] = React.useState(false);

  const alternarTema = async () => {
    setCambiandoTema(true);
    setTemaConfirmado(false);
    const nuevo = temaPublico === 'compacto' ? 'complejo' : 'compacto';
    await cambiarTema(nuevo);
    setCambiandoTema(false);
    setTemaConfirmado(true);
    setTimeout(() => setTemaConfirmado(false), 3000);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#111111',
        borderBottom: '1px solid #2a2a2a',
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        padding: '0 12px 0 14px',
        gap: 8,
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Izquierda: etiqueta ── */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#555', fontSize: 12, letterSpacing: '0.02em' }}>EDITOR</span>
      </div>

      {/* ── Centro: navegación secundaria ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <a href="/ajustes" style={LINK}>Ajustes</a>

        <span style={DIVIDER} />

        {/* Toggle modo público */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px' }}>
          <span style={{ fontSize: 11, color: '#555', letterSpacing: '0.03em' }}>SITIO</span>
          <button
            type="button"
            onClick={alternarTema}
            disabled={cambiandoTema}
            title={`Cambiar a modo ${temaPublico === 'compacto' ? 'complejo' : 'compacto'}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: '#1a1a1a', border: '1px solid #333',
              borderRadius: 20, padding: 2, cursor: cambiandoTema ? 'default' : 'pointer',
              opacity: cambiandoTema ? 0.5 : 1, transition: 'opacity 150ms',
            }}
          >
            {(['compacto', 'complejo'] as const).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 16,
                  background: temaPublico === t ? (t === 'compacto' ? '#0f62fe' : '#7c3aed') : 'transparent',
                  color: temaPublico === t ? '#fff' : '#555',
                  transition: 'background 150ms, color 150ms',
                  textTransform: 'capitalize',
                  letterSpacing: '0.02em',
                }}
              >
                {t}
              </span>
            ))}
          </button>
          {temaConfirmado && (
            <span style={{ fontSize: 11, color: '#42be65' }}>✓</span>
          )}
          <a
            href="/"
            target="_blank"
            rel="noopener"
            title="Ver sitio público"
            style={{ fontSize: 13, color: '#555', textDecoration: 'none', lineHeight: 1 }}
          >
            ↗
          </a>
        </div>

        <span style={DIVIDER} />

        <PanelSolicitudes count={solicitudesNuevas} />

        <span style={DIVIDER} />

        <form method="POST" action="/api/salir" style={{ display: 'contents' }}>
          <button
            type="submit"
            title="Cerrar sesión"
            style={{ ...LINK, background: 'transparent', border: 0, color: '#555', fontSize: 17, padding: '0 8px', lineHeight: 1 }}
          >
            ⏻
          </button>
        </form>
      </div>

      {/* ── Derecha: estado + historial + undo / redo + guardar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {estadoGuardado === 'guardado' && (
          <span style={{ fontSize: 12, color: '#42be65', flexShrink: 0, marginRight: 4 }}>✓ Guardado</span>
        )}
        {estadoGuardado === 'error' && (
          <span style={{ fontSize: 12, color: '#fa4d56', flexShrink: 0, marginRight: 4 }}>✕ Error al guardar</span>
        )}

        <button
          type="button"
          onClick={abrirHistorial}
          style={{ ...LINK, background: 'transparent', border: 0, padding: '0 6px' }}
        >
          Historial
        </button>

        <span style={DIVIDER} />

        <button
          type="button"
          title="Deshacer"
          style={estiloBoton(historia.hasPast)}
          disabled={!historia.hasPast}
          onClick={() => historia.hasPast && historia.back()}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          type="button"
          title="Rehacer"
          style={estiloBoton(historia.hasFuture)}
          disabled={!historia.hasFuture}
          onClick={() => historia.hasFuture && historia.forward()}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>

        <span style={{ ...DIVIDER, margin: '0 4px' }} />

        <button
          type="button"
          disabled={guardando}
          onClick={guardar}
          style={{
            height: 32, padding: '0 20px', fontSize: 13, fontWeight: 600,
            background: guardando ? '#4d4d4d' : '#0f62fe',
            color: '#fff', border: 0, borderRadius: 2,
            cursor: guardando ? 'default' : 'pointer',
            transition: 'background 120ms', flexShrink: 0,
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </header>
  );
}
