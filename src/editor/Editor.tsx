import { useEffect, useRef, useState } from 'react';
import { Puck, usePuck } from '@measured/puck';
import '@measured/puck/puck.css';
import { configuracion } from './configuracion';
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
  const contenedor = useRef<HTMLDivElement>(null);

  // Puck viene en ingles y no se puede configurar. Ver `traducciones.ts`.
  useEffect(() => (contenedor.current ? traducirInterfaz(contenedor.current) : undefined), []);

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
              {/* Los datos del negocio se editan aparte: no son de esta pagina,
                  valen para todas. Ver src/pages/ajustes.astro. */}
              <a
                href="/ajustes"
                style={{ alignSelf: 'center', marginRight: 16, fontSize: 14, color: '#0f62fe' }}
              >
                Ajustes del negocio
              </a>
              <BotonGuardar alGuardar={guardar} estado={estado} />
            </>
          )}
        />
      </div>

    </>
  );
}
