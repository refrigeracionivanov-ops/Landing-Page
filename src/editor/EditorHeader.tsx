import { createContext, useContext, useEffect, useRef, useState } from 'react';
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

/* ─── Modal cambio de clave ─────────────────────────────────── */

type EstadoModal = 'listo' | 'enviando' | 'ok' | 'error';

function ModalClave({ alCerrar }: { alCerrar: () => void }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [estado, setEstado] = useState<EstadoModal>('listo');
  const [mensaje, setMensaje] = useState('');
  const fondoRef = useRef<HTMLDivElement>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (nueva !== confirmar) {
      setMensaje('Las claves nuevas no coinciden.');
      setEstado('error');
      return;
    }
    setEstado('enviando');
    setMensaje('');
    try {
      const r = await fetch('/api/cambiar-clave', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ claveActual: actual, claveNueva: nueva }),
      });
      const datos = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !datos.ok) {
        setMensaje(datos.error ?? 'Error desconocido.');
        setEstado('error');
      } else {
        setEstado('ok');
        setMensaje('Clave cambiada correctamente.');
        setActual(''); setNueva(''); setConfirmar('');
        setTimeout(alCerrar, 1500);
      }
    } catch {
      setMensaje('No se pudo conectar.');
      setEstado('error');
    }
  }

  const campo: React.CSSProperties = {
    width: '100%', height: 36, padding: '0 10px', fontSize: 13,
    background: '#262626', border: '1px solid #393939',
    borderBottom: '1px solid #6f6f6f', color: '#f4f4f4',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div
      ref={fondoRef}
      onClick={(e) => { if (e.target === fondoRef.current) alCerrar(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'grid', placeItems: 'center', zIndex: 20000,
      }}
    >
      <div style={{
        background: '#161616', border: '1px solid #393939',
        width: 'min(360px, 90vw)', padding: 24, display: 'grid', gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#f4f4f4', fontSize: 14, fontWeight: 600 }}>Cambiar clave</span>
          <button type="button" onClick={alCerrar}
            style={{ background: 'transparent', border: 0, color: '#8d8d8d', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>
            ×
          </button>
        </div>

        <form onSubmit={enviar} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', color: '#a8a8a8', fontSize: 11, marginBottom: 4 }}>Clave actual</label>
            <input type="password" required value={actual} onChange={e => setActual(e.target.value)}
              autoComplete="current-password" style={campo} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#a8a8a8', fontSize: 11, marginBottom: 4 }}>
              Clave nueva (mín. 8 caracteres)
            </label>
            <input type="password" required minLength={8} value={nueva} onChange={e => setNueva(e.target.value)}
              autoComplete="new-password" style={campo} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#a8a8a8', fontSize: 11, marginBottom: 4 }}>
              Confirmar clave nueva
            </label>
            <input type="password" required value={confirmar} onChange={e => setConfirmar(e.target.value)}
              autoComplete="new-password" style={campo} />
          </div>

          {mensaje && (
            <p style={{ margin: 0, fontSize: 12, color: estado === 'ok' ? '#42be65' : '#fa4d56' }}>
              {mensaje}
            </p>
          )}

          <button type="submit" disabled={estado === 'enviando' || estado === 'ok'}
            style={{
              height: 36, fontSize: 13, fontWeight: 600,
              background: estado === 'ok' ? '#24a148' : '#0f62fe',
              color: '#fff', border: 0, cursor: estado === 'enviando' ? 'default' : 'pointer',
              opacity: estado === 'enviando' ? 0.7 : 1, transition: 'background 120ms',
            }}>
            {estado === 'enviando' ? 'Guardando...' : estado === 'ok' ? 'Guardado ✓' : 'Cambiar clave'}
          </button>
        </form>
      </div>
    </div>
  );
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
  const { estadoGuardado, guardar, abrirHistorial, solicitudesNuevas, historia } = useContext(EditorCtx);
  const [verClave, setVerClave] = useState(false);
  const guardando = estadoGuardado === 'guardando';

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
      {/* ── Izquierda: undo / redo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button
            type="button"
            title="Deshacer"
            style={estiloBoton(historia.hasPast)}
            disabled={!historia.hasPast}
            onClick={() => historia.hasPast && historia.back()}
          >←</button>
          <button
            type="button"
            title="Rehacer"
            style={estiloBoton(historia.hasFuture)}
            disabled={!historia.hasFuture}
            onClick={() => historia.hasFuture && historia.forward()}
          >→</button>
        </div>
        <span style={DIVIDER} />
        <span style={{ color: '#555', fontSize: 12, letterSpacing: '0.02em' }}>EDITOR</span>
      </div>

      {/* ── Centro: navegación secundaria ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          type="button"
          onClick={abrirHistorial}
          style={{ ...LINK, background: 'transparent', border: 0 }}
        >
          Historial
        </button>

        <a href="/ajustes" style={LINK}>Ajustes</a>

        <span style={DIVIDER} />

        <PanelSolicitudes count={solicitudesNuevas} />

        <span style={DIVIDER} />

        <button
          type="button"
          title="Cambiar clave"
          onClick={() => setVerClave(true)}
          style={{ ...LINK, background: 'transparent', border: 0 }}
        >
          Clave
        </button>

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

      {/* ── Derecha: estado + guardar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {estadoGuardado === 'guardado' && (
          <span style={{ fontSize: 12, color: '#42be65', flexShrink: 0 }}>✓ Guardado</span>
        )}
        {estadoGuardado === 'error' && (
          <span style={{ fontSize: 12, color: '#fa4d56', flexShrink: 0 }}>✕ Error al guardar</span>
        )}
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

      {verClave && <ModalClave alCerrar={() => setVerClave(false)} />}
    </header>
  );
}
