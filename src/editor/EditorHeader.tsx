import { createContext, useContext } from 'react';
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
