import { createContext, useContext, useRef, useState } from 'react';
import { createUsePuck, usePuck } from '@measured/puck';
import PanelSolicitudes from './PanelSolicitudes';
import { dePuckASanity } from './adaptador';
import type { Bloque } from '../tipos';

/* ─── Contexto compartido con Editor.tsx ──────────────────────── */

export type EstadoGuardado = 'listo' | 'guardando' | 'guardado' | 'error';

interface EditorCtxValue {
  estadoGuardado: EstadoGuardado;
  guardar: (secciones: Bloque[]) => void;
  abrirHistorial: () => void;
  solicitudesNuevas: number;
}

export const EditorCtx = createContext<EditorCtxValue>({
  estadoGuardado: 'listo',
  guardar: () => {},
  abrirHistorial: () => {},
  solicitudesNuevas: 0,
});

/* ─── Selector de contenido (nivel de módulo para estabilidad) ── */

const useContenido = createUsePuck((s) => s.state.data.content);

/* ─── Botón Guardar ─────────────────────────────────────────── */

function BotonGuardar() {
  const { estadoGuardado, guardar } = useContext(EditorCtx);
  const contenido = useContenido();
  const guardando = estadoGuardado === 'guardando';

  return (
    <button
      type="button"
      disabled={guardando}
      onClick={() => guardar(dePuckASanity(contenido as any))}
      style={{
        height: 32,
        padding: '0 20px',
        fontSize: 13,
        fontWeight: 600,
        background: guardando ? '#4d4d4d' : '#0f62fe',
        color: '#fff',
        border: 0,
        borderRadius: 2,
        cursor: guardando ? 'default' : 'pointer',
        transition: 'background 120ms',
        flexShrink: 0,
      }}
    >
      {guardando ? 'Guardando...' : 'Guardar'}
    </button>
  );
}

/* ─── Botones undo / redo ────────────────────────────────────── */

function ControlesHistorial() {
  // usePuck().history expone hasPast/hasFuture/back/forward correctamente envueltos.
  // createUsePuck selecciona el slice crudo del store (histories[], index) que no
  // tiene esas funciones, causando un crash al llamar historia.hasPast().
  const { history } = usePuck();
  const puedoAtras = history.hasPast();
  const puedoAdelante = history.hasFuture();

  const estiloBoton = (activo: boolean): React.CSSProperties => ({
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    color: activo ? '#c6c6c6' : '#4d4d4d',
    border: '1px solid #393939',
    borderRadius: 2,
    fontSize: 16,
    cursor: activo ? 'pointer' : 'default',
    lineHeight: 1,
    transition: 'color 100ms',
  });

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <button
        type="button"
        title="Deshacer"
        style={estiloBoton(puedoAtras)}
        disabled={!puedoAtras}
        onClick={() => puedoAtras && history.back()}
      >
        ←
      </button>
      <button
        type="button"
        title="Rehacer"
        style={estiloBoton(puedoAdelante)}
        disabled={!puedoAdelante}
        onClick={() => puedoAdelante && history.forward()}
      >
        →
      </button>
    </div>
  );
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
    width: '100%',
    height: 36,
    padding: '0 10px',
    fontSize: 13,
    background: '#262626',
    border: '1px solid #393939',
    borderBottom: '1px solid #6f6f6f',
    color: '#f4f4f4',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      ref={fondoRef}
      onClick={(e) => { if (e.target === fondoRef.current) alCerrar(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'grid', placeItems: 'center', zIndex: 10000,
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
            <label style={{ display: 'block', color: '#a8a8a8', fontSize: 11, marginBottom: 4 }}>
              Clave actual
            </label>
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

          <button
            type="submit"
            disabled={estado === 'enviando' || estado === 'ok'}
            style={{
              height: 36, fontSize: 13, fontWeight: 600,
              background: estado === 'ok' ? '#24a148' : '#0f62fe',
              color: '#fff', border: 0, cursor: estado === 'enviando' ? 'default' : 'pointer',
              opacity: estado === 'enviando' ? 0.7 : 1, transition: 'background 120ms',
            }}
          >
            {estado === 'enviando' ? 'Guardando...' : estado === 'ok' ? 'Guardado ✓' : 'Cambiar clave'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────────────── */

const LINK: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 32,
  padding: '0 10px',
  fontSize: 13,
  color: '#8d8d8d',
  textDecoration: 'none',
  borderRadius: 2,
  cursor: 'pointer',
  flexShrink: 0,
  whiteSpace: 'nowrap',
};

const DIVIDER: React.CSSProperties = {
  width: 1,
  height: 20,
  background: '#393939',
  flexShrink: 0,
};

export default function EditorHeader() {
  const { abrirHistorial, solicitudesNuevas, estadoGuardado } = useContext(EditorCtx);
  const [verClave, setVerClave] = useState(false);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        padding: '0 12px 0 16px',
        background: '#161616',
        borderBottom: '1px solid #262626',
        gap: 8,
        flexShrink: 0,
        userSelect: 'none',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* ── Izquierda: undo / redo + título ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ControlesHistorial />
        <span style={DIVIDER} />
        <span style={{ color: '#4d4d4d', fontSize: 13 }}>Inicio</span>
      </div>

      {/* ── Derecha: nav ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PanelSolicitudes count={solicitudesNuevas} />

        <span style={DIVIDER} />

        <a
          href="https://calendar.google.com/"
          target="_blank"
          rel="noopener"
          style={LINK}
        >
          Calendario
        </a>

        <a href="/ajustes" style={LINK}>
          Ajustes
        </a>

        <button
          type="button"
          onClick={abrirHistorial}
          style={{ ...LINK, background: 'transparent', border: 0 }}
        >
          Historial
        </button>

        <button
          type="button"
          title="Cambiar clave"
          onClick={() => setVerClave(true)}
          style={{ ...LINK, background: 'transparent', border: 0 }}
        >
          Clave
        </button>

        <span style={DIVIDER} />

        <form method="POST" action="/api/salir" style={{ display: 'contents' }}>
          <button
            type="submit"
            title="Cerrar sesión"
            style={{
              ...LINK,
              background: 'transparent',
              border: 0,
              color: '#6f6f6f',
              fontSize: 18,
              padding: '0 8px',
              lineHeight: 1,
            }}
          >
            ⏻
          </button>
        </form>

        {verClave && <ModalClave alCerrar={() => setVerClave(false)} />}

        <span style={DIVIDER} />

        {estadoGuardado === 'guardado' && (
          <span style={{ fontSize: 12, color: '#42be65', padding: '0 6px', flexShrink: 0 }}>
            Guardado
          </span>
        )}
        {estadoGuardado === 'error' && (
          <span style={{ fontSize: 12, color: '#fa4d56', padding: '0 6px', flexShrink: 0 }}>
            Error al guardar
          </span>
        )}

        <BotonGuardar />
      </div>
    </header>
  );
}
