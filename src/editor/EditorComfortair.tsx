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
  const [temaPublico, setTemaPublico] = useState<'compacto' | 'complejo'>(ajustes.tema ?? 'complejo');
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
        }),
      });
      const datos = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !datos.ok) throw new Error(datos.error ?? `Error ${r.status}`);
      setEstadoGuardado('guardado');
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
    temaPublico,
    cambiarTema,
  }), [estadoGuardado, guardar, solicitudesNuevas, historia, temaPublico, cambiarTema]);

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
          onChange={(data: any) => { contenidoRef.current = data.content; }}
        />
      </div>

      {verHistorial && <Historial alCerrar={() => setVerHistorial(false)} />}
    </EditorCtx.Provider>
  );
}
