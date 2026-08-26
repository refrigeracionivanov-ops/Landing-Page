import { useEffect, useRef, useState } from 'react';
import { Puck, usePuck } from '@measured/puck';
import '@measured/puck/puck.css';
import { configuracion } from './configuracion';
import Historial from './Historial';
import { traducirInterfaz } from './traducciones';
import { deSanityAPuck, dePuckASanity } from './adaptador';
import type { Ajustes, Bloque } from '../tipos';

interface Props {
  secciones: Bloque[];
  ajustes: Ajustes;
  distritos: string[];
}

type Estado = 'listo' | 'guardando' | 'guardado' | 'error';

/**
 * El unico boton del editor. Reemplaza la barra de acciones que trae Puck,
 * que ofrece "Publish" en ingles junto a otras opciones.
 */
function BotonGuardar({ alGuardar, estado }: { alGuardar: (secciones: Bloque[]) => void; estado: Estado }) {
  const { appState } = usePuck();
  const guardando = estado === 'guardando';

  return (
    <button
      type="button"
      disabled={guardando}
      onClick={() => alGuardar(dePuckASanity(appState.data.content as any))}
      style={{
        background: guardando ? '#8d8d8d' : '#0f62fe',
        color: 'white',
        border: 0,
        padding: '0 24px',
        height: 40,
        fontSize: 14,
        fontWeight: 600,
        cursor: guardando ? 'default' : 'pointer',
      }}
    >
      {guardando ? 'Guardando...' : 'Guardar'}
    </button>
  );
}

export default function Editor({ secciones, ajustes, distritos }: Props) {
  const [estado, setEstado] = useState<Estado>('listo');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [verHistorial, setVerHistorial] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const [solicitudesNuevas, setSolicitudesNuevas] = useState(0);

  // Puck viene en ingles y no se puede configurar. Ver `traducciones.ts`.
  useEffect(() => (contenedor.current ? traducirInterfaz(contenedor.current) : undefined), []);

  useEffect(() => {
    const consultar = async () => {
      try {
        const r = await fetch('/api/nuevas');
        if (r.ok) {
          const datos = (await r.json()) as { total: number };
          setSolicitudesNuevas(datos.total);
        }
      } catch { /* silencioso: el editor no debe romperse si falla */ }
    };
    consultar();
    const intervalo = setInterval(consultar, 30_000);
    return () => clearInterval(intervalo);
  }, []);

  async function guardar(secciones: Bloque[]) {
    setEstado('guardando');
    setMensaje(null);

    try {
      const r = await fetch('/api/guardar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secciones }),
      });
      const datos = (await r.json()) as { ok?: boolean; secciones?: number; error?: string };

      if (!r.ok || !datos.ok) throw new Error(datos.error ?? `El servidor respondio ${r.status}.`);

      setEstado('guardado');
      setMensaje(`Guardado. ${datos.secciones} secciones publicadas.`);
    } catch (error) {
      setEstado('error');
      setMensaje(error instanceof Error ? error.message : 'No se pudo guardar.');
    }
  }

  const colores = {
    guardado: { fondo: '#defbe6', borde: '#24a148', texto: '#0e6027' },
    error: { fondo: '#fff1f1', borde: '#da1e28', texto: '#a2191f' },
  } as const;

  return (
    <>
      {mensaje && (estado === 'guardado' || estado === 'error') && (
        <div
          style={{
            background: colores[estado].fondo,
            borderBottom: `1px solid ${colores[estado].borde}`,
            padding: '8px 16px',
            fontSize: 13,
            color: colores[estado].texto,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <span>{mensaje}</span>
          <button
            type="button"
            onClick={() => setMensaje(null)}
            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit', fontSize: 13 }}
          >
            Cerrar
          </button>
        </div>
      )}

      <div ref={contenedor} style={{ height: mensaje ? 'calc(100vh - 33px)' : '100vh' }}>
        <Puck
          config={configuracion}
          data={deSanityAPuck(secciones) as any}
          metadata={{ ajustes, distritos }}
          headerTitle="Inicio"
          renderHeaderActions={() => (
            <>
              <a
                href="/solicitudes?estado=nueva"
                style={{
                  alignSelf: 'center',
                  marginRight: 16,
                  fontSize: 14,
                  color: solicitudesNuevas > 0 ? '#da1e28' : '#525252',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {solicitudesNuevas > 0 && (
                  <span style={{
                    background: '#da1e28',
                    color: 'white',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}>
                    {solicitudesNuevas > 9 ? '9+' : solicitudesNuevas}
                  </span>
                )}
                Solicitudes
              </a>
              <a
                href="https://calendar.google.com/"
                target="_blank"
                rel="noopener"
                style={{ alignSelf: 'center', marginRight: 16, fontSize: 14, color: '#525252', textDecoration: 'none' }}
              >
                Google Calendar
              </a>
              <button
                type="button"
                onClick={() => setVerHistorial(true)}
                style={{
                  alignSelf: 'center',
                  marginRight: 16,
                  fontSize: 14,
                  color: '#0f62fe',
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Versiones anteriores
              </button>
              <a
                href="/ajustes"
                style={{ alignSelf: 'center', marginRight: 16, fontSize: 14, color: '#0f62fe' }}
              >
                Ajustes
              </a>
              <BotonGuardar alGuardar={guardar} estado={estado} />
            </>
          )}
        />
      </div>

      {verHistorial && <Historial alCerrar={() => setVerHistorial(false)} />}
    </>
  );
}
