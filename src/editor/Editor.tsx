import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { configuracion } from './configuracion';
import Historial from './Historial';
import { traducirInterfaz } from './traducciones';
import { deSanityAPuck } from './adaptador';
import type { Ajustes, Bloque } from '../tipos';
import EditorHeader, { EditorCtx, type EstadoGuardado } from './EditorHeader';

interface Props {
  secciones: Bloque[];
  ajustes: Ajustes;
  distritos: string[];
}

export default function Editor({ secciones, ajustes, distritos }: Props) {
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>('listo');
  const [verHistorial, setVerHistorial] = useState(false);
  const [solicitudesNuevas, setSolicitudesNuevas] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);

  // Puck viene en ingles. Ver `traducciones.ts`.
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

  const guardar = useCallback(async (bloquesNuevos: Bloque[]) => {
    setEstadoGuardado('guardando');
    try {
      const r = await fetch('/api/guardar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secciones: bloquesNuevos }),
      });
      const datos = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !datos.ok) throw new Error(datos.error ?? `Error ${r.status}`);
      setEstadoGuardado('guardado');
      // Vuelve a "listo" después de 3s para no ocupar espacio innecesariamente.
      setTimeout(() => setEstadoGuardado('listo'), 3000);
    } catch {
      setEstadoGuardado('error');
    }
  }, []);

  // El contexto que comparte el estado del editor con EditorHeader (que vive dentro de Puck).
  const ctxValue = useMemo(() => ({
    estadoGuardado,
    guardar,
    abrirHistorial: () => setVerHistorial(true),
    solicitudesNuevas,
  }), [estadoGuardado, guardar, solicitudesNuevas]);

  // La identidad del header override debe ser estable para que Puck no
  // desmonte y vuelva a montar el componente en cada render de Editor.
  const headerOverride = useMemo(() => () => <EditorHeader />, []);

  return (
    <EditorCtx.Provider value={ctxValue}>
      <div ref={contenedor} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Puck
          config={configuracion}
          data={deSanityAPuck(secciones) as any}
          metadata={{ ajustes, distritos }}
          overrides={{ header: headerOverride }}
          initialUi={{ iframe: { enabled: false } }}
        />
      </div>

      {verHistorial && <Historial alCerrar={() => setVerHistorial(false)} />}
    </EditorCtx.Provider>
  );
}
