import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { configuracion } from './configuracion';
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

export default function Editor({ secciones, ajustes, distritos }: Props) {
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>('listo');
  const [verHistorial, setVerHistorial] = useState(false);
  const [solicitudesNuevas, setSolicitudesNuevas] = useState(0);
  const [historia, setHistoria] = useState({
    hasPast: false,
    hasFuture: false,
    back: () => {},
    forward: () => {},
  });

  // Contenido actualizado por PuckBridge en cada cambio del editor.
  const datosIniciales = useMemo(() => deSanityAPuck(secciones), []);
  const contenidoRef = useRef<unknown[]>(datosIniciales.content);

  const contenedor = useRef<HTMLDivElement>(null);

  // Puck viene en inglés. Ver `traducciones.ts`.
  useEffect(() => (contenedor.current ? traducirInterfaz(contenedor.current) : undefined), []);

  // Badge de solicitudes nuevas: polling cada 30s.
  useEffect(() => {
    const consultar = async () => {
      try {
        const r = await fetch('/api/nuevas');
        if (r.ok) {
          const datos = (await r.json()) as { total: number };
          setSolicitudesNuevas(datos.total);
        }
      } catch { /* silencioso */ }
    };
    consultar();
    const intervalo = setInterval(consultar, 30_000);
    return () => clearInterval(intervalo);
  }, []);

  const guardar = useCallback(async () => {
    setEstadoGuardado('guardando');
    try {
      const r = await fetch('/api/guardar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secciones: dePuckASanity(contenidoRef.current as any) }),
      });
      const datos = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !datos.ok) throw new Error(datos.error ?? `Error ${r.status}`);
      setEstadoGuardado('guardado');
      setTimeout(() => setEstadoGuardado('listo'), 3000);
    } catch {
      setEstadoGuardado('error');
    }
  }, []);

  const actualizarContenido = useCallback((c: unknown[]) => {
    contenidoRef.current = c;
  }, []);

  const ctxValue = useMemo(() => ({
    estadoGuardado,
    guardar,
    abrirHistorial: () => setVerHistorial(true),
    solicitudesNuevas,
    historia,
    actualizarHistoria: setHistoria,
    actualizarContenido,
  }), [estadoGuardado, guardar, solicitudesNuevas, historia, actualizarContenido]);

  // La identidad del bridge override debe ser estable para que Puck no
  // desmonte y vuelva a montar el componente en cada render de Editor.
  const headerOverride = useMemo(() => () => <PuckBridge />, []);

  return (
    <EditorCtx.Provider value={ctxValue}>
      {/* Header fijo: vive fuera de Puck para no quedar atrapado en su stacking context */}
      <EditorHeader />

      <div ref={contenedor} style={{ height: '100vh' }}>
        <Puck
          config={configuracion}
          data={datosIniciales as any}
          metadata={{ ajustes, distritos }}
          overrides={{ header: headerOverride }}
          initialUi={{ iframe: { enabled: false } }}
        />
      </div>

      {verHistorial && <Historial alCerrar={() => setVerHistorial(false)} />}
    </EditorCtx.Provider>
  );
}
