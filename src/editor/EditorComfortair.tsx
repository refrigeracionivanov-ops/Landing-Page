import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { configuracionComfortair } from './configuracion-comfortair';
import Historial from './Historial';
import { traducirInterfaz } from './traducciones';
import { deSanityAPuck, dePuckASanity } from './adaptador';
import type { Ajustes, Bloque } from '../tipos';
import EditorHeader, { EditorCtx, PuckBridge, type EstadoGuardado } from './EditorHeader';

interface Props {
  secciones: Bloque[];
  ajustes: Ajustes;
  distritos: string[];
}

export default function EditorComfortair({ secciones, ajustes, distritos }: Props) {
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>('listo');
  const [verHistorial, setVerHistorial] = useState(false);
  const [solicitudesNuevas, setSolicitudesNuevas] = useState(0);
  const [hayPendientes, setHayPendientes] = useState(false);
  const [temaPublico, setTemaPublico] = useState<'compacto' | 'complejo'>('complejo');
  const [historia, setHistoria] = useState({
    hasPast: false,
    hasFuture: false,
    back: () => {},
    forward: () => {},
  });

  const datosIniciales = useMemo(() => deSanityAPuck(secciones), []);
  const contenidoRef = useRef<unknown[]>(datosIniciales.content);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => (contenedor.current ? traducirInterfaz(contenedor.current) : undefined), []);

  // Badge de solicitudes nuevas: SSE en tiempo real (reconecta automáticamente).
  useEffect(() => {
    let es: EventSource | null = null;

    const conectar = () => {
      es = new EventSource('/api/solicitudes-sse');
      es.onmessage = (e) => {
        try {
          const datos = JSON.parse(e.data as string) as { total: number };
          setSolicitudesNuevas(datos.total);
        } catch { /* silencioso */ }
      };
    };

    conectar();
    return () => es?.close();
  }, []);

  const cambiarTema = useCallback(async (nuevo: 'compacto' | 'complejo') => {
    await fetch('/api/tema', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tema: nuevo }),
    });
    setTemaPublico(nuevo);
  }, []);

  const guardar = useCallback(async () => {
    setEstadoGuardado('guardando');
    try {
      const r = await fetch('/api/guardar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          secciones: dePuckASanity(contenidoRef.current as any),
          pagina: 'comfortair',
          tema: 'complejo',
        }),
      });
      const datos = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !datos.ok) throw new Error(datos.error ?? `Error ${r.status}`);
      // Publicar el tema solo al guardar explícitamente, nunca al cambiar el selector.
      await fetch('/api/tema', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tema: 'complejo' }),
      });
      setEstadoGuardado('guardado');
      setHayPendientes(false);
      setTimeout(() => setEstadoGuardado('listo'), 3000);
    } catch {
      setEstadoGuardado('error');
    }
  }, []);

  const ctxValue = useMemo(() => ({
    estadoGuardado,
    guardar,
    abrirHistorial: () => setVerHistorial(true),
    solicitudesNuevas,
    historia,
    actualizarHistoria: setHistoria,
    actualizarContenido: (c: unknown[]) => { contenidoRef.current = c; },
    hayPendientes,
    temaPublico,
    cambiarTema,
  }), [estadoGuardado, guardar, solicitudesNuevas, historia, hayPendientes, temaPublico, cambiarTema]);

  const headerOverride = useMemo(() => () => <PuckBridge />, []);

  return (
    <EditorCtx.Provider value={ctxValue}>
      <EditorHeader />

      <div ref={contenedor} style={{ height: '100vh' }}>
        <Puck
          config={configuracionComfortair}
          data={datosIniciales as any}
          metadata={{ ajustes, distritos }}
          overrides={{ header: headerOverride }}
          initialUi={{ iframe: { enabled: false } }}
          onChange={(data: any) => { contenidoRef.current = data.content; setHayPendientes(true); }}
        />
      </div>

      {verHistorial && <Historial alCerrar={() => setVerHistorial(false)} />}
    </EditorCtx.Provider>
  );
}
