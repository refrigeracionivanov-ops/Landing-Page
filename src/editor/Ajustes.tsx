import { useState } from 'react';
import CampoImagen from './CampoImagen';
import type { Ajustes as DatosAjustes, ImagenSanity } from '../tipos';

interface Props {
  ajustes: DatosAjustes;
  proyecto: string;
  dataset: string;
}

type Estado = 'listo' | 'guardando' | 'guardado' | 'error';

/**
 * Los datos del negocio, que valen para toda la pagina a la vez.
 *
 * Vive aparte del editor de secciones y no dentro de Puck: Puck ordena bloques
 * de una pagina, y esto es un documento suelto que no aparece en ningun lado y
 * a la vez esta en todos. Meterlo ahi seria pelearle a la herramienta.
 */

const ETIQUETA = 'block text-sm font-semibold text-[#161616] mb-2';
const CAMPO =
  'w-full border-0 border-b border-[#8d8d8d] bg-[#f4f4f4] px-4 py-3 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-[#0f62fe]';
const AYUDA = 'mt-2 text-xs text-[#6f6f6f]';

function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={ETIQUETA}>{etiqueta}</span>
      {children}
      {ayuda && <span className={`${AYUDA} block`}>{ayuda}</span>}
    </label>
  );
}

export default function Ajustes({ ajustes, proyecto, dataset }: Props) {
  const [datos, setDatos] = useState<DatosAjustes>({
    ...ajustes,
    franjas: ajustes.franjas?.length ? ajustes.franjas : [{ etiqueta: 'Manana (8:00 - 12:00)', cupo: 3 }],
  });
  const [estado, setEstado] = useState<Estado>('listo');
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cambiar = <C extends keyof DatosAjustes>(campo: C, valor: DatosAjustes[C]) => {
    setDatos((previos) => ({ ...previos, [campo]: valor }));
    setEstado('listo');
    setMensaje(null);
  };

  const franjas = datos.franjas ?? [];

  const cambiarFranja = (indice: number, cambios: Partial<{ etiqueta: string; cupo: number }>) =>
    cambiar(
      'franjas',
      franjas.map((franja, i) => (i === indice ? { ...franja, ...cambios } : franja)),
    );

  async function guardar() {
    setEstado('guardando');
    setMensaje(null);

    try {
      const r = await fetch('/api/ajustes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const respuesta = (await r.json()) as { ok?: boolean; error?: string };

      if (!r.ok || !respuesta.ok) throw new Error(respuesta.error ?? `El servidor respondio ${r.status}.`);

      setEstado('guardado');
      setMensaje('Guardado. Los cambios ya se ven en la pagina.');
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
    <div className="min-h-screen bg-[#f4f4f4] pb-24">
      <header className="flex items-center justify-between gap-4 border-b border-[#e0e0e0] bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <a href="/administrador" className="text-sm text-[#0f62fe] underline">
            ← Volver al editor
          </a>
          <h1 className="text-sm font-semibold text-[#161616]">Ajustes del negocio</h1>
        </div>

        <button
          type="button"
          onClick={guardar}
          disabled={estado === 'guardando'}
          style={{
            background: estado === 'guardando' ? '#8d8d8d' : '#0f62fe',
            color: 'white',
            border: 0,
            padding: '0 24px',
            height: 40,
            fontSize: 14,
            fontWeight: 600,
            cursor: estado === 'guardando' ? 'default' : 'pointer',
          }}
        >
          {estado === 'guardando' ? 'Guardando...' : 'Guardar'}
        </button>
      </header>

      {mensaje && (estado === 'guardado' || estado === 'error') && (
        <p
          role="status"
          style={{
            background: colores[estado].fondo,
            borderBottom: `1px solid ${colores[estado].borde}`,
            color: colores[estado].texto,
            padding: '8px 24px',
            fontSize: 13,
          }}
        >
          {mensaje}
        </p>
      )}

      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="mb-10 text-sm text-[#6f6f6f]">
          Lo que cambies acá se actualiza en toda la página a la vez: el encabezado, el pie, los botones de
          WhatsApp y el formulario de agendamiento.
        </p>

        <section className="mb-10 bg-white p-6">
          <h2 className="mb-6 text-base font-semibold text-[#161616]">El negocio</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <Campo etiqueta="Nombre">
              <input className={CAMPO} value={datos.nombre ?? ''} onChange={(e) => cambiar('nombre', e.target.value)} />
            </Campo>

            <Campo etiqueta="Horario de atencion" ayuda="Ej: Lunes a sabado, 8:00 a 18:00">
              <input
                className={CAMPO}
                value={datos.horario ?? ''}
                onChange={(e) => cambiar('horario', e.target.value)}
              />
            </Campo>

            <Campo etiqueta="Direccion">
              <input
                className={CAMPO}
                value={datos.direccion ?? ''}
                onChange={(e) => cambiar('direccion', e.target.value)}
              />
            </Campo>

            <Campo etiqueta="Correo">
              <input className={CAMPO} value={datos.email ?? ''} onChange={(e) => cambiar('email', e.target.value)} />
            </Campo>
          </div>

          <div className="mt-6">
            <span className={ETIQUETA}>Logo</span>
            <CampoImagen
              valor={datos.logo}
              alCambiar={(valor: ImagenSanity | undefined) => cambiar('logo', valor)}
              proyecto={proyecto}
              dataset={dataset}
            />
          </div>
        </section>

        <section className="mb-10 bg-white p-6">
          <h2 className="mb-6 text-base font-semibold text-[#161616]">Como te contactan</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <Campo etiqueta="Telefono" ayuda="Como querés que se lea. Ej: +51 999 888 777">
              <input
                className={CAMPO}
                value={datos.telefono ?? ''}
                onChange={(e) => cambiar('telefono', e.target.value)}
              />
            </Campo>

            <Campo etiqueta="WhatsApp" ayuda="Solo numeros, sin + ni espacios. Ej: 51999888777">
              <input
                className={CAMPO}
                inputMode="numeric"
                value={datos.whatsapp ?? ''}
                onChange={(e) => cambiar('whatsapp', e.target.value)}
              />
            </Campo>
          </div>

          <div className="mt-6">
            <Campo
              etiqueta="Mensaje precargado de WhatsApp"
              ayuda="Lo que aparece ya escrito cuando alguien abre el chat desde la web."
            >
              <input
                className={CAMPO}
                value={datos.mensajeWhatsapp ?? ''}
                onChange={(e) => cambiar('mensajeWhatsapp', e.target.value)}
              />
            </Campo>
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="size-4 accent-[#0f62fe]"
              checked={datos.mostrarBarraContacto !== false}
              onChange={(e) => cambiar('mostrarBarraContacto', e.target.checked)}
            />
            <span className="text-sm text-[#161616]">
              Mostrar la barra fija de "Llamar / WhatsApp" en celular
            </span>
          </label>
        </section>

        <section className="mb-10 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-[#161616]">Resenas en Google</h2>
          <p className="mb-6 text-sm text-[#6f6f6f]">
            Cuando marcas una visita como <strong>Completada</strong> en Solicitudes, aparece un boton para pedirle
            la resena a ese cliente por WhatsApp. Sin el enlace de abajo, ese boton no aparece.
          </p>

          <Campo
            etiqueta="Enlace para dejar resenas"
            ayuda="En tu perfil de negocio en Google, la opcion para pedir resenas te da un enlace corto. Pegalo tal cual."
          >
            <input
              className={CAMPO}
              placeholder="https://g.page/r/..."
              value={datos.googleResenas ?? ''}
              onChange={(e) => cambiar('googleResenas', e.target.value)}
            />
          </Campo>

          <div className="mt-6">
            <Campo
              etiqueta="Mensaje que se manda"
              ayuda="Donde escribas {nombre} se pone el nombre del cliente. El enlace se agrega solo al final."
            >
              <textarea
                className={`${CAMPO} min-h-24`}
                value={datos.mensajeResena ?? ''}
                onChange={(e) => cambiar('mensajeResena', e.target.value)}
              />
            </Campo>
          </div>
        </section>

        <section className="bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-[#161616]">Cuando recibis visitas</h2>
          <p className="mb-6 text-sm text-[#6f6f6f]">
            Estas son las opciones que ve el cliente al agendar. Cuando una franja llena su cupo para un dia, deja
            de ofrecerse sola.
          </p>

          <div className="space-y-3">
            {franjas.map((franja, indice) => (
              <div key={indice} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <span className={ETIQUETA}>Franja</span>
                  <input
                    className={CAMPO}
                    value={franja.etiqueta}
                    placeholder="Manana (8:00 - 12:00)"
                    onChange={(e) => cambiarFranja(indice, { etiqueta: e.target.value })}
                  />
                </div>

                <div className="w-32">
                  <span className={ETIQUETA}>Visitas por dia</span>
                  <input
                    className={CAMPO}
                    type="number"
                    min={1}
                    max={20}
                    value={franja.cupo}
                    onChange={(e) => cambiarFranja(indice, { cupo: Number(e.target.value) })}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    cambiar(
                      'franjas',
                      franjas.filter((_, i) => i !== indice),
                    )
                  }
                  className="h-12 px-4 text-sm text-[#da1e28] hover:underline"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          {/* La etiqueta lleva las horas a proposito: el evento de Google Calendar
              las saca de ahi. Sin horas, la visita se agenda de dia completo. */}
          <p className={AYUDA}>
            Escribí las horas dentro del nombre. De "Manana (8:00 - 12:00)" el calendario saca el horario del
            evento; si no las encuentra, lo agenda de dia completo.
          </p>

          <button
            type="button"
            onClick={() => cambiar('franjas', [...franjas, { etiqueta: '', cupo: 3 }])}
            className="mt-4 border border-[#0f62fe] px-4 py-2 text-sm text-[#0f62fe]"
          >
            Agregar franja
          </button>

          <div className="mt-8 max-w-xs">
            <Campo etiqueta="Dias minimos de anticipacion" ayuda="Con 1, lo mas pronto que alguien puede pedir es manana.">
              <input
                className={CAMPO}
                type="number"
                min={0}
                max={30}
                value={datos.diasAnticipacion ?? 1}
                onChange={(e) => cambiar('diasAnticipacion', Number(e.target.value))}
              />
            </Campo>
          </div>
        </section>
      </div>
    </div>
  );
}
